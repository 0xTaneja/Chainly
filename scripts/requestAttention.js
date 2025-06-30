const hre = require("hardhat");

/**
 * Usage:
 *   npx hardhat run scripts/requestAttention.js --network sepolia \
 *     --oracle 0xOracleAddress --subid 123 --token BTC --secretsRef 0x...
 */

async function main() {
  const args = hre.config.networks;
  const argv = require("minimist")(process.argv.slice(2));
  const oracleAddress = argv.oracle;
  const subId = argv.subid;
  const token = argv.token || "BTC";
  const secretsRef = argv.secretsRef;

  const secretsBytes = hre.ethers.utils.arrayify(secretsRef);

  if (!oracleAddress || !subId || !secretsRef) {
    console.error("Missing flags. Example: --oracle 0x.. --subid 1 --token BTC --secretsRef 0x...");
    process.exit(1);
  }

  const oracle = await hre.ethers.getContractAt("AttentionOracle", oracleAddress);

  console.log(`📡 Sending Functions request for ${token} ...`);
  const tx = await oracle.requestAttentionData(token, subId, secretsBytes);
  console.log("tx hash:", tx.hash);
  const receipt = await tx.wait();
  console.log("✅ Request submitted. Gas used:", receipt.gasUsed.toString());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
}); 