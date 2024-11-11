"use client";

import { DynamicContextProvider, EvmNetwork } from "@dynamic-labs/sdk-react-core";
import { Chain } from "viem";
import { AbstractEvmWalletConnectors } from "@dynamic-labs-connectors/abstract-global-wallet-evm";
import { abstractTestnet } from "viem/chains";

function toDynamicChain(chain: Chain, iconUrl: string): EvmNetwork {
  return {
    ...chain,
    networkId: chain.id,
    chainId: chain.id,
    nativeCurrency: {
      ...chain.nativeCurrency,
      iconUrl: "https://app.dynamic.xyz/assets/networks/eth.svg",
    },
    iconUrls: [iconUrl],
    blockExplorerUrls: [chain.blockExplorers?.default?.url],
    rpcUrls: [...chain.rpcUrls.default.http],
  } as EvmNetwork;
}
export default function NextAbstractWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DynamicContextProvider
    theme="auto"
    settings={{
      overrides: {
        evmNetworks: [
          toDynamicChain(
            abstractTestnet,
            "https://d9s2izusg5pvp.cloudfront.net/icon/light.png"
          ),
        ],
      },
      environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID as string,
      walletConnectors: [
        AbstractEvmWalletConnectors],
    }}
  >
    {children}
    </DynamicContextProvider>
  );
}
