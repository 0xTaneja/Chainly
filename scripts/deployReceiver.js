// npx hardhat run scripts/deployReceiver.js --network fuji
require("dotenv").config();
const hre = require("hardhat");

/**
 * Deploys ScoreBridgeReceiver on Avalanche-Fuji.
 * Needs the following env vars:
 *   ORACLE_ADDR_FUJI   – deployed AttentionOracle on Fuji
 *   SRC_CHAIN_SELECTOR – Sepolia selector (default 16015286601757825753)
 *
 * After deployment remember to:
 *   1) oracle.transferOwnership(receiver)
 *   2) run allowlistReceiver.js to set the sender address
 */

const ROUTER_FUJI = "0xF694E193200268f9a4868e4Aa017A0118C9a8177"; // CCIP router
const SEPOLIA_SELECTOR = BigInt("16015286601757825753");

async function main() {
  const oracleAddr = process.env.ORACLE_ADDR_FUJI;
  if (!oracleAddr) throw new Error("Set ORACLE_ADDR_FUJI in .env");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying Receiver from", deployer.address);

  const Rec = await hre.ethers.getContractFactory("ScoreBridgeReceiver", deployer);
  const rec = await Rec.deploy(
    ROUTER_FUJI,
    SEPOLIA_SELECTOR,
    oracleAddr
  );
  await rec.waitForDeployment();
  console.log("ScoreBridgeReceiver deployed ->", rec.target);

  // Optional verify
  if (process.env.FUJI_SNOWTRACE_API_KEY) {
    console.log("Verifying …");
    await hre.run("verify:verify", {
      address: rec.target,
      constructorArguments: [ROUTER_FUJI, SEPOLIA_SELECTOR, oracleAddr],
    });
  }
}

main().catch((e) => { console.error(e); process.exit(1); }); 