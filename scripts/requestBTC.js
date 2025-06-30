const hre = require("hardhat")

// Hard-coded config (change here if you redeploy)
const ORACLE_ADDR = "0x647CaD6283Be91701276d080B72C1Ff9d8E43f0F"; // AttentionOracle on Sepolia
const SUB_ID      = 5123;  // Functions subscription
const SLOT_ID     = 0;     // secrets slot
const VERSION     = 1750714203; // secrets version
const TOKEN       = "BTC";

async function main () {
  // whichever signer is first in your .env -- the one that owns sub-5101
  const [signer] = await hre.ethers.getSigners()

  const oracle = await hre.ethers.getContractAt("AttentionOracle", ORACLE_ADDR, signer)

  console.log("Oracle:", ORACLE_ADDR)
  console.log("Sending Functions request …")

  // Register listener BEFORE sending tx to avoid race conditions
  const listener = (token, score, ts) => {
    console.log(`✅ ${token} score = ${score.toString()}  (at ${new Date(ts * 1e3)})`);
    process.exit(0);
  };
  oracle.once("AttentionUpdated", listener);

  const tx = await oracle.requestAttentionData(TOKEN, SUB_ID, SLOT_ID, VERSION);
  console.log("tx hash:", tx.hash);
  const rc = await tx.wait();

  // Check past logs in case event emitted quickly
  const logs = await oracle.queryFilter(oracle.filters.AttentionUpdated(), rc.blockNumber, "latest");
  if (logs.length > 0) {
    const { args } = logs[logs.length - 1];
    listener(args.token, args.score, args.timestamp);
  } else {
    console.log("⏳ waiting for AttentionUpdated …");
    // also set a timeout fallback (5 min)
    setTimeout(() => {
      console.error("❌ Timeout waiting for AttentionUpdated event");
      
    }, 300_000);
  }
}

main().catch((e) => { console.error(e); process.exit(1) })