"use client";

import {
  DynamicContextProps,
  DynamicContextProvider,
  EvmNetwork,
  mergeNetworks,
} from "@dynamic-labs/sdk-react-core";
import { Chain, http } from "viem";
import { AbstractEvmWalletConnectors } from "@dynamic-labs-connectors/abstract-global-wallet-evm";
import { abstractTestnet } from "viem/chains";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { useMemo } from "react";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
  const settings = useMemo<DynamicContextProps["settings"]>(() => {
    return {
      overrides: {
        evmNetworks: (networks: any) =>
          mergeNetworks(
            [
              toDynamicChain(
                abstractTestnet,
                "https://abstract-assets.abs.xyz/icons/light.png"
              ),
            ],
            networks
          ),
        views: []
      },
      environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID as string,
      walletConnectors: [EthereumWalletConnectors, AbstractEvmWalletConnectors],
    };
  }, []);

  const queryClient = new QueryClient();

  const config = createConfig({
    chains: [abstractTestnet],
    multiInjectedProviderDiscovery: false,
    ssr: true,
    transports: {
      [abstractTestnet.id]: http(),
    },
  });

  return (
    <DynamicContextProvider theme="auto" settings={settings}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector suppressChainMismatchError>
            {children}
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
