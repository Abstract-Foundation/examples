/**
 * Utilities for detecting the user's device and browser to automatically select
 * the most relevant payment method to default to when we open the checkout page. e.g:
 * - Apple Pay on iOS/macOS devices
 * - Google Pay on Android or Chrome
 * - Credit card as universal fallback
 * 
 * This is just a nice-to-have for improved UX.
 */

import { type PaymentMethod } from '@/services/onramp';

export interface DeviceInfo {
  isApple: boolean; // iOS, macOS devices
  isAndroid: boolean; // Android devices
  isChrome: boolean; // Chrome browser (supports Google Pay)
  isSafari: boolean; // Safari browser
  isMobile: boolean; // Any mobile device
  userAgent: string; // Full user agent string for debugging
}

// Detect the user's device and browser for smart payment method selection
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    // Server-side rendering fallback - can't detect device on server
    return {
      isApple: false,
      isAndroid: false,
      isChrome: false,
      isSafari: false,
      isMobile: false,
      userAgent: '',
    };
  }

  const userAgent = window.navigator.userAgent;
  
  // Detect Apple devices (iPhone, iPad, Mac)
  // These users likely have Apple Pay set up
  const isApple = /Mac|iPhone|iPad|iPod/.test(userAgent);
  
  // Detect Android devices
  // These users might have Google Pay
  const isAndroid = /Android/.test(userAgent);
  
  // Detect Chrome browser (exclude Edge which also includes "Chrome" in UA)
  // Chrome users can use Google Pay on web
  const isChrome = /Chrome/.test(userAgent) && !/Edge|Edg/.test(userAgent);
  
  // Detect Safari browser (exclude Chrome on iOS which also includes "Safari")
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  
  // Detect mobile devices for different UX considerations
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/.test(userAgent);

  return {
    isApple,
    isAndroid,
    isChrome,
    isSafari,
    isMobile,
    userAgent, // Keep full UA for debugging
  };
}

// Pick the best payment method for the user's device.
export function getSmartPaymentMethod(paymentMethods: PaymentMethod[]): PaymentMethod | null {
  if (paymentMethods.length === 0) return null;

  const deviceInfo = getDeviceInfo();
  
  // Priority order: try most convenient methods first, fall back to universal ones
  const priorities: Array<{ condition: boolean; methodName: string }> = [
    // Apple Pay for Apple devices - high convenience, high adoption on Apple devices
    { condition: deviceInfo.isApple, methodName: 'APPLE_PAY' },
    // Google Pay for Android or Chrome - good for Android users and Chrome desktop
    { condition: deviceInfo.isAndroid || deviceInfo.isChrome, methodName: 'GOOGLE_PAY' },
    // Credit/Debit Card - universal fallback that works everywhere
    { condition: true, methodName: 'CREDIT_DEBIT_CARD' },
  ];

  // Find the first matching payment method that's available
  for (const priority of priorities) {
    if (priority.condition) {
      const method = paymentMethods.find(m => m.paymentMethod === priority.methodName);
      if (method) {
        return method;
      }
    }
  }

  // If none of our preferred methods are available, just use the first one
  return paymentMethods[0];
}

// Get a user-friendly display name for payment methods
export function getPaymentMethodDisplayName(paymentMethod: PaymentMethod): string {
  switch (paymentMethod.paymentMethod) {
    case 'APPLE_PAY':
      return 'Apple Pay';
    case 'GOOGLE_PAY':
      return 'Google Pay';
    case 'CREDIT_DEBIT_CARD':
      return 'Credit/Debit Card';
    default:
      // For unknown payment methods, use the name from the API
      return paymentMethod.name;
  }
}

// Get an emoji icon for payment methods.
export function getPaymentMethodIcon(paymentMethod: PaymentMethod): string {
  switch (paymentMethod.paymentMethod) {
    case 'APPLE_PAY':
      return '📱';
    case 'GOOGLE_PAY':
      return '📱';
    case 'CREDIT_DEBIT_CARD':
      return '💳';
    default:
      // Fall back to icons based on payment type category
      switch (paymentMethod.paymentType) {
        case 'MOBILE_WALLET':
          return '📱';
        case 'CARD':
          return '💳';
        case 'BANK_TRANSFER':
        case 'ACH':
        case 'SEPA':
          return '🏦';
        default:
          return '💰';
      }
  }
}

// Check if a payment method is recommended for the current device
// Useful for highlighting preferred payment methods in the UI
export function isPaymentMethodRecommended(paymentMethod: PaymentMethod): boolean {
  const deviceInfo = getDeviceInfo();
  
  // Apple Pay is recommended on Apple devices
  if (deviceInfo.isApple && paymentMethod.paymentMethod === 'APPLE_PAY') {
    return true;
  }
  
  // Google Pay is recommended on Android or Chrome
  if ((deviceInfo.isAndroid || deviceInfo.isChrome) && paymentMethod.paymentMethod === 'GOOGLE_PAY') {
    return true;
  }
  
  return false;
}