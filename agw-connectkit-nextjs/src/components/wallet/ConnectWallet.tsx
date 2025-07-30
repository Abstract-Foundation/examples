interface ConnectedWalletProps {
  address: string;
  onLogout: () => void;
  onSubmitTransaction: () => void;
  canSubmitTransaction: boolean;
  transactionReceipt?: {
    transactionHash: string;
    status: string;
  } | null;
}

export default function ConnectedWallet({
  address,
  onLogout,
  onSubmitTransaction,
  canSubmitTransaction,
  transactionReceipt,
}: ConnectedWalletProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 shadow-lg backdrop-blur-sm max-w-sm w-full">
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="text-sm sm:text-base font-medium font-[family-name:var(--font-roobert)] mb-1">
            Connected to Abstract Global Wallet
          </p>
          <p className="text-xs text-gray-400 font-mono">{address}</p>
          <p className="text-sm sm:text-base font-medium font-[family-name:var(--font-roobert)] mb-1">
            <a
              href={`https://explorer.testnet.abs.xyz/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Explorer
            </a>
          </p>
        </div>
        <div className="flex gap-2 w-full">
          <button
            className="rounded-full border border-solid border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-sm h-10 px-5 font-[family-name:var(--font-roobert)] flex-1"
            onClick={onLogout}
          >
            <svg
              className="w-4 h-4"
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
          <button
            className={`rounded-full border border-solid transition-colors flex items-center justify-center text-white gap-2 text-sm h-10 px-5 font-[family-name:var(--font-roobert)] flex-1 w-[140px]
                ${
                  !canSubmitTransaction
                    ? "bg-gray-500 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 border-transparent"
                }`}
            onClick={onSubmitTransaction}
            disabled={!canSubmitTransaction}
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="w-full text-center">Submit tx</span>
          </button>
        </div>
        {!!transactionReceipt && (
          <a
            href={`https://explorer.testnet.abs.xyz/tx/${transactionReceipt?.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className="text-sm sm:text-base font-medium font-[family-name:var(--font-roobert)] mb-1">
              Transaction Status: {transactionReceipt?.status}
            </p>
            <p className="text-xs text-gray-400 font-mono">
              {transactionReceipt?.transactionHash?.slice(0, 8)}...
              {transactionReceipt?.transactionHash?.slice(-6)}
            </p>
          </a>
        )}
      </div>
    </div>
  );
}
