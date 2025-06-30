// npx hardhat run scripts/deployRefresher_PEPE.js --network sepolia
require("dotenv").config();
const hre = require("hardhat");

async function main() {
  // PEPE-specific configuration
  const ORACLE_ADDR = process.env.ORACLE_ADDR || "0x10F2370b3413b453154E520c516a2945e5f52dC8";
  const TOKEN       = "PEPE";
  const SUB_ID      = process.env.SUB_ID || "5123";
  const SLOT_ID     = process.env.SLOT_ID || "0";
  const SEC_VERSION = process.env.SEC_VERSION || "1750969817";
  const MAX_AGE     = "150"; // 2.5 minutes like BTC

  if (!ORACLE_ADDR || !SUB_ID || !SEC_VERSION) {
    throw new Error("Set ORACLE_ADDR, SUB_ID, SEC_VERSION in .env");
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("🐸 Deploying PEPE DataRefresher with", deployer.address);
  console.log("Parameters:", {
    oracle: ORACLE_ADDR,
    token: TOKEN,
    subId: SUB_ID,
    slotId: SLOT_ID,
    secretsVersion: SEC_VERSION,
    maxAge: MAX_AGE
  });

  const Ref = await hre.ethers.getContractFactory("DataRefresher", deployer);
  const refresher = await Ref.deploy(
    ORACLE_ADDR,
    TOKEN,
    Number(SUB_ID),
    Number(SLOT_ID),
    Number(SEC_VERSION),
    Number(MAX_AGE)
  );
  await refresher.deploymentTransaction().wait(5);

  console.log("✅ PEPE DataRefresher deployed →", refresher.target);
  console.log("📋 Save this address for Chainlink Automation registration!");

  // Optional Etherscan verification
  if (hre.network.name === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    console.log("🔍 Verifying on Etherscan …");
    try {
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
      console.log("✅ Verification complete!");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); }); 