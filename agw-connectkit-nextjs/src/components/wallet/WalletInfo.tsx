interface WalletInfoProps {
  address: string;
}

export const WalletInfo = ({ address }: WalletInfoProps) => (
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
        className="hover:text-green-400 transition-colors"
      >
        View on Explorer
      </a>
    </p>
  </div>
);
