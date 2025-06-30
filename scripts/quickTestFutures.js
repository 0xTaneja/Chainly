// npx hardhat run scripts/quickTestFutures.js --network sepolia
require("dotenv").config();
const hre = require("hardhat");

/******************************************************
 * QUICK FUNCTIONAL TEST FOR AttentionFutures
 * ----------------------------------------------------
 * 1. Opens a PEPE long with 5× leverage
 * 2. Adds extra collateral
 * 3. Logs healthFactor and PnL
 * ----------------------------------------------------
 * .env requirements:
 *   FUTURES_ADDR = 0x...  (deployed AttentionFutures)
 *   ORACLE_TOKEN = PEPE   (symbol string, default PEPE)
 ******************************************************/

const FUTURES_ADDR = process.env.FUTURES_ADDR;
const ORACLE_ADDR  = process.env.ORACLE_ADDR;   // same as used in deploy script
const SUB_ID       = process.env.SUB_ID;        // Functions subscription id (uint64)
const SLOT_ID      = process.env.SLOT_ID || 0;  // secrets slot
const SEC_VERSION  = process.env.SEC_VERSION;   // secrets version
const TOKEN        = process.env.ORACLE_TOKEN; // must be set explicitly – no default
const LEVERAGE     = 5;
const COLLATERAL   = process.env.COLLATERAL   || "0.02"; // ETH sent on open
const EXTRA_COLL   = process.env.EXTRA_COLL || "0.01"; // ETH added later
const BREAKER_ADDR   = process.env.CIRCUIT_BRK;   // CircuitBreaker contract
const REFRESHER_ADDR = process.env.DATA_REF_ADDR; // DataRefresher contract

