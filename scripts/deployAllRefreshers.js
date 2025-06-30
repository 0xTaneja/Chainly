// npx hardhat run scripts/deployAllRefreshers.js --network sepolia
require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("🚀 DEPLOYING ALL TOKEN REFRESHERS FOR HACKATHON VICTORY! 🚀");
  console.log("=====================================================");

  // Configuration from .env
  const ORACLE_ADDR = process.env.ORACLE_ADDR || "0x10F2370b3413b453154E520c516a2945e5f52dC8";
  const SUB_ID      = process.env.SUB_ID || "5123";
  const SLOT_ID     = process.env.SLOT_ID || "0";
  const SEC_VERSION = process.env.SEC_VERSION || "1750969817";
  const MAX_AGE     = "150"; // 2.5 minutes like BTC

  const tokens = ["ETH", "PEPE", "DOGE"];
  const deployedAddresses = {};

  if (!ORACLE_ADDR || !SUB_ID || !SEC_VERSION) {
    throw new Error("Set ORACLE_ADDR, SUB_ID, SEC_VERSION in .env");
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("💰 Deployer:", deployer.address);
  console.log("🔗 Oracle:", ORACLE_ADDR);
  console.log("📊 Functions Sub ID:", SUB_ID);
  console.log("⚡ Max Age:", MAX_AGE, "seconds (2.5 minutes)");
  console.log("");

  const Ref = await hre.ethers.getContractFactory("DataRefresher", deployer);

  for (const token of tokens) {
    console.log(`📈 Deploying ${token} DataRefresher...`);
    
    const refresher = await Ref.deploy(
      ORACLE_ADDR,
      token,
      Number(SUB_ID),
      Number(SLOT_ID),
      Number(SEC_VERSION),
      Number(MAX_AGE)
    );
    
    console.log(`⏳ Waiting for ${token} deployment confirmation...`);
    await refresher.deploymentTransaction().wait(5);
    
    deployedAddresses[token] = refresher.target;
    console.log(`✅ ${token} DataRefresher deployed → ${refresher.target}`);
    console.log("");
  }

  console.log("🎉 ALL REFRESHERS DEPLOYED SUCCESSFULLY! 🎉");
  console.log("===========================================");
  
  console.log("\n📋 DEPLOYMENT SUMMARY:");
  console.log("Oracle Address:", ORACLE_ADDR);
  for (const token of tokens) {
    console.log(`${token} Refresher:`, deployedAddresses[token]);
  }

  console.log("\n🔄 NEXT STEPS:");
  console.log("1. Register each refresher as a Chainlink Automation upkeep");
  console.log("2. Fund each upkeep with LINK tokens");
  console.log("3. Test that automation triggers oracle updates");
  console.log("4. Update frontend to support all tokens");

  console.log("\n🌐 Automation Registration URLs:");
  console.log("https://automation.chain.link/sepolia");
  console.log("");
  
  console.log("📝 Copy these addresses for upkeep registration:");
  for (const token of tokens) {
    console.log(`${token}: ${deployedAddresses[token]}`);
  }

  // Optional Etherscan verification
  if (hre.network.name === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    console.log("\n🔍 Starting Etherscan verification...");
    for (const token of tokens) {
      try {
        console.log(`Verifying ${token} DataRefresher...`);
        await hre.run("verify:verify", {
          address: deployedAddresses[token],
          constructorArguments: [
            ORACLE_ADDR,
            token,
            Number(SUB_ID),
            Number(SLOT_ID),
            Number(SEC_VERSION),
            Number(MAX_AGE),
          ],
        });
        console.log(`✅ ${token} verification complete!`);
      } catch (error) {
        console.log(`⚠️  ${token} verification failed:`, error.message);
      }
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); }); 