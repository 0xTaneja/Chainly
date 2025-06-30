#!/usr/bin/env node
/*
Speed-up a pending Functions request by replacing the transaction
with the same calldata but higher maxFeePerGas / maxPriorityFeePerGas.

Usage:
  node scripts/speedUpPendingTx.js <TX_HASH> [MAX_FEE_GWEI] [PRIORITY_FEE_GWEI]

Examples:
  # bump to 35/2 gwei
  node scripts/speedUpPendingTx.js 0xabc123... 35 2

Requirements:
  • PRIVATE_KEY and ETHEREUM_SEPOLIA_RPC_URL in .env
*/

const ethers = require("ethers");
require("dotenv").config();

async function main () {
  const [txHash, fee = "35", prio = "2"] = process.argv.slice(2);
  if (!txHash) {
    console.error("Usage: node scripts/speedUpPendingTx.js <TX_HASH> [MAX_FEE_GWEI] [PRIORITY_FEE_GWEI]");
    process.exit(1);
  }

  const rpcUrl = process.env.ETHEREUM_SEPOLIA_RPC_URL;
  const pk = process.env.PRIVATE_KEY;
  if (!rpcUrl || !pk) throw new Error("Set ETHEREUM_SEPOLIA_RPC_URL and PRIVATE_KEY in .env");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);

  const pending = await provider.getTransaction(txHash);
  if (!pending) throw new Error("Transaction not found – check the hash and network");
  if (pending.blockNumber !== null) throw new Error("Transaction already mined – cannot replace");
  if (pending.from.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error(`Tx was sent from ${pending.from}; this script must be run with the same signer`);
  }

  const maxFeePerGas = ethers.parseUnits(fee, "gwei");
  const maxPriorityFeePerGas = ethers.parseUnits(prio, "gwei");

  const replacement = {
    to: pending.to,
    data: pending.data,
    value: pending.value,
    nonce: pending.nonce,
    gasLimit: pending.gasLimit || 300_000n,
    maxFeePerGas,
    maxPriorityFeePerGas,
  };

  console.log("🚀 Sending replacement tx with higher gas …");
  const sent = await wallet.sendTransaction(replacement);
  console.log("New tx hash:", sent.hash);
  await sent.wait();
  console.log("✅ Replacement mined");
}

main().catch((e) => { console.error(e); process.exit(1); }); 