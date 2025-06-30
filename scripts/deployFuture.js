// npx hardhat run scripts/deployFuture.js --network sepolia
require("dotenv").config();
const hre = require("hardhat");

async function main () {

  const { ORACLE_ADDR, PRICE_ADAPTER_ADDR } = process.env;          
  const [deployer]  = await hre.ethers.getSigners();
  if (!ORACLE_ADDR || !PRICE_ADAPTER_ADDR) throw new Error("❌  Set ORACLE_ADDR and PRICE_ADAPTER_ADDR in .env");

  console.log(`Deploying with ${deployer.address}`);
  const Fut = await hre.ethers.getContractFactory("AttentionFutures", deployer);
  const fut = await Fut.deploy(ORACLE_ADDR, PRICE_ADAPTER_ADDR);
  // wait for 5 confs to ensure bytecode propagated
  await fut.deploymentTransaction().wait(5);

  console.log("✅ AttentionFutures deployed →", fut.target);

  //-------------------------------------------------
  // (Optional) Etherscan verification
  //-------------------------------------------------
  if (hre.network.name === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying on Etherscan …");
    await hre.run("verify:verify", {
      address: fut.target,
      constructorArguments: [ORACLE_ADDR, PRICE_ADAPTER_ADDR],
    });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });