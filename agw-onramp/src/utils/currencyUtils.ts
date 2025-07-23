/**
* Utilities for formatting/validating/converting between different currencies on the UI.
*/

import { type Currency } from '@/services/onramp';

// Simple conversion result - always converts from fiat input to crypto output
export interface CurrencyConversion {
  fiatAmount: number;
  cryptoAmount: number;
  exchangeRate: number;
  fiatCurrency: string;
  cryptoCurrency: string;
}

export function formatCurrency(amount: number, currencyCode: string, options?: {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}): string {
  const { minimumFractionDigits = 2, maximumFractionDigits = 6 } = options || {};
  
  // Clean up currency code (remove _BASE suffix)
  // From a technical POV, we get currency on Base chain first and bridge to Abstract.
  // But we don't want to confuse users by showing them Base in the UI.
  const cleanCurrencyCode = currencyCode.replace('_BASE', '');
  
  const formattedNumber = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
  
  return `${formattedNumber} ${cleanCurrencyCode}`;
}

export function formatFiatCurrency(amount: number, currencyCode: string): string {
  return formatCurrency(amount, currencyCode, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCryptoCurrency(amount: number, currencyCode: string): string {
  const cleanCode = currencyCode.replace('_BASE', '');
  
  // Different precision for different crypto currencies
  const precision = cleanCode === 'USDC' ? 2 : 6;
  
  return formatCurrency(amount, currencyCode, {
    minimumFractionDigits: 2,
    maximumFractionDigits: precision,
  });
}

export function getCurrencyDisplayName(currency: Currency): string {
  if (currency.currencyCode === 'ETH_BASE') {
    return 'Ether';
  }
  return currency.name;
}

export function getCurrencySymbol(currencyCode: string): string {
  const cleanCode = currencyCode.replace('_BASE', '');
  
  switch (cleanCode) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'CAD':
      return 'C$';
    case 'AUD':
      return 'A$';
    case 'JPY':
      return '¥';
    default:
      return cleanCode;
  }
}

// Convert fiat amount to crypto amount using the exchange rate
// Always assumes fiat input -> crypto output (no bi-directional conversion needed)
export function convertCurrency(
  fiatAmount: number,
  exchangeRate: number,
  fiatCurrency: Currency,
  cryptoCurrency: Currency
): CurrencyConversion {
  const cryptoAmount = fiatAmount / exchangeRate;
  
  return {
    fiatAmount,
    cryptoAmount,
    exchangeRate,
    fiatCurrency: fiatCurrency.currencyCode,
    cryptoCurrency: cryptoCurrency.currencyCode,
  };
}

// The API returns a default amount, this is just a backup if it doesn't.
export function getDefaultFiatAmount(currencyCode: string): number {
  const cleanCode = currencyCode.replace('_BASE', '');
  
  // Default amounts based on currency
  switch (cleanCode) {
    case 'USD':
      return 50;
    case 'EUR':
      return 45;
    case 'GBP':
      return 40;
    case 'CAD':
      return 65;
    case 'AUD':
      return 75;
    case 'JPY':
      return 7500;
    default:
      return 50; // Default to 50 units
  }
}

// This is for our "quick amount" presets.
export function getPresetAmounts(currencyCode: string): number[] {
  const defaultAmount = getDefaultFiatAmount(currencyCode);
  
  return [
    defaultAmount,
    defaultAmount * 2,
    defaultAmount * 5,
  ];
}

export function isValidAmount(amount: string): boolean {
  if (!amount || amount.trim() === '') return false;
  
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && isFinite(num);
}

export function parseAmount(amount: string): number {
  if (!isValidAmount(amount)) return 0;
  return parseFloat(amount);
}

export function formatAmountInput(value: string): string {
  // Remove any non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, '');
  
  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  
  return cleaned;
}