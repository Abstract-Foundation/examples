"use client";

import { useState } from "react";
import { ConnectWallet } from "@/components/ConnectWallet";
import { CreateSession } from "@/components/CreateSession";
import { MintNft } from "@/components/MintNft";
import { useAccount } from "wagmi";
import { SessionConfig } from "@abstract-foundation/agw-client/sessions";
import { Account } from "viem";

type SessionData = {
  session: SessionConfig;
  sessionSigner: Account;
} | null;

export default function Home() {
  const { status } = useAccount();
  const [sessionData, setSessionData] = useState<SessionData>(null);

  const handleSessionCreated = (data: NonNullable<SessionData>) => {
    setSessionData(data);
  };

  return (
    <div className="relative grid grid-rows-[1fr_auto] min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-avenue-mono)] bg-black overflow-hidden">
      {/* Grids and aurora gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f0f_1px,transparent_1px),linear-gradient(to_bottom,#0f0f0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      <div className="absolute top-0 left-0 right-0 h-[70vh] bg-gradient-to-b from-[#4ade80] to-transparent opacity-15 blur-[100px]"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-[#4ade80] to-transparent opacity-10 blur-3xl"></div>

      {/* Main content */}
      <main className="relative flex flex-col items-center justify-center -mt-20 z-10 text-white text-center w-full">
        <div className="flex flex-col items-center w-full max-w-md space-y-6 mx-auto">
          <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-5xl mb-8 whitespace-nowrap">
            Session Keys Demo
          </h1>
          <ConnectWallet />

          {status === "connected" && !sessionData && (
            <CreateSession onSessionCreated={handleSessionCreated} />
          )}

          {status === "connected" && sessionData && (
            <MintNft
              sessionSigner={sessionData.sessionSigner}
              session={sessionData.session}
            />
          )}
        </div>
      </main>
    </div>
  );
}
