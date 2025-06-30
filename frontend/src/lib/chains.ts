import { sepolia, avalancheFuji } from "wagmi/chains";

export const CHAINS = [sepolia, avalancheFuji];

export type SupportedChainId = typeof CHAINS[number]["id"]; 