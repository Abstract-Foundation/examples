"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { type Currency } from '@/services/onramp';
import { 
  formatAmountInput, 
  formatFiatCurrency, 
  formatCryptoCurrency,
  getCurrencySymbol,
  getPresetAmounts,
  isValidAmount,
  parseAmount,
  convertCurrency
} from '@/utils/currencyUtils';

interface SmartAmountInputProps {
  fiatCurrency: Currency; // The fiat currency the user will pay with (USD, EUR, etc.)
  cryptoCurrency: Currency; // The crypto currency they'll receive (ETH, USDC, etc.)
  availableCryptos: Currency[]; // List of crypto options they can choose from
  exchangeRate: number; // How much 1 unit of fiat equals in crypto (rough estimate)
  initialFiatAmount: number; // Starting amount to show in the input
  limits?: {
    currencyCode: string;
    defaultAmount: number;
    minimumAmount: number; // Smallest amount they can buy
    maximumAmount: number; // Largest amount they can buy
  };
  onAmountChange: (fiatAmount: number, cryptoAmount: number) => void; // Called when user changes amount
  onCryptoChange: (currency: Currency) => void; // Called when user picks different crypto
  onValidationChange?: (isValid: boolean) => void; // Called when validation status changes
}

export function SmartAmountInput({ 
  fiatCurrency, 
  cryptoCurrency,
  availableCryptos,
  exchangeRate, 
  initialFiatAmount,
  limits,
  onAmountChange,
  onCryptoChange,
  onValidationChange
}: SmartAmountInputProps) {
  // Keep track of what the user has typed (as a string to preserve formatting)
  const [inputValue, setInputValue] = useState(initialFiatAmount.toString());
  
  // Any validation error message to show the user
  const [error, setError] = useState('');
  
  // Reference to the input element so we can focus it
  const inputRef = useRef<HTMLInputElement>(null);

  // Update the input when the parent component changes the initial amount
  // This happens when the user switches crypto currencies, for example
  useEffect(() => {
    setInputValue(initialFiatAmount.toString());
  }, [initialFiatAmount, fiatCurrency.currencyCode]);

  // Auto-focus the input when the component first loads for better UX
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // This function converts between fiat and crypto amounts without validation callbacks
  const convertAmount = useCallback((value: string) => {
    // First check if it's a valid number
    if (!isValidAmount(value)) {
      return null;
    }

    const amount = parseAmount(value);
    const conversion = convertCurrency(amount, exchangeRate, fiatCurrency, cryptoCurrency);

    // Check against the API's min/max limits for this currency
    if (limits) {
      if (conversion.fiatAmount < limits.minimumAmount) {
        return null;
      }
      
      if (conversion.fiatAmount > limits.maximumAmount) {
        return null;
      }
    }

    return conversion;
  }, [exchangeRate, fiatCurrency, cryptoCurrency, limits]);

  // This function validates the user's input and updates state/callbacks
  const validateAndConvert = useCallback((value: string) => {
    // First check if it's a valid number
    if (!isValidAmount(value)) {
      setError('Please enter a valid amount');
      onValidationChange?.(false); // Tell parent the amount is invalid
      return null;
    }

    const amount = parseAmount(value);
    const conversion = convertCurrency(amount, exchangeRate, fiatCurrency, cryptoCurrency);

    // Check against the API's min/max limits for this currency
    if (limits) {
      if (conversion.fiatAmount < limits.minimumAmount) {
        setError(`Minimum amount is ${formatFiatCurrency(limits.minimumAmount, fiatCurrency.currencyCode)}`);
        onValidationChange?.(false);
        return null;
      }
      
      if (conversion.fiatAmount > limits.maximumAmount) {
        setError(`Maximum amount is ${formatFiatCurrency(limits.maximumAmount, fiatCurrency.currencyCode)}`);
        onValidationChange?.(false);
        return null;
      }
    }

    // If we got here, the amount is valid
    setError('');
    onValidationChange?.(true); // Tell parent the amount is valid
    return conversion;
  }, [exchangeRate, fiatCurrency, cryptoCurrency, limits, onValidationChange]);

  // Called when the user types in the input field
  const handleInputChange = (value: string) => {
    // Clean up the input (remove invalid characters, etc.)
    const formatted = formatAmountInput(value);
    setInputValue(formatted);

    // Validate and convert the amount
    const conversion = validateAndConvert(formatted);
    if (conversion) {
      // Tell the parent component about the new amounts
      onAmountChange(conversion.fiatAmount, conversion.cryptoAmount);
    }
  };

  // Called when the user picks a different crypto currency from the dropdown
  const handleCryptoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCrypto = availableCryptos.find(crypto => crypto.currencyCode === event.target.value);
    if (selectedCrypto) {
      onCryptoChange(selectedCrypto);
    }
  };

  // Called when the user clicks one of the preset amount buttons
  const handlePresetAmount = (amount: number) => {
    setInputValue(amount.toString());
    
    // Validate the preset amount (it should always be valid, but just in case)
    const conversion = validateAndConvert(amount.toString());
    if (conversion) {
      onAmountChange(conversion.fiatAmount, conversion.cryptoAmount);
    }
  };

  // Calculate how much crypto the user will get for their fiat amount
  // This is memoized to prevent excessive re-calculations as the user types
  const equivalentCryptoAmount = useMemo(() => {
    const conversion = convertAmount(inputValue);
    if (!conversion) return '';
    
    return formatCryptoCurrency(conversion.cryptoAmount, cryptoCurrency.currencyCode);
  }, [inputValue, cryptoCurrency, convertAmount]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-4 text-center">
          Amount to purchase
        </label>
        
        {/* Main Input */}
        <div className="relative text-center">
          <input
            type="text"
            inputMode="decimal"
            value={`${getCurrencySymbol(fiatCurrency.currencyCode)}${inputValue}`}
            onChange={(e) => {
              let value = e.target.value;
              // Remove currency symbol from the start
              const symbol = getCurrencySymbol(fiatCurrency.currencyCode);
              if (value.startsWith(symbol)) {
                value = value.slice(symbol.length);
              }
              handleInputChange(value);
            }}
            placeholder="Enter amount"
            ref={inputRef}
            className="w-full bg-transparent border-none text-white focus:outline-none text-5xl font-bold text-center caret-white"
          />
        </div>

        {/* Equivalent Crypto Amount Display with Inline Currency Selector */}
        {inputValue && !error && (
          <div className="mt-2 text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-lg text-gray-300">≈ {equivalentCryptoAmount.split(' ')[0]}</span>
              <div className="relative">
                <select
                  value={cryptoCurrency.currencyCode}
                  onChange={handleCryptoChange}
                  className="appearance-none bg-transparent border-none text-lg text-gray-300 focus:outline-none cursor-pointer pr-4"
                  style={{ textAlignLast: 'center' }}
                >
                  {availableCryptos.map((crypto) => (
                    <option 
                      key={crypto.currencyCode} 
                      value={crypto.currencyCode}
                      className="bg-gray-800 text-white"
                    >
                      {crypto.symbol || crypto.currencyCode.replace('_BASE', '')}
                    </option>
                  ))}
                </select>
                <svg 
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-2 text-sm text-red-400 text-center">
            {error}
          </div>
        )}
      </div>

      {/* Preset Amounts */}
      {limits && (
        <div className="space-y-2 text-center">
          <p className="text-sm text-gray-400">Quick amounts:</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {getPresetAmounts(fiatCurrency.currencyCode)
              .filter(amount => amount <= limits.maximumAmount)
              .map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handlePresetAmount(amount)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm transition-colors"
                >
                  {getCurrencySymbol(fiatCurrency.currencyCode)}{amount}
                </button>
              ))}
          </div>
        </div>
      )}

    </div>
  );
}