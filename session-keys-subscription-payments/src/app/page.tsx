"use client";

import Image from "next/image";
import { useAccount } from "wagmi";
import { BackgroundEffects } from "@/components/ui/BackgroundEffects";
import { ResourceCards } from "@/components/ui/ResourceCards";
import { ConnectedState } from "@/components/wallet/ConnectedState";
import { SignInButton } from "@/components/wallet/SignInButton";
import { CreateSessionKey } from "@/components/wallet/CreateSessionKey";
import { Spinner } from "@/components/ui/Spinner";
import { useAbstractSession } from "@/hooks/useAbstractSession";

export default function Home() {
  const { address, status: walletStatus } = useAccount();
  const { data: session, isLoading: isSessionLoading } = useAbstractSession();

  // Main content
  if (walletStatus === "connecting" || walletStatus === "reconnecting") {
    return (
      <AppLayout>
        <div className="flex items-center gap-3 mt-4">
          <Spinner />
          <span className="text-sm font-[family-name:var(--font-roobert)]">
            Connecting wallet...
          </span>
        </div>
      </AppLayout>
    );
  }

  if (!address) {
    return (
      <AppLayout>
        <SignInButton />
      </AppLayout>
    );
  }

  // Loading session status
  if (isSessionLoading) {
    return (
      <AppLayout>
        <div className="flex items-center gap-3 mt-4">
          <Spinner />
          <span className="text-sm font-[family-name:var(--font-roobert)]">
            Checking session...
          </span>
        </div>
      </AppLayout>
    );
  }

  // No session or error - show create session button
  if (!session) {
    return (
      <AppLayout>
        <CreateSessionKey />
      </AppLayout>
    );
  }

  // Has session - show connected state
  return (
    <AppLayout>
      <ConnectedState />
    </AppLayout>
  );
}

// Separate layout component to avoid repetition
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid grid-rows-[1fr_auto] min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-avenue-mono)] bg-black overflow-hidden">
      <BackgroundEffects />

      <main className="relative flex flex-col items-center justify-center z-10 text-white text-center">
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
            Get started by editing{" "}
            <code className="bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              src/app/page.tsx
            </code>
            .
          </p>

          {children}
        </div>
      </main>

      <ResourceCards />
    </div>
  );
}
