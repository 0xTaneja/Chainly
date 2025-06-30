const { task, types } = require("hardhat/config")
const { SecretsManager } = require("@chainlink/functions-toolkit")

const NETWORK_CONFIG = {
  sepolia: {
    router: "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0",
    donId: "fun-ethereum-sepolia-1",
    gatewayUrls: [
      "https://01.functions-gateway.testnet.chain.link/",
      "https://02.functions-gateway.testnet.chain.link/",
    ],
  },
  fuji: {
    router: "0xa4b1B20b6c68b1368Fa2E8eEC196504D9C6Ffa60",
    donId: "fun-avalanche-fuji-1",
    gatewayUrls: [
      "https://01.functions-gateway.testnet.chain.link/",
      "https://02.functions-gateway.testnet.chain.link/",
    ],
  },
  mumbai: {
    router: "0xfe9C3B79C12969fb08464e0Dc19E76b688AF9Bc9",
    donId: "fun-polygon-mumbai-1",
    gatewayUrls: [
      "https://01.functions-gateway.testnet.chain.link/",
      "https://02.functions-gateway.testnet.chain.link/",
    ],
  },
}

/**
 * Upload secrets to DON
 * --slotid <number> (optional, default 0)
 * --ttl <minutes> (optional, default 15)
 */
task("functions-upload-secrets-don", "Encrypts env secrets and uploads them to the DON")
  .addOptionalParam("slotid", "Storage slot id", 0, types.int)
  .addOptionalParam("ttl", "Minutes until secrets expire", 15, types.int)
  .addOptionalParam("owner", "Address that will pay the 1 LINK secrets deposit (defaults to signer)", undefined, types.string)
  .addOptionalParam("secretsversion", "Force specific secrets version (overwrite existing)", undefined, types.int)
  .addOptionalParam("secrets", "Path to a JSON file whose object will be encrypted", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    const net = hre.network.name
    if (!NETWORK_CONFIG[net]) {
      throw new Error(`Unsupported network ${net}`)
    }
    const { router, donId, gatewayUrls } = NETWORK_CONFIG[net]

    // Build signer with ethers v5 packaged inside toolkit
    const v5ethers = require("@chainlink/functions-toolkit/node_modules/ethers")
    const rpcUrl = hre.network.config.url || process.env[`${net.toUpperCase()}_RPC_URL`] || process.env.ETHEREUM_SEPOLIA_RPC_URL
    if (!rpcUrl) throw new Error(`RPC URL env var missing for ${net}`)
    const provider = new v5ethers.providers.JsonRpcProvider(rpcUrl)
    const privateKey = process.env.PRIVATE_KEY?.startsWith("0x") ? process.env.PRIVATE_KEY : `0x${process.env.PRIVATE_KEY}`
    if (!privateKey) throw new Error("PRIVATE_KEY env var missing")
    const signer = new v5ethers.Wallet(privateKey, provider)

    const signerAddress = await signer.getAddress()
    const secretsOwner = taskArgs.owner || signerAddress
    console.log(`🔑 Signer:  ${signerAddress}`)
    console.log(`💸 Owner :  ${secretsOwner}  (will pay 1 LINK deposit)`) // prettier-ignore

    // OPTIONAL sanity-check – make sure the owner actually has >= 1 LINK
    try {
      const LinkTokenAbi = ["function balanceOf(address) view returns (uint256)"]
      const linkToken = new v5ethers.Contract(
        "0x779877A7B0D9E8603169DdbD7836e478b4624789", // Sepolia LINK
        LinkTokenAbi,
        provider
      )
      const bal = await linkToken.balanceOf(secretsOwner)
      if (bal.lt(v5ethers.utils.parseEther("1"))) {
        throw new Error(
          `Secrets owner has only ${v5ethers.utils.formatEther(bal)} LINK (< 1 LINK). Faucet more LINK to proceed.`
        )
      }
    } catch (e) {
      console.warn("⚠️  Could not verify LINK balance – continuing anyway: ", e.message)
    }

    // Prepare secrets
    let secrets
    if (taskArgs.secrets) {
      const fs = require("fs")
      try {
        const raw = fs.readFileSync(taskArgs.secrets, "utf8")
        secrets = JSON.parse(raw)
      } catch (e) {
        throw new Error(`Failed reading secrets file '${taskArgs.secrets}': ${e}`)
      }
    } else {
      const twitterBearer = process.env.TWITTER_BEARER
      if (!twitterBearer) throw new Error("Either --secrets file or TWITTER_BEARER env var must be provided")
      secrets = { TWITTER_BEARER: twitterBearer }
    }

    // Init secrets manager
    const secretsManager = new SecretsManager({
      signer,
      functionsRouterAddress: router,
      donId,
      secretsOwner: secretsOwner,
    })
    await secretsManager.initialize()

    console.log("🔐 Encrypting secrets…")
    const { encryptedSecrets } = await secretsManager.encryptSecrets(secrets)

    console.log(`📤 Uploading to DON slot ${taskArgs.slotid} (TTL ${taskArgs.ttl} min)…`)

    const uploadOpts = {
      encryptedSecretsHexstring: encryptedSecrets,
      gatewayUrls,
      slotId: taskArgs.slotid,
      minutesUntilExpiration: taskArgs.ttl,
    }
    if (taskArgs.secretsversion !== undefined) {
      uploadOpts.version = taskArgs.secretsversion
      console.log(`🔄  Forcing version ${taskArgs.secretsversion}`)
    }

    const res = await secretsManager.uploadEncryptedSecretsToDON(uploadOpts)

    if (!res.success) {
      throw new Error("Upload failed on some nodes")
    }

    console.log("✅ Secrets uploaded. Version:", res.version)
    console.log("Reference params to use in sendRequest():")
    console.log(`  slotId: ${taskArgs.slotid}`)
    console.log(`  version: ${res.version}`)
  }) 