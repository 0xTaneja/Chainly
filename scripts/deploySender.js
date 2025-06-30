// npx hardhat run scripts/deploySender.js --network sepolia
require("dotenv").config();
const hre = require("hardhat");

/**
 * Deploys ScoreBridgeSender on Sepolia.
 * Env vars:
 *   ORACLE_ADDR_SEPOLIA – local AttentionOracle address
 *   DEST_RECEIVER_ADDR  – deployed receiver on Fuji
 *   DEST_SELECTOR       – Fuji chain selector (default 14767482510784806043)
 */

const ROUTER_SEPOLIA = "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59";
const LINK_SEPOLIA   = "0x779877A7B0D9E8603169DdbD7836e478b4624789";
const FUJI_SELECTOR  = BigInt("14767482510784806043");

async function main() {
  const oracleAddr = process.env.ORACLE_ADDR;
  const receiverAddr = "0xCFF01e60C769C5Fde8E488E7bE55fBb8D907AFf3"
  if (!oracleAddr || !receiverAddr) throw new Error("Set ORACLE_ADDR_SEPOLIA & DEST_RECEIVER_ADDR in .env");

  const destSel = process.env.DEST_SELECTOR ? BigInt(process.env.DEST_SELECTOR) : FUJI_SELECTOR;

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying Sender from", deployer.address);

  const Send = await hre.ethers.getContractFactory("ScoreBridgeSender", deployer);
  const send = await Send.deploy(
    ROUTER_SEPOLIA,
    LINK_SEPOLIA,
    destSel,
    receiverAddr,
    oracleAddr
  );
  await send.waitForDeployment();
  console.log("ScoreBridgeSender deployed ->", send.target);

  // verify
  if (process.env.ETHERSCAN_API_KEY) {
    await hre.run("verify:verify", {
      address: send.target,
      constructorArguments: [ROUTER_SEPOLIA, LINK_SEPOLIA, destSel, receiverAddr, oracleAddr],
    });
  }
}

main().catch((e)=>{console.error(e);process.exit(1);}); 