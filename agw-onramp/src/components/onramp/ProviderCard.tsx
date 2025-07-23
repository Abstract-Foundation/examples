import Image from 'next/image';
import { Quote } from '@/services/onramp';

interface ProviderCardProps {
  serviceProvider: string;
  quote?: Quote;
  logoUrl?: string;
  isSelected?: boolean;
  onClick: () => void;
}

export function ProviderCard({ serviceProvider, quote, logoUrl, isSelected = false, onClick }: ProviderCardProps) {
  const feePercentage = quote ? ((quote.totalFee / quote.sourceAmountWithoutFees) * 100).toFixed(1) : null;
  
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
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`${serviceProvider} logo`}
              width={32}
              height={32}
              className="rounded"
            />
          ) : (
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {serviceProvider.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium truncate">
              {serviceProvider}
            </h3>
            <div className="text-right">
              {feePercentage ? (
                <span className="text-gray-400 text-sm font-mono group-hover:text-green-400 group-hover:font-bold transition-all duration-300 group-hover:tracking-wide">
                  {feePercentage}%
                </span>
              ) : (
                <span className="text-gray-500 text-sm">
                  No quote
                </span>
              )}
            </div>
          </div>
          {quote && (
            <div className="flex items-center justify-between mt-1">
              <p className="text-gray-400 text-sm">
                Fee: ${quote.totalFee.toFixed(2)}
              </p>
              <p className="text-gray-400 text-sm">
                Rate: {(1 / quote.exchangeRate).toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}