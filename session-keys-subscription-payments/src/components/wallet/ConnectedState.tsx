import React from "react";
import { useAccount } from "wagmi";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { SendTransaction } from "./SendTransaction";

export function ConnectedState() {
  const { address } = useAccount();
  const { logout } = useLoginWithAbstract();

  if (!address) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 shadow-lg backdrop-blur-sm w-full max-w-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Wallet Status */}
        <div className="text-center">
          <p className="text-sm sm:text-base font-medium font-[family-name:var(--font-roobert)] mb-1">
            Connected to Abstract Global Wallet
          </p>
          <p className="text-xs text-gray-400 font-mono break-all">{address}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col w-full gap-4">
          <div className="flex flex-col gap-2 w-full">
            <button
              className="rounded-full border border-solid border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 hover:cursor-pointer text-sm px-5 font-[family-name:var(--font-roobert)] w-full sm:flex-1 h-10 py-2"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Disconnect
            </button>
            <SendTransaction />
          </div>
        </div>
      </div>
    </div>
  );
}
