"use client";

/**
 * Abstract Wallet Provider Setup
 * 
 * This component wraps your app with the Abstract Global Wallet provider,
 * which enables users to connect their Abstract wallets to your dApp.
*/

import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { QueryClient } from "@tanstack/react-query";
import { abstractTestnet } from "viem/chains";

const queryClient = new QueryClient();

export default function AbstractWalletWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AbstractWalletProvider 
      chain={abstractTestnet} // Use Abstract testnet for development
      queryClient={queryClient}
    >
      {children}
    </AbstractWalletProvider>
  );
}
