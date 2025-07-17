"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { type Currency } from '@/services/onramp';
import { 
  formatAmountInput, 
  formatFiatCurrency,
  getCurrencySymbol,
  isValidAmount,
  parseAmount
} from '@/utils/currencyUtils';

interface SmartAmountInputProps {
  fiatCurrency: Currency; // The fiat currency the user will pay with (USD, EUR, etc.)
  cryptoCurrency: Currency; // The crypto currency they'll receive (ETH, USDC, etc.)
  initialFiatAmount: number; // Starting amount to show in the input
  limits?: {
    currencyCode: string;
    defaultAmount: number;
    minimumAmount: number; // Smallest amount they can buy
    maximumAmount: number; // Largest amount they can buy
  };
  onAmountChange: (fiatAmount: number, cryptoAmount: number) => void; // Called when user changes amount
  onValidationChange?: (isValid: boolean) => void; // Called when validation status changes
}

export function SmartAmountInput({ 
  fiatCurrency, 
  cryptoCurrency,
  initialFiatAmount,
  limits,
  onAmountChange,
  onValidationChange
}: SmartAmountInputProps) {
  // Store the raw numeric input (what user logically typed)
  const [rawValue, setRawValue] = useState(initialFiatAmount.toString());
  
  // Any validation error message to show the user
  const [error, setError] = useState('');
  
  // Reference to the input element
  const inputRef = useRef<HTMLInputElement>(null);

  // Format the raw value for display
  function formatForDisplay(value: string): string {
    if (!value || value === '' || value === '.') {
      return value;
    }

    const num = parseFloat(value);
    if (isNaN(num)) {
      return value; // Return as-is if not a valid number
    }

    // Format with commas and ensure 2 decimal places
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Calculate cursor position in formatted string based on raw string position
  function calculateFormattedCursorPosition(rawValue: string, rawCursorPos: number): number {
    if (rawCursorPos === 0) return 1; // After the $
    
    // Get the part of raw value before cursor
    const beforeCursor = rawValue.slice(0, rawCursorPos);
    
    // Format just the part before cursor
    const num = parseFloat(beforeCursor);
    if (isNaN(num)) {
      return rawCursorPos + 1; // +1 for the $
    }
    
    const formattedBefore = num.toLocaleString('en-US');
    return formattedBefore.length + 1; // +1 for the $
  }

  // Calculate raw cursor position from formatted cursor position
  function calculateRawCursorPosition(formattedValue: string, formattedCursorPos: number): number {
    if (formattedCursorPos <= 1) return 0;
    
    // Remove $ and get the part before cursor
    const withoutDollar = formattedValue.slice(1, formattedCursorPos);
    
    // Remove commas to get raw position
    const rawBefore = withoutDollar.replace(/,/g, '');
    return rawBefore.length;
  }

  // Update input when props change
  useEffect(() => {
    setRawValue(initialFiatAmount.toString());
  }, [initialFiatAmount, fiatCurrency.currencyCode]);

  // Auto-focus the input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Validation function
  const validateAmount = useCallback((value: string) => {
    // Empty input is allowed
    if (!value.trim()) {
      setError('');
      onValidationChange?.(false);
      return null;
    }

    // Check if it's a valid number format
    if (!isValidAmount(value)) {
      setError('Please enter a valid amount');
      onValidationChange?.(false);
      return null;
    }

    const numValue = parseAmount(value);

    // Check against limits
    if (limits) {
      if (numValue < limits.minimumAmount) {
        setError(`Minimum amount is ${formatFiatCurrency(limits.minimumAmount, fiatCurrency.currencyCode)}`);
        onValidationChange?.(false);
        return null;
      }
      
      if (numValue > limits.maximumAmount) {
        setError(`Maximum amount is ${formatFiatCurrency(limits.maximumAmount, fiatCurrency.currencyCode)}`);
        onValidationChange?.(false);
        return null;
      }
    }

    setError('');
    onValidationChange?.(true);
    return numValue;
  }, [fiatCurrency, limits, onValidationChange]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = e.target.value;
    const formattedCursorPos = e.target.selectionStart || 0;
    
    // Remove $ symbol
    let value = formattedValue.startsWith('$') ? formattedValue.slice(1) : formattedValue;
    
    // Remove commas and any non-numeric chars except decimal
    value = value.replace(/[^0-9.]/g, '');
    
    // Handle multiple decimal points
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit decimal places to 2
    if (parts.length === 2 && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].slice(0, 2);
    }
    
    setRawValue(value);
    
    // Calculate where cursor should be in raw value
    const rawCursorPos = calculateRawCursorPosition(formattedValue, formattedCursorPos);
    
    // Format and restore cursor position
    setTimeout(() => {
      if (inputRef.current) {
        const newFormattedPos = calculateFormattedCursorPosition(value, rawCursorPos);
        inputRef.current.setSelectionRange(newFormattedPos, newFormattedPos);
      }
    }, 0);
    
    // Validate and notify parent
    const amount = validateAmount(value);
    if (amount !== null) {
      onAmountChange(amount, 0);
    }
  };

  // Prevent cursor from moving before the $ symbol
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    
    // Prevent left arrow key from moving cursor before $
    if (e.key === 'ArrowLeft' && cursorPosition <= 1) {
      e.preventDefault();
    }
    
    // Prevent home key from moving cursor before $
    if (e.key === 'Home') {
      e.preventDefault();
      input.setSelectionRange(1, 1);
    }
  };

  // Prevent clicking before the $ symbol
  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    setTimeout(() => {
      const cursorPosition = input.selectionStart || 0;
      if (cursorPosition < 1) {
        input.setSelectionRange(1, 1);
      }
    }, 0);
  };

  // Prevent text selection from including the $ symbol
  const handleSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    setTimeout(() => {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      
      if (start < 1) {
        input.setSelectionRange(Math.max(1, start), Math.max(1, end));
      }
    }, 0);
  };

  const displayValue = formatForDisplay(rawValue);

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
            value={`$${displayValue}`}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onClick={handleClick}
            onSelect={handleSelect}
            placeholder="$0.00"
            ref={inputRef}
            className="w-full bg-transparent border-none text-white focus:outline-none text-5xl font-bold text-center caret-white"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 text-sm text-red-400 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}