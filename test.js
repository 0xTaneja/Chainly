require("dotenv").config();
const hre   = require("hardhat");
const { ethers } = hre;

const OWNER = "0x045c5A451C51c5cd3D5aD81F2eBe6848F8c87FFB";   // oracle owner

(async () => {
  // 1) unlock the address
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [OWNER],
  });

  // 2) give it some ETH (optional, 1000 ETH here)
  await hre.network.provider.request({
    method: "hardhat_setBalance",
    params: [OWNER, "0x3635C9ADC5DEA00000"], // 1000 ETH in hex
  });

  // 3) get a signer bound to the owner address
  const ownerSigner = await ethers.getSigner(OWNER);

  // 4) prove it works: call an owner-only function
  const oracle = await ethers.getContractAt("AttentionOracle", process.env.ORACLE_ADDR);
  console.log("Oracle owner is:", await oracle.owner());          // should match OWNER

  // owner-only call now succeeds
  // await oracle.connect(ownerSigner).setAutomationContract(ethers.ZeroAddress);
})();