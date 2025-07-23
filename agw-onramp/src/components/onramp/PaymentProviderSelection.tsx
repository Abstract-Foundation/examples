import { Quote } from '@/services/onramp';

interface PaymentProviderSelectionProps {
  quotes: Quote[];
  selectedProvider: string | null;
  onProviderSelect: (provider: string) => void;
  onBack: () => void;
}

export function PaymentProviderSelection({
  quotes,
  selectedProvider,
  onProviderSelect,
  onBack,
}: PaymentProviderSelectionProps) {

  // Get unique providers from quotes
  const providers = Array.from(new Set(quotes.map(q => q.serviceProvider)));

  // Get the best quote for each provider (lowest fee)
  const providerQuotes = providers.map(provider => {
    const providerQuoteList = quotes.filter(q => q.serviceProvider === provider);
    const bestQuote = providerQuoteList.reduce((best, current) => 
      current.totalFee < best.totalFee ? current : best
    );
    return { provider, quote: bestQuote };
  });

  // Sort by lowest fees
  providerQuotes.sort((a, b) => a.quote.totalFee - b.quote.totalFee);

  function handleProviderSelect(provider: string) {
    onProviderSelect(provider);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/50 rounded p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
        <h2 className="text-xl font-semibold text-white">
          Select Provider
        </h2>
        <div className="w-16" /> {/* Spacer for center alignment */}
      </div>

      {/* Providers */}
      <div className="space-y-3">
        {providerQuotes.map(({ provider, quote }) => {
          const feePercentage = ((quote.totalFee / quote.sourceAmountWithoutFees) * 100).toFixed(1);
          const isSelected = selectedProvider === provider;

          return (
            <button
              key={provider}
              onClick={() => handleProviderSelect(provider)}
              className={`w-full p-4 rounded-lg border transition-all duration-200 text-left hover:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 ${
                isSelected 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {provider.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">
                      {provider}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {feePercentage}% fees
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    ${quote.totalFee.toFixed(2)} fee
                  </p>
                  <p className="text-xs text-gray-400">
                    {quote.destinationAmount.toFixed(6)} received
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {providers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">No providers available for current selection</p>
        </div>
      )}
    </div>
  );
}