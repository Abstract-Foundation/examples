"use client";

import { AbstractWalletProvider } from "@abstract-foundation/agw-react";

export default function AbstractWalletWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AbstractWalletProvider config={{ testnet: true }}>
      {children}
    </AbstractWalletProvider>
  );
}
