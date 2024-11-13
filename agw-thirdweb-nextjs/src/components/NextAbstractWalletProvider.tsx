"use client";

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
