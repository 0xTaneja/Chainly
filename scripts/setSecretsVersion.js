require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const version = 1751208522;
  const addresses = [
    "0x521aFB4F4b9aC877BD16dA43715bf482cd9e78D6",
    "0xeAC69d5CBaA99240b68462BdBA19B4272f19896c", // ETH
    "0x44a990fC93b957e1C773ec2084bA9C907EF5790F", // PEPE
    "0x7F11f0eaE782C71754963D4782964E1243ee6533", // DOGE
    "0xb37dbe3549BD68d94E83a61EEDBF497822E39944", // LINK
  ];

  const [deployer] = await hre.ethers.getSigners();
  console.log("Using", deployer.address);

  for (const addr of addresses) {
    const refresher = await hre.ethers.getContractAt("DataRefresher", addr, deployer);
    const tx = await refresher.setSecretsVersion(version);
    await tx.wait();
    console.log(`✔  ${addr} updated`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});