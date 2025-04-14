"use client";

import Image from "next/image";
import { BackgroundEffects } from "@/components/ui/BackgroundEffects";
import { ResourceCards } from "@/components/ui/ResourceCards";
import { SendTransaction } from "@/components/wallet/SendTransaction";

export default function Home() {
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
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 shadow-lg backdrop-blur-sm w-full max-w-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="text-center">
                <appkit-button />
              </div>

              <div className="w-full mt-2">
                <SendTransaction />
              </div>
            </div>
          </div>
        </div>
      </main>

      <ResourceCards />
    </div>
  );
}
