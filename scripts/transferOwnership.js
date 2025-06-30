// npx hardhat run scripts/transferOwnership.js --network fuji
require("dotenv").config();
const hre = require("hardhat");

/**
 * Transfers ownership of the AttentionOracle (or any ConfirmedOwner / Ownable
 * contract) to a new address. Use this to hand control of the Fuji oracle
 * to the ScoreBridgeReceiver so it can write bridged scores.
 *
 * Env vars required:
 *   ORACLE_ADDR      – contract address whose ownership you want to transfer
 *   NEW_OWNER_ADDR   – address that will become the new owner (receiver)
 */

async function main () {
  const oracleAddr   = process.env.ORACLE_ADDR_FUJI;
  const newOwnerAddr = process.env.RECEIVER_ADDR;
  if (!oracleAddr || !newOwnerAddr) {
    throw new Error("❌  Set ORACLE_ADDR and NEW_OWNER_ADDR in .env");
  }

  const [signer] = await hre.ethers.getSigners();
  console.log("Transferring ownership from", signer.address);

  const oracle = await hre.ethers.getContractAt("AttentionOracle", oracleAddr, signer);
  const tx = await oracle.transferOwnership(newOwnerAddr);
  console.log("tx submitted:", tx.hash);
  await tx.wait();
  console.log(`✅ Ownership of ${oracleAddr} transferred to ${newOwnerAddr}`);
}

main().catch((e)=>{console.error(e);process.exit(1);}); 