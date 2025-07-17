import { useState, useEffect, useRef } from 'react';

interface PaymentProviderSelectorProps {
  selectedProvider: string | null;
  onClick: () => void;
}

export function PaymentProviderSelector({ selectedProvider, onClick }: PaymentProviderSelectorProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [scrambledText, setScrambledText] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (!selectedProvider) return;
    
    setIsHovered(true);
    const originalText = selectedProvider;
    let iterations = 0;

    intervalRef.current = setInterval(() => {
      setScrambledText(() => {
        return originalText.split('').map((char, index) => {
          if (index < iterations) {
            return originalText[index];
          }
          return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
        }).join('');
      });

      if (iterations >= originalText.length) {
        clearInterval(intervalRef.current!);
        setScrambledText(originalText);
      }

      iterations += 1/3;
    }, 30);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (selectedProvider) {
      setScrambledText(selectedProvider);
    }
  };

  const displayText = selectedProvider 
    ? `via ${isHovered ? scrambledText : selectedProvider}`
    : 'via Provider';

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="flex items-center space-x-2 text-white hover:text-gray-300 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/50 rounded-lg p-1"
    >
      <div className="hidden sm:flex w-6 h-6 bg-white/10 rounded-full items-center justify-center">
        <span className="text-xs font-medium">
          {selectedProvider?.charAt(0) || '?'}
        </span>
      </div>
      <span className="text-lg font-semibold">
        {displayText}
      </span>
      <svg 
        className="w-4 h-4 text-gray-400 transition-transform duration-200" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}