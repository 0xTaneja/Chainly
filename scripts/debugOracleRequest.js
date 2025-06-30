// npx hardhat run scripts/debugOracleRequest.js --network sepolia
const hre = require("hardhat");

/******************** CONFIG ************************/
const ORACLE_ADDR = "0x647CaD6283Be91701276d080B72C1Ff9d8E43f0F";
const TOKEN       = "BTC";
const SUB_ID      = 5123n;
const SLOT_ID     = 0;
const VERSION     = 1750627167n;
/*****************************************************/

async function main () {
  const { ethers } = hre;
  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  const oracle = await ethers.getContractAt(
    "contracts/AttentionOracle.sol:AttentionOracle",
    ORACLE_ADDR,
    signer
  );

  const fn = oracle.getFunction("requestAttentionData");
  console.log("▶ static call test …");

  try {
    const reqId = await fn.staticCall(TOKEN, SUB_ID, SLOT_ID, VERSION);
    console.log("✅ Router accepted call. Returned requestId:", reqId);
  } catch (err) {
    const reason = err.shortMessage || err.message;
    const errName = err.errorName || err.revert?.errorName;
    console.error("🔴 Revert:", errName || reason);
    if (err.data) console.error("data:", err.data);
    if (err.revert && err.revert.errorArgs) {
      console.error("Details:", err.revert.errorArgs);
    }
  }
}

main().catch((e)=>{console.error(e); process.exit(1);}); 