// context/index.tsx
"use client";

import React, { type ReactNode } from "react";
import { wagmiAdapter, projectId, CHAIN } from "@/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";

// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up metadata
const metadata = {
  name: "AGW Example",
  description: "Example of using AGW with AppKit",
  url: "http://localhost:3000", // origin must match your domain & subdomain
  icons: [
    "https://raw.githubusercontent.com/Abstract-Foundation/examples/refs/heads/main/agw-nextjs/public/abs-green.svg",
  ],
};

// @ts-ignore - Modal is used
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [CHAIN],
  defaultNetwork: CHAIN,
  metadata: metadata,
  allowUnsupportedChain: false,
  featuredWalletIds: [
    "26d3d9e7224a1eb49089aa5f03fb9f3b883e04050404594d980d4e1e74e1dbea", // AGW
  ],
});

function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;
