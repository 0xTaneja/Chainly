require("dotenv").config();
const hre = require("hardhat");
const { ethers } = hre;

/**
 * One-off helper: ensure the Sepolia ScoreBridgeSender is permitted to send
 * CCIP messages to Avalanche Fuji and has the correct receiver address.
 *
 * Expects the following env vars:
 *   SENDER_ADDR_SEPOLIA   – ScoreBridgeSender on Sepolia (or SENDER_ADDR)
 *   RECEIVER_ADDR_FUJI    – ScoreBridgeReceiver on Fuji (or RECEIVER_ADDR)
 *   PRIVATE_KEY           – (Hardhat) must be the owner of the sender contract
 * Optional:
 *   FUJI_SELECTOR         – override default 14767482510784806043
 */
async function main () {
  // --------------------------------------------------------------------
  // 0. Resolve addresses from env (preferred) or fall back to constants
  // --------------------------------------------------------------------
  const SENDER   = process.env.SENDER_ADDR_SEPOLIA  || process.env.SENDER_ADDR || "";
  const RECEIVER = process.env.RECEIVER_ADDR_FUJI   || process.env.RECEIVER_ADDR || "";
  const FUJI_SELECTOR = process.env.FUJI_SELECTOR ? BigInt(process.env.FUJI_SELECTOR) : 14767482510784806043n;

  if (!ethers.isAddress(SENDER) || !ethers.isAddress(RECEIVER)) {
    throw new Error("❌  Set SENDER_ADDR_SEPOLIA and RECEIVER_ADDR_FUJI in .env (or pass as env vars)");
  }

  const senderAbi = [
    "function allowlistDestinationChain(uint64,bool) external",
    "function destChainSelector() view returns(uint64)",
    "function destReceiver() view returns(address)",
    "function setDestination(uint64 selector,address receiver) external"
  ];

  const [signer] = await ethers.getSigners();

  const sender  = new ethers.Contract(SENDER, senderAbi, signer);

  // 1️⃣  Allowlist Fuji on the router via the sender (safe-retry)
  console.log("→ Allow-listing Fuji selector on router …");
  try {
    const tx1 = await sender.allowlistDestinationChain(FUJI_SELECTOR, true);
    await tx1.wait();
    console.log(`   tx hash ${tx1.hash}`);
  } catch (err) {
    const msg = err?.error?.message || err?.shortMessage || err?.message || "";
    // Many router implementations revert if the entry is already set OR if the caller is not the owner.
    if (/already|duplicate|existent|ALREADY/i.test(msg)) {
      console.log("   ✓ Destination chain was already allow-listed");
    } else if (/owner|only|unauthori/i.test(msg)) {
      console.error("❌  Revert: caller is not the owner of the sender contract.");
      console.error("    Make sure you run the script from the *deployer* account that created ScoreBridgeSender.");
      throw err;
    } else {
      console.error("❌  Unexpected revert:", msg);
      throw err;
    }
  }

  // 2️⃣  Ensure sender's storage points to Fuji + receiver
  const curSel = await sender.destChainSelector();
  const curRcv = await sender.destReceiver();

  if (curSel !== FUJI_SELECTOR || curRcv.toLowerCase() !== RECEIVER.toLowerCase()) {
    console.log("→ Updating sender.setDestination(…) …");
    const tx2 = await sender.setDestination(FUJI_SELECTOR, RECEIVER);
    await tx2.wait();
    console.log(`   tx hash ${tx2.hash}`);
  } else {
    console.log("✓ Sender already targets Fuji and the correct receiver");
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}); 