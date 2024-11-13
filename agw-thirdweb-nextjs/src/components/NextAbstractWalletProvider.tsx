"use client";

import { Chain } from "viem";
import { ThirdwebProvider } from "thirdweb/react"

export default function NextAbstractWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThirdwebProvider>
    {children}
    </ThirdwebProvider>
  );
}
