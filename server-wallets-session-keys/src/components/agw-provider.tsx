"use client";

import { chain } from "@/const/chain";
import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { ReactNode } from "react";

/**
 * A wrapper component that provides the Abstract Global Wallet context to the app.
 * Docs: https://docs.abs.xyz/abstract-global-wallet/agw-react/native-integration
 */
export function NextAbstractWalletProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AbstractWalletProvider chain={chain}>{children}</AbstractWalletProvider>
  );
}
