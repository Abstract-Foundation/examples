"use client";

import Image from "next/image";
import { useAccount } from "wagmi";
import { BackgroundEffects } from "@/components/ui/BackgroundEffects";
import { ConnectedState } from "@/components/wallet/ConnectedState";
import { SignInButton } from "@/components/wallet/SignInButton";

export default function Home() {
  const { address } = useAccount();

  return (
    <div className="relative min-h-screen p-4 sm:p-8 font-[family-name:var(--font-avenue-mono)] bg-black overflow-hidden">
      <BackgroundEffects />

      <main className="relative z-10 text-white">
        {!address ? (
          <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <div className="flex flex-col items-center gap-8">
              <Image
                src="/abstract.svg"
                alt="Abstract logo"
                width={240}
                height={32}
                quality={100}
                priority
              />
              <p className="text-md font-[family-name:var(--font-roobert)]">
                Abstract Onramp API Demo
              </p>
              <SignInButton />
            </div>
          </div>
        ) : (
          <div className="pt-8">
            <ConnectedState />
          </div>
        )}
      </main>
    </div>
  );
}
