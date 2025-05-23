import { useState } from "react";

interface TransactionStatusProps {
  transactionHash: `0x${string}` | undefined;
  isSuccess: boolean;
  explorerUrl?: string | undefined;
}

export function TransactionStatus({
  transactionHash,
  isSuccess,
  explorerUrl,
}: TransactionStatusProps) {
  const [showStatus, setShowStatus] = useState(true);

  if (!transactionHash || !showStatus) return null;

  const explorerLink = explorerUrl ? `https://sepolia.abscan.org/tx/${explorerUrl}` : undefined;

  return (
    <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg text-center w-full">
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm sm:text-base font-medium font-[family-name:var(--font-roobert)]">
          {isSuccess ? (
            <>
              Transaction Success
              <span className="ml-1 text-green-500">✅</span>
            </>
          ) : (
            <>
              Transaction Pending
              <span className="ml-1 text-yellow-500">⏳</span>
            </>
          )}
        </p>

        {explorerLink && (
          <a
            href={explorerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 underline"
          >
            View on Explorer
          </a>
        )}

        <button
          onClick={() => setShowStatus(false)}
          className="mt-2 px-4 py-2 text-sm text-white/60 hover:text-white border border-white/20 rounded-full hover:border-white/40 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
} 