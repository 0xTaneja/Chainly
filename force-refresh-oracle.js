const hre = require("hardhat");

async function main() {
  console.log("🔄 Force refreshing oracle data...\n");
  
  const DATA_REF_ADDR = process.env.DATA_REF_ADDR || "0x521aFB4F4b9aC877BD16dA43715bf482cd9e78D6";
  const ORACLE_ADDR = process.env.ORACLE_ADDR || "0x10F2370b3413b453154E520c516a2945e5f52dC8";
  
  console.log(`DataRefresher: ${DATA_REF_ADDR}`);
  console.log(`Oracle: ${ORACLE_ADDR}\n`);
  
  const [signer] = await hre.ethers.getSigners();
  console.log(`Using signer: ${signer.address}\n`);
  
  const dataRefresher = await hre.ethers.getContractAt("DataRefresher", DATA_REF_ADDR);
  const oracle = await hre.ethers.getContractAt("AttentionOracle", ORACLE_ADDR);
  
  // Check current state
  console.log("📊 Current state:");
  const [score, timestamp] = await oracle.getAttentionScore("BTC");
  const currentTime = Math.floor(Date.now() / 1000);
  const age = currentTime - Number(timestamp);
  console.log(`BTC Score: ${score.toString()}`);
  console.log(`Last Updated: ${timestamp.toString()}`);
  console.log(`Age: ${age}s\n`);
  
  // Check if upkeep is needed
  const [upkeepNeeded] = await dataRefresher.checkUpkeep("0x");
  console.log(`Upkeep needed: ${upkeepNeeded}`);
  
  if (upkeepNeeded) {
    console.log("🚀 Performing upkeep to trigger oracle refresh...");
    
    try {
      const tx = await dataRefresher.performUpkeep("0x", {
        gasLimit: 500000 // Set a reasonable gas limit
      });
      console.log(`Transaction sent: ${tx.hash}`);
      
      console.log("⏳ Waiting for transaction confirmation...");
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
      
      console.log("\n🔔 Oracle refresh request sent!");
      console.log("⏰ The Chainlink Functions DON will process the request in ~60-90 seconds");
      console.log("📡 You can monitor for the AttentionUpdated event on the oracle contract");
      
    } catch (error) {
      console.error("❌ Failed to perform upkeep:", error.message);
      
      // Check if it's a permission issue
      if (error.message.includes("revert")) {
        console.log("\n🔍 Checking permissions...");
        const automationContract = await oracle.automationContract();
        console.log(`Oracle automation contract: ${automationContract}`);
        console.log(`DataRefresher address: ${DATA_REF_ADDR}`);
        
        if (automationContract.toLowerCase() !== DATA_REF_ADDR.toLowerCase()) {
          console.log("❌ DataRefresher is not set as the automation contract on the oracle!");
          console.log("💡 Run: oracle.setAutomationContract(DATA_REF_ADDR) from the oracle owner");
        }
      }
    }
    
  } else {
    console.log("ℹ️ No upkeep needed - data might already be fresh or refresher is misconfigured");
    
    // Check refresher config
    const token = await dataRefresher.token();
    const maxAge = await dataRefresher.maxAge();
    console.log(`\nRefresher monitors: ${token}`);
    console.log(`Refresher maxAge: ${maxAge.toString()}s`);
    
    if (age > Number(maxAge)) {
      console.log("🤔 Data is older than maxAge but upkeep not needed - check refresher logic");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 