"use client";

import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { CrossmintProvider } from "@crossmint/client-sdk-react-ui";
import { abstractTestnet } from "viem/chains";

export default function AbstractWalletWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const crossmintApiKey = process.env.NEXT_PUBLIC_CROSSMINT_API_KEY;

  return (
    <AbstractWalletProvider chain={abstractTestnet}>
      {crossmintApiKey ? (
        <CrossmintProvider apiKey={crossmintApiKey}>
          {children}
        </CrossmintProvider>
      ) : (
        children
      )}
    </AbstractWalletProvider>
  );
}
