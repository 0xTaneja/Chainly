import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "./tasks";
import "./tasks/functions-subscription";
import "./tasks/functions-secrets";

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

const ETHEREUM_SEPOLIA_RPC_URL = process.env.ETHEREUM_SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo";
const POLYGON_MUMBAI_RPC_URL = process.env.POLYGON_MUMBAI_RPC_URL || "https://polygon-mumbai.g.alchemy.com/v2/demo";
const AVALANCHE_FUJI_RPC_URL = process.env.AVALANCHE_FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "abc123";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "abc123";
const FUJI_SNOWTRACE_API_KEY = process.env.FUJI_SNOWTRACE_API_KEY || "abc123";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337,
      forking: { url: process.env.SEPOLIA_RPC_URL1 || "" },
      initialBaseFeePerGas: 0,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL1,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      gas:12000000,
    },
    mumbai: {
      url: POLYGON_MUMBAI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80001,
    },
    fuji: {
      url: AVALANCHE_FUJI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 43113,
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
      polygonMumbai: POLYGONSCAN_API_KEY,
      avalancheFujiTestnet: FUJI_SNOWTRACE_API_KEY,
    }
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
};

export default config;