// npx hardhat run scripts/allowlistReceiver.js --network fuji
require("dotenv").config();
const hre = require("hardhat");

/**
 * Sets the ScoreBridgeSender address in the Receiver allow-list.
 * Needs env vars:
 *   RECEIVER_ADDR   – receiver on Fuji
 *   SENDER_ADDR     – sender on Sepolia (to trust)
 */
async function main() {
  const recv = process.env.RECEIVER_ADDR;
  const sender = process.env.SENDER_ADDR;
  if (!recv || !sender) throw new Error("Set RECEIVER_ADDR and SENDER_ADDR in .env");

  const [signer] = await hre.ethers.getSigners();
  const rec = await hre.ethers.getContractAt("ScoreBridgeReceiver", recv, signer);
  const tx = await rec.setAllowedSender(sender);
  console.log("allowlisting tx:", tx.hash);
  await tx.wait();
  console.log("Receiver now trusts", sender);
}

main().catch((e)=>{console.error(e);process.exit(1);}); 