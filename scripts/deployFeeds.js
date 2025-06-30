// npx hardhat run scripts/deployFeeds.js --network sepolia
require("dotenv").config();
const hre = require("hardhat");

/*
  Environment variables required:
  - ORACLE_ADDR           already deployed AttentionOracle
  - ETH_FEED_ADDR         Chainlink ETH/USD aggregator (Sepolia: 0x694AA1769357215DE4FAC081bf1f309aDC325306)
  - BTC_FEED_ADDR         optional BTC/USD
  - DEPLOY_FUTURES=true   if you also want to deploy AttentionFutures in one go
*/

async function main() {
  const { ORACLE_ADDR, ETH_FEED_ADDR, BTC_FEED_ADDR, DEPLOY_FUTURES, PRICE_ADAPTER_ADDR } = process.env;

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployer ${deployer.address}`);

  let adapterAddr = PRICE_ADAPTER_ADDR;
  if (!adapterAddr) {
    // ----------------------------------------------------------------
    // 1. Deploy PriceFeedAdapter with the feeds we know
    // ----------------------------------------------------------------
    if (!ETH_FEED_ADDR) throw new Error("Set ETH_FEED_ADDR in .env or PRICE_ADAPTER_ADDR if already deployed");
    const symbols = ["ETH"];
    const addrs   = [ETH_FEED_ADDR];
    if (BTC_FEED_ADDR) {
      symbols.push("BTC");
      addrs.push(BTC_FEED_ADDR);
    }

    const Adapter = await hre.ethers.getContractFactory("PriceFeedAdapter", deployer);
    const adapter = await Adapter.deploy(symbols, addrs);
    await adapter.deploymentTransaction().wait(5);
    adapterAddr = adapter.target;
    console.log("✅ PriceFeedAdapter deployed →", adapterAddr);
  } else {
    console.log("Using existing PriceFeedAdapter →", adapterAddr);
  }

  // ----------------------------------------------------------------
  // 2. Optionally deploy AttentionFutures that references the adapter
  // ----------------------------------------------------------------
  if (DEPLOY_FUTURES === "true") {
    if (!ORACLE_ADDR) throw new Error("Set ORACLE_ADDR in .env");
    const Fut = await hre.ethers.getContractFactory("AttentionFutures", deployer);
    const fut = await Fut.deploy(ORACLE_ADDR, adapterAddr);
    await fut.deploymentTransaction().wait(5);
    console.log("✅ AttentionFutures deployed →", fut.target);
  }

}

main().catch((e) => { console.error(e); process.exit(1); }); 