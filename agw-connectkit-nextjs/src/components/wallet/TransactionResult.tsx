interface TransactionResultProps {
  transactionHash: string;
  status: string;
}

export const TransactionResult = ({
  transactionHash,
  status,
}: TransactionResultProps) => (
  <a
    href={`https://explorer.testnet.abs.xyz/tx/${transactionHash}`}
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-green-400 transition-colors"
  >
    <p className="text-sm sm:text-base font-medium font-[family-name:var(--font-roobert)] mb-1">
      Transaction Status: {status}
    </p>
    <p className="text-xs text-gray-400 font-mono">
      {transactionHash?.slice(0, 8)}...{transactionHash?.slice(-6)}
    </p>
  </a>
);
