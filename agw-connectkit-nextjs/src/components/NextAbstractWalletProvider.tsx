"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { ConnectKitProvider } from "connectkit";
import { abstractTestnet } from "viem/chains";
import { abstractWalletConnector } from "@abstract-foundation/agw-react/connectors";

export default function AbstractWalletWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const wagmiConfig = createConfig({
    connectors: [abstractWalletConnector()],
    chains: [abstractTestnet],
    transports: {
      [abstractTestnet.id]: http(),
    },
    ssr: true,
  });

  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
