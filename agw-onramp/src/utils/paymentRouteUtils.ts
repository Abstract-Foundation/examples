import { PaymentMethod, Quote } from '@/services/onramp';
import { getSmartPaymentMethod } from './deviceDetection';

export interface PaymentRoute {
  id: string;
  paymentMethod: PaymentMethod;
  serviceProvider: string;
  quote: Quote;
  displayName: string;
  totalFee: number;
}

/**
 * Gets the smart default payment route based on device detection and lowest fees
 */
export function getSmartDefaultPaymentRoute(
  paymentMethods: PaymentMethod[],
  quotes: Quote[]
): { paymentMethod: PaymentMethod; provider: string } | null {
  if (paymentMethods.length === 0 || quotes.length === 0) {
    return null;
  }

  // 1. Get smart payment method based on device
  const smartPaymentMethod = getSmartPaymentMethod(paymentMethods);
  
  // 2. Filter quotes for that payment method
  const relevantQuotes = smartPaymentMethod 
    ? quotes.filter(q => q.paymentMethodType === smartPaymentMethod.paymentMethod)
    : [];
  
  // If no quotes for smart payment method, fall back to any quotes
  const quotesToConsider = relevantQuotes.length > 0 ? relevantQuotes : quotes;
  
  // 3. Find provider with lowest total fee
  const bestQuote = quotesToConsider.reduce((best, current) => 
    current.totalFee < best.totalFee ? current : best
  );

  // 4. Get the actual payment method for the best quote
  const actualPaymentMethod = paymentMethods.find(
    pm => pm.paymentMethod === bestQuote.paymentMethodType
  ) || smartPaymentMethod;

  if (!actualPaymentMethod) {
    return null;
  }

  return {
    paymentMethod: actualPaymentMethod,
    provider: bestQuote.serviceProvider
  };
}

/**
 * Creates payment route combinations from available quotes
 */
export function createPaymentRoutes(
  paymentMethods: PaymentMethod[],
  quotes: Quote[]
): PaymentRoute[] {
  const routes: PaymentRoute[] = [];
  
  // Group quotes by payment method and provider combination
  quotes.forEach(quote => {
    const paymentMethod = paymentMethods.find(
      pm => pm.paymentMethod === quote.paymentMethodType
    );
    
    if (paymentMethod) {
      const route: PaymentRoute = {
        id: `${quote.paymentMethodType}-${quote.serviceProvider}`,
        paymentMethod,
        serviceProvider: quote.serviceProvider,
        quote,
        displayName: `${paymentMethod.name} via ${quote.serviceProvider}`,
        totalFee: quote.totalFee
      };
      
      routes.push(route);
    }
  });
  
  // Sort by lowest fees first
  return routes.sort((a, b) => a.totalFee - b.totalFee);
}

/**
 * Gets available providers for a specific payment method
 */
export function getProvidersForPaymentMethod(
  paymentMethodType: string,
  quotes: Quote[]
): string[] {
  const providers = quotes
    .filter(q => q.paymentMethodType === paymentMethodType)
    .map(q => q.serviceProvider);
  
  return Array.from(new Set(providers));
}

/**
 * Gets the best quote for a specific payment method and provider combination
 */
export function getBestQuoteForRoute(
  paymentMethodType: string,
  provider: string,
  quotes: Quote[]
): Quote | null {
  const relevantQuotes = quotes.filter(
    q => q.paymentMethodType === paymentMethodType && q.serviceProvider === provider
  );
  
  if (relevantQuotes.length === 0) return null;
  
  return relevantQuotes.reduce((best, current) => 
    current.totalFee < best.totalFee ? current : best
  );
}