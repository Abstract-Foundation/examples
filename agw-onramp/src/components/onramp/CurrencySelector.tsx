import { useState, useRef } from 'react';
import { Currency } from '@/services/onramp';

interface CurrencySelectorProps {
  selectedCurrency: Currency | null;
  onClick: () => void;
}

export function CurrencySelector({ selectedCurrency, onClick }: CurrencySelectorProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [scrambledText, setScrambledText] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (!selectedCurrency || !selectedCurrency.currencyCode) return;
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setIsHovered(true);
    const originalCode = selectedCurrency.currencyCode;
    let iterations = 0;
    
    intervalRef.current = setInterval(() => {
      setScrambledText(() => {
        return originalCode.split('').map((_, index) => {
          if (index < iterations) {
            return originalCode[index];
          }
          return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
        }).join('');
      });
      
      if (iterations >= originalCode.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setScrambledText(originalCode);
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
    if (selectedCurrency && selectedCurrency.currencyCode) {
      setScrambledText(selectedCurrency.currencyCode);
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
          <span className="text-lg font-semibold">
            <span className="font-mono">{isHovered && scrambledText ? scrambledText : selectedCurrency.currencyCode}</span>
          </span>
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
          <span className="text-lg font-semibold">Select Currency</span>
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