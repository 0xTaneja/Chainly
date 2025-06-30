const { task, types } = require("hardhat/config")
const { SubscriptionManager } = require("@chainlink/functions-toolkit")

// Quick mapping of LINK token & Functions Router addresses for supported testnets
// Extend if you deploy to more chains
const NETWORK_CONFIG = {
  sepolia: {
    linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    router: "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0",
  },
  fuji: {
    linkToken: "0x0bC529c5C37C403B04963aF00aB59e60b9e472b2",
    router: "0xa4b1B20b6c68b1368Fa2E8eEC196504D9C6Ffa60",
  },
  mumbai: {
    linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    router: "0xfe9C3B79C12969fb08464e0Dc19E76b688AF9Bc9",
  },
}

/**
 * functions-sub-create
 * Creates a Chainlink Functions billing subscription and optionally funds & adds consumer.
 * --amount : LINK to fund (default 1)
 * --contract <address> : consumer contract to authorise (optional)
 */

task("functions-sub-create", "Create + fund a Chainlink Functions subscription")
  .addOptionalParam("amount", "Amount of LINK to fund", "1", types.string)
  .addOptionalParam("contract", "Consumer contract address", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    const net = hre.network.name
    if (!NETWORK_CONFIG[net]) {
      throw new Error(`Network ${net} not configured in tasks/functions-subscription.js`)
    }

    const { linkToken, router } = NETWORK_CONFIG[net]
    // Use the ethers v5 that ships with functions-toolkit to avoid version mismatches
    const v5ethers = require("@chainlink/functions-toolkit/node_modules/ethers")
    const rpcUrl = hre.network.config.url || process.env[`${net.toUpperCase()}_RPC_URL`] || process.env.ETHEREUM_SEPOLIA_RPC_URL
    if (!rpcUrl) throw new Error(`RPC URL env var missing for network ${net}`)
    const provider = new v5ethers.providers.JsonRpcProvider(rpcUrl)
    const privKey = process.env.PRIVATE_KEY
    if (!privKey) throw new Error("PRIVATE_KEY env var missing")
    const signer = new v5ethers.Wallet(privKey.startsWith("0x") ? privKey : `0x${privKey}`, provider)
    console.log(`Using signer ${signer.address} on ${net}`)

    const subManager = new SubscriptionManager({
      signer,
      linkTokenAddress: linkToken,
      functionsRouterAddress: router,
    })

    await subManager.initialize()

    // 1. Create subscription
    const subId = await subManager.createSubscription({
      consumerAddress: taskArgs.contract,
    })
    console.log(`✅ Subscription created with ID ${subId}`)

    // 2. Fund subscription
    const amt = parseFloat(taskArgs.amount)
    if (amt > 0) {
      const juels = v5ethers.utils.parseUnits(taskArgs.amount, 18)
      await subManager.fundSubscription({ subscriptionId: subId, juelsAmount: juels })
      console.log(`💰 Funded with ${taskArgs.amount} LINK`)
    } else {
      console.log("(Skipping funding – amount set to 0, assuming you already funded via UI)")
    }

    console.log("Done. Keep the SUB_ID handy:", subId.toString())
  })

/**
 * functions-sub-add-consumer --subid <id> --contract <address>
 */

task("functions-sub-add-consumer", "Add a consumer contract to a Functions sub")
  .addParam("subid", "Subscription ID", undefined, types.int)
  .addParam("contract", "Consumer contract address", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    const net = hre.network.name
    if (!NETWORK_CONFIG[net]) throw new Error(`Network ${net} not configured`)

    const { linkToken, router } = NETWORK_CONFIG[net]
    // Use the ethers v5 that ships with functions-toolkit to avoid version mismatches
    const v5ethers = require("@chainlink/functions-toolkit/node_modules/ethers")
    const rpcUrl = hre.network.config.url || process.env[`${net.toUpperCase()}_RPC_URL`] || process.env.ETHEREUM_SEPOLIA_RPC_URL
    const provider = new v5ethers.providers.JsonRpcProvider(rpcUrl)
    const signer = new v5ethers.Wallet(process.env.PRIVATE_KEY.startsWith("0x") ? process.env.PRIVATE_KEY : `0x${process.env.PRIVATE_KEY}`, provider)
    const sm = new SubscriptionManager({ signer, linkTokenAddress: linkToken, functionsRouterAddress: router })
    await sm.initialize()

    await sm.addConsumer({ subscriptionId: taskArgs.subid, consumerAddress: taskArgs.contract })
    console.log(`✅ Added consumer ${taskArgs.contract} to sub ${taskArgs.subid}`)
  })

/**
 * functions-sub-info --subid <id>
 * Prints details (balance, consumers, owner) of a Functions subscription.
 */

task("functions-sub-info", "Show a Functions subscription")
  .addParam("subid", "Subscription ID", undefined, types.int)
  .setAction(async (taskArgs, hre) => {
    const net = hre.network.name
    if (!NETWORK_CONFIG[net]) throw new Error(`Network ${net} not configured`)

    const { linkToken, router } = NETWORK_CONFIG[net]
    const v5ethers = require("@chainlink/functions-toolkit/node_modules/ethers")
    const rpcUrl = hre.network.config.url || process.env[`${net.toUpperCase()}_RPC_URL`] || process.env.ETHEREUM_SEPOLIA_RPC_URL
    const provider = new v5ethers.providers.JsonRpcProvider(rpcUrl)
    const signer = new v5ethers.Wallet(process.env.PRIVATE_KEY.startsWith("0x") ? process.env.PRIVATE_KEY : `0x${process.env.PRIVATE_KEY}`, provider)
    const sm = new SubscriptionManager({ signer, linkTokenAddress: linkToken, functionsRouterAddress: router })
    await sm.initialize()

    let info = await sm.getSubscriptionInfo(taskArgs.subid.toString())

    // Convert BigInt values to human-readable strings so JSON.stringify works
    const fmtLink = (juels) => v5ethers.utils.formatEther(juels.toString()) + " LINK"
    info = {
      ...info,
      balance: fmtLink(info.balance),
      blockedBalance: fmtLink(info.blockedBalance),
    }

    console.log(JSON.stringify(info, null, 2))
  })

/**
 * functions-sub-fund --subid <id> --amount <link>
 */

task("functions-sub-fund", "Fund a Functions sub with LINK")
  .addParam("subid", "Subscription ID", undefined, types.int)
  .addParam("amount", "Amount of LINK", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    const net = hre.network.name
    if (!NETWORK_CONFIG[net]) throw new Error(`Network ${net} not configured`)

    const { linkToken, router } = NETWORK_CONFIG[net]
    const v5ethers = require("@chainlink/functions-toolkit/node_modules/ethers")
    const rpcUrl = hre.network.config.url || process.env[`${net.toUpperCase()}_RPC_URL`] || process.env.ETHEREUM_SEPOLIA_RPC_URL
    const provider = new v5ethers.providers.JsonRpcProvider(rpcUrl)
    const signer = new v5ethers.Wallet(process.env.PRIVATE_KEY.startsWith("0x") ? process.env.PRIVATE_KEY : `0x${process.env.PRIVATE_KEY}`, provider)
    const sm = new SubscriptionManager({ signer, linkTokenAddress: linkToken, functionsRouterAddress: router })
    await sm.initialize()

    const juels = v5ethers.utils.parseUnits(taskArgs.amount, 18)
    await sm.fundSubscription({ subscriptionId: taskArgs.subid, juelsAmount: juels })
    console.log(`✅ Funded sub ${taskArgs.subid} with ${taskArgs.amount} LINK`)
  }) 