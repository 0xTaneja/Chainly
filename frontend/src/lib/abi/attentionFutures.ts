export const attentionFuturesAbi = [
  {
    "inputs": [
      { "internalType": "string", "name": "token", "type": "string" },
      { "internalType": "bool", "name": "isLong", "type": "bool" },
      { "internalType": "uint256", "name": "leverage", "type": "uint256" }
    ],
    "name": "openPosition",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "closePosition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "positions",
    "outputs": [
      { "internalType": "address", "name": "trader", "type": "address" },
      { "internalType": "string", "name": "token", "type": "string" },
      { "internalType": "bool", "name": "isLong", "type": "bool" },
      { "internalType": "uint256", "name": "collateral", "type": "uint256" },
      { "internalType": "uint256", "name": "leverage", "type": "uint256" },
      { "internalType": "uint256", "name": "openScore", "type": "uint256" },
      { "internalType": "uint256", "name": "openTime", "type": "uint256" },
      { "internalType": "bool", "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "userPositionIds",
    "outputs": [
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "equity",
    "outputs": [
      { "internalType": "int256", "name": "", "type": "int256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "healthFactor",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" }
    ],
    "name": "calcPnl",
    "outputs": [
      { "internalType": "int256", "name": "", "type": "int256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "oracle",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextId",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  { "inputs": [], "name": "InvalidLeverage", "type": "error" },
  { "inputs": [], "name": "NotFreshData", "type": "error" },
  { "inputs": [], "name": "ZeroCollateral", "type": "error" },
  { "inputs": [], "name": "Inactive", "type": "error" },
  { "inputs": [], "name": "NotOwner", "type": "error" },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": false, "internalType": "int256", "name": "pnl", "type": "int256" }
    ],
    "name": "PositionClosed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "trader", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "token", "type": "string" },
      { "indexed": false, "internalType": "bool", "name": "isLong", "type": "bool" },
      { "indexed": false, "internalType": "uint256", "name": "collateral", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "leverage", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "openScore", "type": "uint256" }
    ],
    "name": "PositionOpened",
    "type": "event"
  }
] as const;

export type AttentionFuturesAbi = typeof attentionFuturesAbi; 