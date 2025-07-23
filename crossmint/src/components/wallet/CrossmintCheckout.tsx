import React from "react";
import { useAccount } from "wagmi";
import { CrossmintEmbeddedCheckout } from "@crossmint/client-sdk-react-ui";

export function CrossmintCheckout() {
  const { address } = useAccount();

  if (!address) return null;

  const collectionId = process.env.NEXT_PUBLIC_CROSSMINT_COLLECTION_ID;
  const apiKey = process.env.NEXT_PUBLIC_CROSSMINT_API_KEY;

  if (!apiKey) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
        <p className="text-red-400 text-sm">
          Missing NEXT_PUBLIC_CROSSMINT_API_KEY environment variable
        </p>
      </div>
    );
  }

  if (!collectionId) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
        <p className="text-red-400 text-sm">
          Missing NEXT_PUBLIC_CROSSMINT_COLLECTION_ID environment variable
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <CrossmintEmbeddedCheckout
        lineItems={{
          collectionLocator: `crossmint:${collectionId}`,
          callData: {
            totalPrice: "0.001",
            quantity: 1,
            to: address,
          },
        }}
        recipient={{
          walletAddress: address,
        }}
        payment={{
          crypto: { enabled: false },
          fiat: { enabled: true },
        }}
        appearance={{
          variables: {
            colors: {
              backgroundPrimary: "#0a0a0a",
              textPrimary: "#ededed",
              textSecondary: "#a1a1aa",
              borderPrimary: "#374151",
            },
          },
        }}
      />
    </div>
  );
}