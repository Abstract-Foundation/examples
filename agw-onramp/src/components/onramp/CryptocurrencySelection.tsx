import { useState, useEffect, useRef } from 'react';
import { Currency } from '@/services/onramp';
import { CryptocurrencyCard } from './CryptocurrencyCard';

interface CryptocurrencySelectionProps {
  currencies: Currency[];
  selectedCurrency: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  onBack: () => void;
}

export function CryptocurrencySelection({
  currencies,
  selectedCurrency,
  onCurrencySelect,
  onBack,
}: CryptocurrencySelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredCurrencies = currencies.filter(
    (currency) =>
      currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (currency.symbol || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  function handleCurrencySelect(currency: Currency) {
    onCurrencySelect(currency);
    onBack();
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
          Select Cryptocurrency
        </h2>
        <div className="w-16" /> {/* Spacer for center alignment */}
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search cryptocurrencies..."
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
        />
      </div>

      {/* Currency List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredCurrencies.length > 0 ? (
          <div className="space-y-2">
            {filteredCurrencies.map((currency) => (
              <CryptocurrencyCard
                key={currency.symbol}
                currency={currency}
                isSelected={selectedCurrency?.symbol === currency.symbol}
                onClick={() => handleCurrencySelect(currency)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-400">No cryptocurrencies found</p>
            <p className="text-gray-500 text-sm mt-1">
              Try adjusting your search terms
            </p>
          </div>
        )}
      </div>
    </div>
  );
}