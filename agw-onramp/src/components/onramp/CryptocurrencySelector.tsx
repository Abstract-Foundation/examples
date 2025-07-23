import Image from 'next/image';
import { useState, useRef } from 'react';
import { Currency } from '@/services/onramp';

interface CryptocurrencySelectorProps {
  selectedCurrency: Currency | null;
  onClick: () => void;
}

export function CryptocurrencySelector({ selectedCurrency, onClick }: CryptocurrencySelectorProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [scrambledText, setScrambledText] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (!selectedCurrency || !selectedCurrency.symbol) return;
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setIsHovered(true);
    const originalSymbol = selectedCurrency.symbol;
    let iterations = 0;
    
    intervalRef.current = setInterval(() => {
      setScrambledText(() => {
        return originalSymbol.split('').map((_, index) => {
          if (index < iterations) {
            return originalSymbol[index];
          }
          return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
        }).join('');
      });
      
      if (iterations >= originalSymbol.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setScrambledText(originalSymbol);
      }
      
      iterations += 1/3;
    }, 30);
  };

  const handleMouseLeave = () => {
    // Clear interval on mouse leave
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsHovered(false);
    if (selectedCurrency && selectedCurrency.symbol) {
      setScrambledText(selectedCurrency.symbol);
    }
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="flex items-center space-x-2 text-white hover:text-gray-300 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/50 rounded-lg p-1"
    >
      {selectedCurrency ? (
        <>
          <div className="flex items-center space-x-2">
            {selectedCurrency.symbolImageUrl ? (
              <Image
                src={selectedCurrency.symbolImageUrl}
                alt={selectedCurrency.name}
                width={24}
                height={24}
                className="rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-white">
                  {selectedCurrency.symbol?.charAt(0) || selectedCurrency.name.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-lg font-semibold">
              Buy <span className="font-mono">{isHovered && scrambledText ? scrambledText : selectedCurrency.symbol}</span>
            </span>
          </div>
          <svg 
            className="w-4 h-4 text-gray-400 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </>
      ) : (
        <>
          <span className="text-lg font-semibold">Buy Crypto</span>
          <svg 
            className="w-4 h-4 text-gray-400 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </>
      )}
    </button>
  );
}