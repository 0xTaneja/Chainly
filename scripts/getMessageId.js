const hre = require("hardhat");
const { ethers } = hre;

/**
 * Extracts and prints the CCIP messageId emitted by the router in the given
 * transaction.  Works for any EVM chain supported by Hardhat as long as the
 * script knows the router address.
 *
 * Usage examples
 *  TX_HASH=0xabc...  npx hardhat run scripts/getMessageId.js --network sepolia
 *  npx hardhat run scripts/getMessageId.js --network sepolia 0xabc...
 */
async function main () {
  // 1️⃣  read the tx hash (env var or argv)
  const txHash = process.env.TX_HASH || process.argv[2];
  if (!txHash) {
    throw new Error("Provide the tx hash:  TX_HASH=<hash> npx hardhat run scripts/getMessageId.js --network <net>  OR  npx hardhat run ... <hash>");
  }

  // 2️⃣  CCIP router addresses for the networks we use
  const routerMap = {
    sepolia:        "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
    fuji:           "0xF694E193200268f9a4868e4Aa017A0118C9a8177",
    avalancheFuji:  "0xF694E193200268f9a4868e4Aa017A0118C9a8177",
  };
  const router = routerMap[hre.network.name];
  if (!router) throw new Error(`No router address configured for network ${hre.network.name}`);

  // 3️⃣  event signature and tx receipt
  const sigOld = (ethers.id ? ethers.id : ethers.utils.id)("CCIPSendRequested(bytes32,uint64,address,address)");
  const sigNew = (ethers.id ? ethers.id : ethers.utils.id)("CCIPSendRequested(bytes32)");

  // ABIs for the two historical versions of the event
  const Interface = ethers.utils?.Interface || ethers.Interface;
  const ifaceOld = new Interface([
    "event CCIPSendRequested(bytes32 messageId, uint64 destChainSelector, address receiver, address feeToken)"
  ]);
  const ifaceNew = new Interface([
    "event CCIPSendRequested(bytes32 messageId)"
  ]);

  const rcpt = await ethers.provider.getTransactionReceipt(txHash);
  if (!rcpt) throw new Error(`Receipt not found for tx ${txHash}`);

  // Helper that tries to decode the log with both ABIs and returns the messageId if successful
  const tryDecode = (log) => {
    try {
      const parsed = ifaceOld.parseLog(log);
      return parsed.args.messageId;
    } catch (_) { /* noop */ }
    try {
      const parsed = ifaceNew.parseLog(log);
      return parsed.args.messageId;
    } catch (_) { /* noop */ }
    return undefined;
  };

  // 4️⃣  scan logs, prioritising those from the expected router address
  let messageId;
  for (const log of rcpt.logs) {
    // quick filter by known signatures
    if (log.topics[0] !== sigOld && log.topics[0] !== sigNew) continue;

    // if router filter is set, prefer those logs first
    const isRouter = log.address.toLowerCase() === router.toLowerCase();

    const mid = tryDecode(log);
    if (mid) {
      messageId = mid;
      if (isRouter) break; // best-match found
      // otherwise keep searching in case we later find a router-emitted one
    }
  }

  // 5️⃣  Fallback: simulate the transaction one block before it was mined (recommended by Chainlink docs)
  if (!messageId) {
    const tx = await ethers.provider.getTransaction(txHash);
    if (!tx) throw new Error(`Transaction ${txHash} not found`);

    const prevBlock = typeof rcpt.blockNumber === "bigint" ? rcpt.blockNumber - 1n : rcpt.blockNumber - 1;
    const call = {
      from: tx.from,
      to: tx.to,
      data: tx.data,
      gasLimit: tx.gasLimit,
      gasPrice: tx.gasPrice,
      value: tx.value,
      blockTag: prevBlock,
    };

    try {
      const sim = await ethers.provider.call(call, prevBlock);
      if (sim && sim !== "0x") messageId = sim;
    } catch (err) {
      console.warn(`⚠️  Simulation fallback failed: ${err}`);
    }
  }

  if (!messageId || messageId === "0x") {
    console.log("❌  Unable to extract messageId by either event log or simulation");
    return;
  }

  console.log(`📨  messageId = ${messageId}`);
}

main().catch(console.error); 