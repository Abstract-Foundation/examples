"use client";

import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "viem/chains";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export default function AbstractWalletWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AbstractWalletProvider chain={abstractTestnet} queryClient={queryClient}>
      {children}
    </AbstractWalletProvider>
  );
}