async function main () {
  if (!FUTURES_ADDR) throw new Error("Set FUTURES_ADDR in .env");
  if (!ORACLE_ADDR)  throw new Error("Set ORACLE_ADDR in .env");
  if (!TOKEN)        throw new Error("Set ORACLE_TOKEN in .env (e.g. BTC, PEPE)");

  const [user] = await hre.ethers.getSigners();
  console.log("Using signer:", user.address);

  const fut = await hre.ethers.getContractAt("AttentionFutures", FUTURES_ADDR, user);
  const oracle = await hre.ethers.getContractAt("AttentionOracle", ORACLE_ADDR, user);

  //--------------------------------------------------
  // 0. Ensure fresh oracle data
  //--------------------------------------------------
  const fresh = await oracle.isDataFresh(TOKEN);
  if (!fresh) {
    if (!SUB_ID || !SEC_VERSION) throw new Error("Oracle data stale; set SUB_ID and SEC_VERSION in .env to fetch.");
    console.log("Oracle data stale → requesting update …");

    // Signer must be the Oracle owner on Sepolia – no impersonation possible
    const ownerAddr = await oracle.owner();
    if (ownerAddr.toLowerCase() !== user.address.toLowerCase()) {
      throw new Error(`Signer (${user.address}) is not Oracle owner (${ownerAddr}). Export the owner's PRIVATE_KEY to run this test on Sepolia.`);
    }

    // 1. Register listener *before* request to avoid race conditions
    const filter = oracle.filters.AttentionUpdated(TOKEN);
    const waitEvent = new Promise((resolve) => {
      oracle.once(filter, (tok, score, ts) => {
        console.log(`AttentionUpdated → ${tok} ${score.toString()} at ${ts}`);
        resolve();
      });
    });

    // 2. Send the Functions request (live network)
    const reqTx = await oracle.requestAttentionData(
      TOKEN,
      SUB_ID,
      SLOT_ID,
      SEC_VERSION
    );
    console.log("Sent Functions request:", reqTx.hash);
    await reqTx.wait(1); // wait 1 confirmation

    // 3. Wait for the AttentionUpdated event emitted by the DON callback
    console.log("Waiting for AttentionUpdated event (Functions round-trip, may take 1-2 min) …");
    await waitEvent;
  }

  //--------------------------------------------------
  // 1. Open position
  //--------------------------------------------------
  console.log("Opening position …");
  const tx1 = await fut.openPosition(
    TOKEN,
    true,          // isLong
    LEVERAGE,
    { value: hre.ethers.parseEther(COLLATERAL) }
  );
  const rc1 = await tx1.wait();
  const id = rc1.logs
    .map(l => fut.interface.parseLog(l))
    .find(pl => pl.name === "PositionOpened").args.id;
  console.log(`Position #${id} opened ✅`);

  //--------------------------------------------------
  // 2. Add collateral
  //--------------------------------------------------
  console.log("Adding extra collateral …");
  await (await fut.addCollateral(id, { value: hre.ethers.parseEther(EXTRA_COLL) })).wait();

  //--------------------------------------------------
  // 3. Read health factor & PnL
  //--------------------------------------------------
  const hf  = await fut.healthFactor(id);
  const pnl = await fut.calcPnl(id);
  console.log("Health factor (%):", Number(hf) / 1e16);
  console.log("Current PnL (wei):", pnl.toString());

  //--------------------------------------------------
  // 4. Circuit-breaker pause / resume flow
  //--------------------------------------------------
  if (!BREAKER_ADDR) throw new Error("Set BREAKER_ADDR in .env");
  if (!REFRESHER_ADDR) throw new Error("Set REFRESHER_ADDR in .env");

  const breaker   = await hre.ethers.getContractAt("CircuitBreaker", BREAKER_ADDR, user);
  const refresher = await hre.ethers.getContractAt("DataRefresher", REFRESHER_ADDR, user);

  // ------------------------------------------------------------------
  // Sanity-check: CircuitBreaker must monitor the same token we trade
  // ------------------------------------------------------------------
  const cbToken = await breaker.token();
  if (cbToken !== TOKEN) {
    throw new Error(
      `Token mismatch: CircuitBreaker monitors "${cbToken}" but test uses "${TOKEN}". ` +
      "Deploy a new breaker with CB_TOKEN=" + TOKEN + " or set ORACLE_TOKEN=" + cbToken
    );
  }

  // Ensure CircuitBreaker is the owner of Futures so it can pause/unpause
  const futOwner = await fut.owner();
  if (futOwner.toLowerCase() !== BREAKER_ADDR.toLowerCase()) {
    console.log("Transferring Futures ownership to CircuitBreaker …");
    // signer must currently own the futures contract
    if (futOwner.toLowerCase() !== user.address.toLowerCase()) {
      throw new Error(`Current Futures owner ${futOwner} is not the signer; cannot transfer`);
    }
    await (await fut.transferOwnership(BREAKER_ADDR)).wait();
    console.log("Ownership transferred ✅");
  }

  // Signer must be CircuitBreaker owner on Sepolia
  const breakerOwner = await breaker.owner();
  if (breakerOwner.toLowerCase() !== user.address.toLowerCase()) {
    throw new Error(`Signer (${user.address}) is not CircuitBreaker owner (${breakerOwner}). Export correct key.`);
  }
  const breakerCaller = breaker;

  console.log("\nConfiguring CircuitBreaker (maxAge→1s) …");
  await (await breakerCaller.setMaxDataAge(1)).wait();

  console.log("Advancing time by 15 seconds … (so a new Sepolia block mines)");
  await new Promise((r) => setTimeout(r, 15000));

  const [, tsBefore] = await oracle.getAttentionScore(TOKEN);
  const nowBlk = await hre.ethers.provider.getBlock("latest");
  const nowTs = BigInt(nowBlk.timestamp);
  const diff  = nowTs - BigInt(tsBefore);
  console.log(`Oracle ts: ${tsBefore} | now: ${nowBlk.timestamp} | diff: ${diff} sec`);

  const [upkeepNeeded] = await breaker.checkUpkeep("0x");
  console.log("breaker.checkUpkeep ->", upkeepNeeded);

  console.log("Calling performUpkeep to PAUSE trading …");
  await (await breakerCaller.performUpkeep("0x")).wait();
  if (!(await fut.paused())) throw new Error("❌ CircuitBreaker failed to pause Futures");
  console.log("Futures paused ✅");

  console.log("Verifying openPosition reverts while paused …");
  let reverted = false;
  try {
    await fut.openPosition(
      TOKEN,
      true,
      LEVERAGE,
      { value: hre.ethers.parseEther("0.02") }
    );
  } catch (e) { reverted = true; }
  if (!reverted) throw new Error("❌ openPosition did NOT revert while paused");
  console.log("Revert confirmed ✅");

  //--------------------------------------------------
  // 5. Refresh data & resume trading
  //--------------------------------------------------
  console.log("Triggering DataRefresher (maxAge→1s) …");
  await (await refresher.setMaxAge(1)).wait();
  await (await refresher.performUpkeep("0x")).wait();
  console.log("DataRefresher upkeep executed (Functions request queued) ✅");

  console.log("Restoring CircuitBreaker maxAge→3600 and UNPAUSE …");
  await (await breakerCaller.setMaxDataAge(3600)).wait();
  await (await breakerCaller.performUpkeep("0x")).wait();
  if (await fut.paused()) throw new Error("❌ Futures still paused after resume");
  console.log("Futures resumed ✅");

  console.log("Running performUpkeep again (should be no-op) …");
  await (await breakerCaller.performUpkeep("0x")).wait();
  console.log("No-op upkeep executed ✅");

  console.log("All smoke tests passed 🎉");
}

main().catch((e) => { console.error(e); process.exit(1); }); 