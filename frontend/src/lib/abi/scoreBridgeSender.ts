export const scoreBridgeSenderAbi = [
  {
    "inputs": [
      { "internalType": "uint64", "name": "selector", "type": "uint64" },
      { "internalType": "bool", "name": "allowed", "type": "bool" }
    ],
    "name": "allowlistDestinationChain",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "destChainSelector",
    "outputs": [
      { "internalType": "uint64", "name": "", "type": "uint64" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "destReceiver",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "oracle",
    "outputs": [
      { "internalType": "contract AttentionOracle", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "token", "type": "string" }
    ],
    "name": "sendScore",
    "outputs": [
      { "internalType": "bytes32", "name": "messageId", "type": "bytes32" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint64", "name": "selector", "type": "uint64" },
      { "internalType": "address", "name": "receiver", "type": "address" }
    ],
    "name": "setDestination",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "linkToken",
    "outputs": [
      { "internalType": "contract IERC20", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const; 