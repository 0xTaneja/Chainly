const { SecretsManager } = require("@chainlink/functions-toolkit")
const { ethers }          = require("@chainlink/functions-toolkit/node_modules/ethers")

// 1. Values from the upload step
const slotId  = 0
const version = 1750623658

// 2. Any signer connected to a Sepolia provider (no tx is sent, but SecretsManager
//    still enforces that a provider is present)

// Prefer the same RPC URL you use in .env ; fall back to a public Sepolia endpoint
const RPC_URL = process.env.ETHEREUM_SEPOLIA_RPC_URL ||
                "https://rpc2.sepolia.org" // public load-balanced endpoint

const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
const signer   = ethers.Wallet.createRandom().connect(provider)

// 3. Build the helper (router address MUST match your consumer)
const secretsManager = new SecretsManager({
  signer,
  functionsRouterAddress: "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0",
})
;(async () => {
  const reference = secretsManager.buildDONHostedEncryptedSecretsReference({
    slotId,
    version,
  })
  console.log(reference)          // <-- copy this 0x… string
})()
