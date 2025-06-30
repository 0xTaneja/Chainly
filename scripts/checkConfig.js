require("dotenv").config();
const hre = require("hardhat");

async function main () {
  const fut       = await hre.ethers.getContractAt("AttentionFutures", process.env.FUTURES_ADDR);
  const oracle    = await hre.ethers.getContractAt("AttentionOracle",  process.env.ORACLE_ADDR);
  const breaker   = await hre.ethers.getContractAt("CircuitBreaker",   process.env.CIRCUIT_BRK);
  const refresher = await hre.ethers.getContractAt("DataRefresher",    process.env.DATA_REF_ADDR);

  console.log("\n=== AttentionFutures ===");
  console.log("oracle()",   await fut.oracle());
  console.log("owner()",    await fut.owner());
  console.log("paused()",   await fut.paused());

  console.log("\n=== AttentionOracle ===");
  console.log("lastUpdated('BTC')", (await oracle.lastUpdated("BTC")).toString());
  console.log("lastUpdated('PEPE')", (await oracle.lastUpdated("PEPE")).toString());

  console.log("\n=== CircuitBreaker ===");
  console.log("token()",       await breaker.token());
  console.log("futures()",     await breaker.futures());
  console.log("oracle()",      await breaker.oracle());
  console.log("maxDataAge()",  (await breaker.maxDataAge()).toString());

  console.log("\n=== DataRefresher ===");
  console.log("token()",          await refresher.token());
  console.log("oracle()",         await refresher.oracle());
  console.log("subId()",          (await refresher.subId()).toString());
  console.log("secretsVersion()", (await refresher.secretsVersion()).toString());
  console.log("maxAge()",         (await refresher.maxAge()).toString());
}

main().catch(console.error);