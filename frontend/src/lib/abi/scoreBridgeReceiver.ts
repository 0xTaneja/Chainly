export const scoreBridgeReceiverAbi = [
  {
    "inputs": [],
    "name": "allowedSender",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "allowedSourceChain",
    "outputs": [
      { "internalType": "uint64", "name": "", "type": "uint64" }
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
      { "internalType": "address", "name": "sender", "type": "address" }
    ],
    "name": "setAllowedSender",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const; 