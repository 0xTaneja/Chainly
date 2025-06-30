// npx hardhat run scripts/deployRefresher.js --network sepolia
require("dotenv").config();
const hre = require("hardhat");

/*
  .env requirements
  ------------------
  ORACLE_ADDR   = 0x...
  TOKEN         = BTC / PEPE / ...
  SUB_ID        = 5123          (uint64)
  SLOT_ID       = 0             (uint8)
  SEC_VERSION   = 1750714203    (uint64)
  MAX_AGE       = 300           (seconds, default 300)
*/

async function main() {
  const ORACLE_ADDR = process.env.ORACLE_ADDR;
  const TOKEN       = process.env.TOKEN;
  const SUB_ID      = process.env.SUB_ID;
  const SLOT_ID     = process.env.SLOT_ID || 0;
  const SEC_VERSION = process.env.SEC_VERSION;
  const MAX_AGE     = process.env.MAX_AGE || 300;

  if (!ORACLE_ADDR || !TOKEN || !SUB_ID || !SEC_VERSION) {
    throw new Error("Set ORACLE_ADDR, TOKEN, SUB_ID, SEC_VERSION in .env");
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying DataRefresher with", deployer.address);

  const Ref = await hre.ethers.getContractFactory("DataRefresher", deployer);
  const refresher = await Ref.deploy(
    ORACLE_ADDR,
    TOKEN,
    Number(SUB_ID),
    Number(SLOT_ID),
    Number(SEC_VERSION),
    Number(MAX_AGE)
  );
  await refresher.deploymentTransaction().wait(5)

  console.log("✅ DataRefresher deployed →", refresher.target);

  // Optional Etherscan verification
  if (hre.network.name === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying on Etherscan …");
    await hre.run("verify:verify", {
      address: refresher.target,
      constructorArguments: [
        ORACLE_ADDR,
        TOKEN,
        Number(SUB_ID),
        Number(SLOT_ID),
        Number(SEC_VERSION),
        Number(MAX_AGE),
      ],
    });
  }
}

main().catch((e) => { console.error(e); process.exit(1); }); 