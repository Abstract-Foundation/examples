import Image from 'next/image';
import { Currency } from '@/services/onramp';

interface CryptocurrencyCardProps {
  currency: Currency;
  isSelected?: boolean;
  onClick: () => void;
}

export function CryptocurrencyCard({ currency, isSelected = false, onClick }: CryptocurrencyCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group w-full p-4 rounded-lg border transition-all duration-200 text-left cursor-pointer hover:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 ${
        isSelected
          ? 'border-green-500 bg-green-500/5'
          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:shadow-lg'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {currency.symbolImageUrl ? (
            <Image
              src={currency.symbolImageUrl}
              alt={currency.name}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {currency.symbol?.charAt(0) || currency.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium truncate">
              {currency.name}
            </h3>
            <span className="text-gray-400 text-sm font-mono group-hover:text-green-400 group-hover:font-bold transition-all duration-300 group-hover:tracking-wide">
              {currency.symbol}
            </span>
          </div>
          {currency.chainName && (
            <p className="text-gray-400 text-sm mt-1">
              {currency.chainName}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}