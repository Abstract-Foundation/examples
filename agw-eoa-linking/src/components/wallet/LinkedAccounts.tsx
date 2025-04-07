import React, { useState } from "react";
import { useAbstractClient } from "@abstract-foundation/agw-react";
import { useAccount } from "wagmi";

export function LinkedAccounts() {
  const { data: agwClient } = useAbstractClient();
  const { address } = useAccount();
  const [linkedAccounts, setLinkedAccounts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  async function checkLinkedAccounts() {
    if (!agwClient || !address) {
      setError("Client or address not available");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get all linked Ethereum Mainnet wallets for the current AGW
      const { linkedAccounts: accounts } = await agwClient.getLinkedAccounts({
        agwAddress: address,
      });

      console.log("linkedAccounts", accounts);

      setLinkedAccounts(accounts);
      setHasChecked(true);
    } catch (err) {
      console.error("Error fetching linked accounts:", err);
      setError("Failed to fetch linked accounts");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        className={`rounded-full border border-solid transition-colors flex items-center justify-center text-white gap-2 text-sm h-10 px-5 font-[family-name:var(--font-roobert)] w-full
          ${
            isLoading
              ? "bg-gray-500 cursor-not-allowed opacity-50"
              : "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 hover:cursor-pointer border-transparent"
          }`}
        onClick={checkLinkedAccounts}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </span>
        ) : (
          <>
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="w-full text-center">View Linked Accounts</span>
          </>
        )}
      </button>

      <hr className="my-4 border-white/10" />

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

      {linkedAccounts.length > 0 && (
        <div className="mt-4 border border-white/10 rounded-md p-3 bg-white/5">
          <h4 className="text-sm font-medium mb-2">Linked Ethereum Wallets:</h4>
          <ul className="space-y-1">
            {linkedAccounts.map((account) => (
              <li key={account} className="text-xs font-mono break-all">
                {account}
              </li>
            ))}
          </ul>
        </div>
      )}

      {linkedAccounts.length === 0 && !isLoading && !error && hasChecked && (
        <p className="text-gray-400 text-xs mt-2">No linked accounts found</p>
      )}

      <a
        href="https://link-testnet.abs.xyz/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-1 text-sm text-blue-400 hover:text-blue-500 transition-colors mt-3"
      >
        Link account
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    </div>
  );
}
