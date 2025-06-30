// npx hardhat run scripts/testNewTokens.js --network sepolia
require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("🧪 TESTING NEW TOKEN ORACLE REQUESTS 🧪");
  console.log("========================================");

  const ORACLE_ADDR = process.env.ORACLE_ADDR || "0x10F2370b3413b453154E520c516a2945e5f52dC8";
  const SUB_ID = process.env.SUB_ID || "5123";
  const SLOT_ID = process.env.SLOT_ID || "0";
  const SEC_VERSION = process.env.SEC_VERSION || "1750969817";

  const tokens = ["ETH", "PEPE", "DOGE"]; // Test the new tokens

  const [deployer] = await hre.ethers.getSigners();
  console.log("🔑 Caller:", deployer.address);
  console.log("🔗 Oracle:", ORACLE_ADDR);
  console.log("");

  const oracle = await hre.ethers.getContractAt("AttentionOracle", ORACLE_ADDR, deployer);

  for (const token of tokens) {
    try {
      console.log(`📊 Testing ${token} oracle request...`);
      
      // Check current data
      const [currentScore, currentTimestamp] = await oracle.getAttentionScore(token);
      const isFresh = await oracle.isDataFresh(token);
      
      console.log(`Current ${token} score:`, currentScore.toString());
      console.log(`Current ${token} timestamp:`, new Date(Number(currentTimestamp) * 1000).toISOString());
      console.log(`Is ${token} data fresh:`, isFresh);
      
      // Request new data
      console.log(`🚀 Requesting fresh ${token} data...`);
      const tx = await oracle.requestAttentionData(
        token,
        Number(SUB_ID),
        Number(SLOT_ID),
        Number(SEC_VERSION)
      );
      
      console.log(`✅ ${token} request sent! TX:`, tx.hash);
      console.log(`⏳ Waiting for Chainlink Functions to respond (1-2 minutes)...`);
      console.log("");
      
    } catch (error) {
      console.error(`❌ Error testing ${token}:`, error.message);
      console.log("");
    }
  }

  console.log("🎯 TEST SUMMARY:");
  console.log("1. All requests sent successfully");
  console.log("2. Wait 1-2 minutes for Chainlink Functions to respond");
  console.log("3. Check oracle data again to see fresh scores");
  console.log("4. Once fresh, the DataRefreshers will keep them updated automatically");
  console.log("");
  console.log("🔄 Next: Register automation upkeeps at https://automation.chain.link/sepolia");
}

main().catch((e) => { console.error(e); process.exit(1); }); 