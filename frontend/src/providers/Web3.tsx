'use client';
import "@rainbow-me/rainbowkit/styles.css";
import { PropsWithChildren } from "react";
import {
  getDefaultWallets,
  connectorsForWallets,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiConfig, createConfig, configureChains, createStorage } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { CHAINS } from "../lib/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo";

export default function Web3Provider({ children }: PropsWithChildren) {
  const { wallets } = getDefaultWallets({
    appName: "Attention Futures",
    projectId,
    chains: CHAINS,
  });

  const { chains, publicClient, webSocketPublicClient } = configureChains(
    CHAINS,
    [
      jsonRpcProvider({
        rpc: (chain) => {
          if (chain.id === 11155111) {
            return {
              http:
                process.env.NEXT_PUBLIC_SEPOLIA_RPC ||
                "https://eth-sepolia.g.alchemy.com/v2/demo",
            };
          }
          if (chain.id === 43113) {
            return {
              http:
                process.env.NEXT_PUBLIC_FUJI_RPC ||
                "https://api.avax-test.network/ext/bc/C/rpc",
            };
          }
          return null;
        },
      }),
      publicProvider(),
    ]
  );

  const connectors = connectorsForWallets(wallets)

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
    storage: typeof window !== 'undefined' ? createStorage({ key: 'wagmi.af', storage: window.localStorage }) : undefined,
  });

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={{
          lightMode: lightTheme(),
          darkMode: darkTheme(),
        }}
      >
        {children as any}
      </RainbowKitProvider>
    </WagmiConfig>
  );
} 