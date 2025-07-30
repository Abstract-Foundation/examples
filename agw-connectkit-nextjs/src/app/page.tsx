"use client";

import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";

import Header from "@/components/Header";
import ResourcesSection from "@/components/ResourceSection";
import BackgroundEffects from "@/components/ui/BackgroundEffect";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ConnectedWallet from "@/components/wallet/ConnectWallet";
import { useContract } from "@/hooks/useContract";

export default function Home() {
  const { logout } = useLoginWithAbstract();
  const { address, status } = useAccount();
  const { mintToken, transactionReceipt, canSubmitTransaction } = useContract();

  return (
    <div className="relative grid grid-rows-[1fr_auto] min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-avenue-mono)] bg-black overflow-hidden">
      <BackgroundEffects />

      <main className="relative flex flex-col items-center justify-center z-10 text-white text-center">
        <Header />

        <div className="flex justify-center mt-8">
          {status === "connected" ? (
            <ConnectedWallet
              address={address!}
              onLogout={logout}
              onSubmitTransaction={() => mintToken(address!)}
              canSubmitTransaction={canSubmitTransaction}
              transactionReceipt={transactionReceipt}
            />
          ) : status === "reconnecting" || status === "connecting" ? (
            <LoadingSpinner />
          ) : (
            <ConnectKitButton />
          )}
        </div>
      </main>

      <ResourcesSection />
    </div>
  );
}
