const hre = require("hardhat");

async function main() {
  console.log("🔨 Deploying AttentionOracle ...");

  const Oracle = await hre.ethers.getContractFactory("AttentionOracle");
  const oracle = await Oracle.deploy();
  await oracle.waitForDeployment();

  const address = await oracle.getAddress();
  console.log("✅ AttentionOracle deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 