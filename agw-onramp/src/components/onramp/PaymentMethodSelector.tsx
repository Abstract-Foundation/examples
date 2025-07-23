import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { PaymentMethod } from '@/services/onramp';
import { getPaymentMethodDisplayName, getPaymentMethodIcon } from '@/utils/deviceDetection';

interface PaymentMethodSelectorProps {
  selectedPaymentMethod: PaymentMethod | null;
  onClick: () => void;
}

export function PaymentMethodSelector({ selectedPaymentMethod, onClick }: PaymentMethodSelectorProps) {
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
    if (!selectedPaymentMethod) return;
    
    setIsHovered(true);
    const originalText = getPaymentMethodDisplayName(selectedPaymentMethod);
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
    if (selectedPaymentMethod) {
      setScrambledText(getPaymentMethodDisplayName(selectedPaymentMethod));
    }
  };

  const displayText = selectedPaymentMethod 
    ? (isHovered ? scrambledText : getPaymentMethodDisplayName(selectedPaymentMethod))
    : 'Select Payment Method';

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="flex items-center space-x-2 text-white hover:text-gray-300 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/50 rounded-lg p-1"
    >
      <div className="hidden sm:flex">
        {selectedPaymentMethod ? (
          selectedPaymentMethod.logos?.dark ? (
            <Image
              src={selectedPaymentMethod.logos.dark}
              alt={`${selectedPaymentMethod.name} logo`}
              width={20}
              height={20}
              className="rounded"
            />
          ) : (
            <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center">
              <span className="text-xs">
                {getPaymentMethodIcon(selectedPaymentMethod)}
              </span>
            </div>
          )
        ) : (
          <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center">
            <span className="text-xs">💳</span>
          </div>
        )}
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