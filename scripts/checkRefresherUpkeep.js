require("dotenv").config();
const hre = require("hardhat");

async function main () {
  const addr   = process.env.DATA_REF_ADDR;
  const upIdEnv = process.env.UPKEEP_ID2;
  if (!upIdEnv) throw new Error("REF_UPKEEP_ID env var missing");
  const upId = BigInt(upIdEnv);

  // Automation v2.1 UpkeepInfo struct (Sepolia registry)
  const regAbi = [
    "function getUpkeep(uint256 id) view returns ( \
        uint96 balance, \
        uint96 spent, \
        address admin, \
        address target, \
        uint32 gasLimit, \
        uint64 lastPerformedBlockNumber, \
        uint64 maxValidBlocknumber, \
        bytes checkData, \
        bytes offchainConfig, \
        uint8 triggerType, \
        address lastKeeper)"
  ];
  const REG    = "0x86EFBD0b6736Bed994962f9797049422A3A8E8Ad"; // Sepolia registry

  const refresher = await hre.ethers.getContractAt("DataRefresher", addr);
  const reg       = await hre.ethers.getContractAt(regAbi, REG);

  const [token, maxAge] = [
    await refresher.token(),
    await refresher.maxAge()
  ];

  // Fetch the current timestamp of the latest oracle update
  const oracleAddr = await refresher.oracle();
  const oracle     = await hre.ethers.getContractAt("AttentionOracle", oracleAddr);
  const [, ts]     = await oracle.getAttentionScore(token);

  const blkTs = (await hre.ethers.provider.getBlock("latest")).timestamp;
  const diff  = blkTs - Number(ts);

  const upkeep = await reg.getUpkeep(upId);

  console.log(`
  ── Refresher ───────────────────────────────
  token:       ${token}
  oracle age:  ${diff} s  (maxAge = ${maxAge})
  
  ── Registry  ───────────────────────────────
  LINK balance:        ${hre.ethers.formatUnits(upkeep.balance, 18)}
  gasLimit:            ${upkeep.gasLimit}
  lastPerformedBlock:  ${upkeep.lastPerformedBlockNumber}
  `);
}

main().catch(console.error);