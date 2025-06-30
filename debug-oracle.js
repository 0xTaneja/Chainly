const hre = require("hardhat");

async function main() {
  console.log("🔍 Debugging Oracle State...\n");
  
  // Contract addresses from env
  const ORACLE_ADDR = process.env.ORACLE_ADDR || "0x10F2370b3413b453154E520c516a2945e5f52dC8";
  const FUTURES_ADDR = process.env.FUTURES_ADDR || "0x715AeE1089db8F208cE41A4Ad6fd5Bae57e8FfCE";
  const DATA_REF_ADDR = process.env.DATA_REF_ADDR || "0x521aFB4F4b9aC877BD16dA43715bf482cd9e78D6";
  
  console.log("📍 Contract Addresses:");
  console.log(`Oracle: ${ORACLE_ADDR}`);
  console.log(`Futures: ${FUTURES_ADDR}`);
  console.log(`DataRefresher: ${DATA_REF_ADDR}\n`);
  
  // Get contracts
  const oracle = await hre.ethers.getContractAt("AttentionOracle", ORACLE_ADDR);
  const futures = await hre.ethers.getContractAt("AttentionFutures", FUTURES_ADDR);
  const dataRefresher = await hre.ethers.getContractAt("DataRefresher", DATA_REF_ADDR);
  
  // Check BTC data
  const token = "BTC";
  console.log(`🪙 Checking ${token} data:\n`);
  
  try {
    // Get attention score and timestamp
    const [score, timestamp] = await oracle.getAttentionScore(token);
    console.log(`Score: ${score.toString()}`);
    console.log(`Timestamp: ${timestamp.toString()}`);
    
    // Check freshness
    const isFresh = await oracle.isDataFresh(token);
    console.log(`Is Fresh: ${isFresh}`);
    
    // Calculate age
    const currentTime = Math.floor(Date.now() / 1000);
    const age = currentTime - Number(timestamp);
    console.log(`Current time: ${currentTime}`);
    console.log(`Age (seconds): ${age}`);
    console.log(`Is fresh (< 300s): ${age < 300}\n`);
    
    // Check DataRefresher config
    console.log("🔄 DataRefresher config:");
    const refresherToken = await dataRefresher.token();
    const maxAge = await dataRefresher.maxAge();
    console.log(`Monitors: ${refresherToken}`);
    console.log(`MaxAge: ${maxAge.toString()}`);
    
    // Check if upkeep is needed
    const [upkeepNeeded] = await dataRefresher.checkUpkeep("0x");
    console.log(`Upkeep needed: ${upkeepNeeded}\n`);
    
    // Check futures contract oracle
    console.log("🎯 Futures contract check:");
    const futuresOracle = await futures.oracle();
    console.log(`Futures contract oracle: ${futuresOracle}`);
    console.log(`Expected oracle (from env): ${ORACLE_ADDR}`);
    console.log(`Match: ${futuresOracle.toLowerCase() === ORACLE_ADDR.toLowerCase()}\n`);
    
    // Try to simulate openPosition call
    console.log("🧪 Testing openPosition simulation:");
    try {
      // This will revert with the actual error
      await futures.callStatic.openPosition(token, true, 2, {
        value: hre.ethers.parseEther("0.01")
      });
      console.log("✅ openPosition would succeed");
    } catch (error) {
      console.log(`❌ openPosition would fail: ${error.message}`);
      
      // Check if it's specifically NotFreshData
      if (error.message.includes("NotFreshData")) {
        console.log("\n🔍 NotFreshData error detected. Checking oracle state again...");
        
        // Double-check the exact values
        const freshCheck = await oracle.isDataFresh(token);
        const [scoreCheck, timestampCheck] = await oracle.getAttentionScore(token);
        const currentTimeCheck = Math.floor(Date.now() / 1000);
        const ageCheck = currentTimeCheck - Number(timestampCheck);
        
        console.log(`Oracle.isDataFresh("${token}"): ${freshCheck}`);
        console.log(`Last updated: ${timestampCheck.toString()}`);
        console.log(`Current time: ${currentTimeCheck}`);
        console.log(`Age: ${ageCheck}s`);
        console.log(`Fresh threshold: 300s`);
        console.log(`Should be fresh: ${ageCheck < 300}`);
      }
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 