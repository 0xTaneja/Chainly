// npx hardhat run scripts/deployBreaker.js --network sepolia
require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const FUTURES_ADDR = process.env.FUTURES_ADDR;
  const ORACLE_ADDR  = process.env.ORACLE_ADDR;
  const TOKEN        = process.env.CB_TOKEN || "BTC";      // symbol monitored
  const MAX_AGE      = process.env.CB_MAX_AGE || 300;       // seconds

  if (!FUTURES_ADDR || !ORACLE_ADDR) {
    throw new Error("❌  Set FUTURES_ADDR and ORACLE_ADDR in .env");
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying CircuitBreaker with", deployer.address);

  const CB = await hre.ethers.getContractFactory("CircuitBreaker", deployer);
  const cb = await CB.deploy(FUTURES_ADDR, ORACLE_ADDR, TOKEN, MAX_AGE);
  await cb.deploymentTransaction().wait(5);

  console.log("✅ CircuitBreaker deployed →", cb.target);

  if (hre.network.name === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying on Etherscan …");
    await hre.run("verify:verify", {
      address: cb.target,
      constructorArguments: [FUTURES_ADDR, ORACLE_ADDR, TOKEN, MAX_AGE],
    });
  }
}

main().catch((e) => { console.error(e); process.exit(1); }); 