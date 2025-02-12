"use client";

import {
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { abstractWallet } from "@abstract-foundation/agw-react/connectors";
import { abstractTestnet } from "wagmi/chains";
import { createConfig, WagmiProvider } from "wagmi";
import { http } from "viem";
import { coinbaseWallet } from "@rainbow-me/rainbowkit/wallets";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Abstract",
      wallets: [abstractWallet],
    },
    {
      groupName: "Ethereum",
      wallets: [coinbaseWallet],
    },
  ],
  {
    appName: "Rainbowkit Test",
    projectId: "",
    appDescription: "",
    appIcon: "",
    appUrl: "",
  }
);

export const config = createConfig({
  connectors,
  chains: [abstractTestnet],
  transports: {
    [abstractTestnet.id]: http(),
  },
  ssr: true,
});

export default function DynamicWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
    </WagmiProvider>
  );
}
