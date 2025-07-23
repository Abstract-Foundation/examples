import React from "react";
import { useAccount } from "wagmi";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { CrossmintCheckout } from "./CrossmintCheckout";
import { DemoInfoCard } from "../DemoInfoCard";

export function ConnectedState() {
  const { address } = useAccount();
  const { logout } = useLoginWithAbstract();

  if (!address) return null;

  return (
    <div className="flex flex-col xl:relative w-full max-w-2xl xl:max-w-[500px] xl:mx-auto">
      {/* Main Checkout Section - Centered */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 shadow-lg backdrop-blur-sm w-full">
        <div className="flex flex-col items-center gap-6">
          {/* Wallet Status */}
          <div className="text-center">
            <p className="text-sm sm:text-base font-medium font-[family-name:var(--font-roobert)] mb-1">
              Connected to Abstract Global Wallet
            </p>
            <p className="text-xs text-gray-400 font-mono break-all">{address}</p>
          </div>

          {/* Crossmint Checkout */}
          <div className="w-full">
            <h3 className="text-lg font-medium font-[family-name:var(--font-roobert)] text-center mb-4">
              Purchase NFT with Credit Card
            </h3>
            <CrossmintCheckout />
          </div>

          {/* Disconnect Button */}
          <button
            className="rounded-full border border-solid border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 hover:cursor-pointer text-sm px-5 font-[family-name:var(--font-roobert)] h-10 py-2"
            onClick={logout}
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"
              />
            </svg>
            Disconnect
          </button>
        </div>
      </div>

      {/* Demo Info Card - Positioned to the right on desktop, below on mobile */}
      <div className="mt-6 xl:mt-0 xl:absolute xl:top-0 xl:left-[calc(100%+1.5rem)]">
        <DemoInfoCard />
      </div>
    </div>
  );
}
