"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CreateConnectorFn, WagmiProvider, createConfig, http } from "wagmi";
import { abstractTestnet } from "viem/chains";
import { abstractWalletConnector } from "@abstract-foundation/agw-react/connectors";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from '@reown/appkit/react';


const networks = [abstractTestnet] as any
if(!process.env.NEXT_PUBLIC_PROJECT_ID) throw new Error('Missing NEXT_PUBLIC_PROJECT_ID')
const projectId = `${process.env.NEXT_PUBLIC_PROJECT_ID}`
const connectors: CreateConnectorFn[] = []
connectors.push(abstractWalletConnector())
const wagmiAdapter = new WagmiAdapter({
  transports: {
    [abstractTestnet.id]: http()
  },
  connectors,
  projectId,
  networks,
  ssr: true,
})

const metadata = {
  name: 'AppKit',
  description: 'AppKit Example',
  url: 'https://example.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

const config = wagmiAdapter.wagmiConfig
const reownAppKit = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  enableWalletConnect: false,
  metadata,
})

export default function AbstractWalletWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  return (<WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </WagmiProvider>)
}
