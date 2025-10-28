"use client";

import {
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { toPrivyWallet } from "@privy-io/cross-app-connect/rainbow-kit";
import { abstractTestnet } from "wagmi/chains";
import { createConfig, WagmiProvider } from "wagmi";
import { http } from "viem";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Abstract",
      wallets: [
        toPrivyWallet({
          name: "Abstract",
          iconUrl: "https://abstract-assets.abs.xyz/icons/dev.png",
          id: "cm5r1jtdg078314b3g90kd8dk",
          defaultPopupTimeout: 1000 * 60 * 30, // 30 minutes
        }),
      ],
    },
    {
      groupName: "Metamask",
      wallets: [metaMaskWallet],
    },
  ],
  {
    appName: "Rainbowkit Test",
    projectId: "861d61139f07eb55ffc1c038a7fb34a1",
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
