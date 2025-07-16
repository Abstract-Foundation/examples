"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { OnrampService, type Country, type Currency, type PaymentMethod, type Quote, type ConfigResponse } from '@/services/onramp';
import { SmartAmountInput } from './SmartAmountInput';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { getDefaultFiatAmount } from '@/utils/currencyUtils';
import { getSmartPaymentMethod } from '@/utils/deviceDetection';


// The flow has 3 main steps: loading setup, showing purchase form, and processing payment
export type QuickPurchaseStep = 'loading' | 'purchase' | 'processing';

// This keeps track of everything the user has selected and the current state
export interface QuickPurchaseState {
  step: QuickPurchaseStep;
  detectedCountry: Country | null; // Auto-detected from user's location
  nativeFiatCurrency: Currency | null; // The fiat currency for their country (USD, EUR, etc.)
  selectedCryptoCurrency: Currency | null; // What crypto they want to buy (ETH, USDC, etc.)
  selectedPaymentMethod: PaymentMethod | null; // How they want to pay (Apple Pay, card, etc.)
  fiatAmount: number; // How much fiat they want to spend
  cryptoAmount: number; // How much crypto they'll get (calculated from exchange rate)
  exchangeRate: number; // Current exchange rate (simplified, real apps might get this from API)
  quote: Quote | null; // The selected quote from a provider
  error: string | null; // Any error messages to show the user
  loading: boolean; // Whether we're currently making API calls
  isAmountValid: boolean; // Whether the entered amount is within limits
}

/**
 * This is the main component for the FIAT onramp flow.
 * It walks throug the 5 steps outlined in @OnrampService.
 */

export function QuickPurchaseFlow() {
  // Get the user's connected AGW wallet address -
  // We need this to know where to send the crypto to.
  const { address } = useAccount();
  
  // This hook auto-detects the user's country for better UX
  const geoLocation = useGeoLocation();
  
  // Store the API responses that we'll need throughout the flow
  const [config, setConfig] = useState<ConfigResponse | null>(null); // Countries, limits, providers
  const [currencies, setCurrencies] = useState<{ fiat: Currency[]; crypto: Currency[] } | null>(null); // Available currencies
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]); // Available payment methods
  const [hasInitialized, setHasInitialized] = useState(false); // Prevent multiple initialization calls
  
  // Main state that tracks the user's progress through the onramp flow
  const [state, setState] = useState<QuickPurchaseState>({
    step: 'loading', // Start in loading state while we set up
    detectedCountry: null,
    nativeFiatCurrency: null,
    selectedCryptoCurrency: null,
    selectedPaymentMethod: null,
    fiatAmount: 0,
    cryptoAmount: 0,
    exchangeRate: 0,
    quote: null,
    error: null,
    loading: true,
    isAmountValid: true, // Start as valid, will be updated by validation
  });

  // Store the payment widget URL that gets generated
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null);

  // This function sets up everything we need for the onramp flow
  // It's the main initialization that happens when the component loads
  const loadConfigAndDetectCountry = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // First, get the basic configuration from the API
      const configData = await OnrampService.getConfig();
      setConfig(configData);

      // Try to auto-detect the user's country for better UX
      // This allows us to pre-select their country and currency
      let detectedCountry: Country | null = null;
      
      if (geoLocation.country) {
        // Look for their country in the list of supported countries
        detectedCountry = configData.countries.find(c => c.countryCode === geoLocation.country) || null;
      }
      
      // If we can't detect their country or it's not supported, default to US
      // This ensures the app always works even if geo-detection fails
      if (!detectedCountry) {
        detectedCountry = configData.countries.find(c => c.countryCode === 'US') || configData.countries[0];
      }

      if (!detectedCountry) {
        throw new Error('No supported countries available');
      }

      // Now get the available currencies and payment methods for this country
      // Different countries support different combinations
      const [currenciesData, paymentMethodsData] = await Promise.all([
        OnrampService.getCurrencies(detectedCountry.countryCode),
        OnrampService.getPaymentMethods(detectedCountry.countryCode),
      ]);

      // Some countries might be in the config but not actually support crypto purchases yet
      if (currenciesData.fiat.length === 0 || currenciesData.crypto.length === 0) {
        setState(prev => ({ 
          ...prev, 
          error: `${detectedCountry?.name} is not currently supported for crypto purchases.`,
          loading: false
        }));
        return;
      }

      setCurrencies(currenciesData);
      setPaymentMethods(paymentMethodsData.paymentMethods);

      // Set up smart defaults to minimize user friction
      // Use the country's default fiat currency (USD for US, EUR for Germany, etc.)
      const nativeFiatCurrency = currenciesData.fiat.find(c => c.currencyCode === detectedCountry.defaultFiatCurrency) || currenciesData.fiat[0];
      
      // Default to ETH on Abstract, or USDC as a fallback
      const defaultCryptoCurrency = currenciesData.crypto.find(c => c.currencyCode === 'ETH_BASE') || currenciesData.crypto[0];
      
      // Pick the best payment method for the user's device (Apple Pay on iOS, etc.)
      const smartDefaultPaymentMethod = getSmartPaymentMethod(paymentMethodsData.paymentMethods);
      
      // Use the API's suggested default amount, or calculate one based on the currency
      const limits = configData.limits.find(l => l.currencyCode === nativeFiatCurrency.currencyCode);
      const defaultAmount = limits?.defaultAmount || getDefaultFiatAmount(nativeFiatCurrency.currencyCode);

      // Update state with all our smart defaults
      setState(prev => ({ 
        ...prev, 
        detectedCountry,
        nativeFiatCurrency,
        selectedCryptoCurrency: defaultCryptoCurrency,
        selectedPaymentMethod: smartDefaultPaymentMethod,
        fiatAmount: defaultAmount,
        cryptoAmount: defaultAmount / 3000, // Rough ETH price estimate for display purposes
        step: 'purchase', // Move to the purchase step
        loading: false
      }));

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to initialize onramp',
        loading: false
      }));
    }
  }, [geoLocation]);

  // Initialize the flow - wait for geo-location to be detected or timeout
  useEffect(() => {
    if (hasInitialized) return;

    // Only start loading once we have geo-location data or after a timeout
    const timer = setTimeout(() => {
      if (!hasInitialized) {
        setHasInitialized(true);
        loadConfigAndDetectCountry();
      }
    }, 1000); // Wait 1 second for geo-location

    // If geo-location is detected quickly, start immediately
    if (geoLocation.detected || geoLocation.country) {
      clearTimeout(timer);
      if (!hasInitialized) {
        setHasInitialized(true);
        loadConfigAndDetectCountry();
      }
    }

    return () => clearTimeout(timer);
  }, [geoLocation.detected, geoLocation.country, hasInitialized, loadConfigAndDetectCountry]);

  const handleCryptoSelect = (currency: Currency) => {
    setState(prev => ({ 
      ...prev, 
      selectedCryptoCurrency: currency
    }));
  };

  // Called when user changes the amount they want to spend
  // The SmartAmountInput component handles the conversion between fiat and crypto amounts
  const handleAmountChange = useCallback((fiatAmount: number, cryptoAmount: number) => {
    setState(prev => ({ 
      ...prev, 
      fiatAmount,
      cryptoAmount
    }));
  }, []);

  // Called when the amount validation status changes
  // This lets us disable the "Continue to Payment" button if the amount is invalid
  const handleValidationChange = useCallback((isValid: boolean) => {
    setState(prev => ({ 
      ...prev, 
      isAmountValid: isValid
    }));
  }, []);


  // This is the main function that handles the purchase flow
  // It gets quotes, creates a payment session, and opens the payment window
  const handleProceedToPurchase = async () => {
    // Make sure we have everything we need before proceeding
    if (!state.detectedCountry || !state.nativeFiatCurrency || !state.selectedCryptoCurrency || !state.selectedPaymentMethod || !address) {
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Step 1: Get fresh quotes from providers
      // This tells us exactly how much crypto the user will get and what fees they'll pay
      const quoteResponse = await OnrampService.getQuote({
        country: state.detectedCountry.countryCode,
        destinationCurrency: state.selectedCryptoCurrency.currencyCode,
        sourceCurrency: state.nativeFiatCurrency.currencyCode,
        amount: state.fiatAmount.toString(),
        paymentMethod: state.selectedPaymentMethod.paymentMethod,
        walletAddress: address,
      });
      
      if (quoteResponse.quotes.length === 0) {
        throw new Error('No quotes available for this transaction');
      }

      // For simplicity, we just use the first quote (usually the best one)
      // In a more advanced app, you might show multiple quotes and let the user choose
      const bestQuote = quoteResponse.quotes[0]; 
      
      // Step 2: Create a payment session
      // This gives us a URL where the user can complete the actual payment
      const session = await OnrampService.createWidgetSession({
        country: state.detectedCountry.countryCode,
        destinationCurrency: state.selectedCryptoCurrency.currencyCode,
        sourceCurrency: state.nativeFiatCurrency.currencyCode,
        amount: state.fiatAmount.toString(),
        paymentMethod: state.selectedPaymentMethod.paymentMethod,
        walletAddress: address,
        toAddress: bestQuote.toAddress, // Specific address for this transaction
        serviceProvider: bestQuote.serviceProvider, // Which provider (MoonPay, etc.)
        redirectUrl: window.location.href, // Where to go after payment
        referrer: 'abstract-onramp-simplified', // Your app name for tracking
      });
      
      // Update the UI to show we're processing
      setState(prev => ({ 
        ...prev, 
        quote: bestQuote,
        step: 'processing'
      }));
      
      // Store the widget URL in case popup is blocked and we need to show a button
      setWidgetUrl(session.widgetUrl);
      
      // Step 3: Open the payment window
      // This is where the user completes their payment with the provider
      window.open(session.widgetUrl, '_blank');
      
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to create payment session'
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const resetFlow = () => {
    // Re-select smart default payment method
    const smartDefaultPaymentMethod = getSmartPaymentMethod(paymentMethods);
    
    setState(prev => ({
      ...prev,
      step: 'purchase',
      selectedCryptoCurrency: currencies?.crypto.find(c => c.currencyCode === 'ETH_BASE') || currencies?.crypto[0] || null,
      selectedPaymentMethod: smartDefaultPaymentMethod,
      quote: null,
      error: null,
    }));
  };

  // Calculate exchange rate for the amount input component
  // This is a simplified calculation - in production you might get real rates from an API
  const exchangeRate = React.useMemo(() => {
    if (!state.nativeFiatCurrency || !state.selectedCryptoCurrency) return 1;
    
    // Use rough estimates for common crypto currencies
    // The real exchange rate will come from the quotes API, this is just for display
    if (state.selectedCryptoCurrency.currencyCode === 'ETH_BASE') {
      return 3000; // Rough ETH price in USD
    } else if (state.selectedCryptoCurrency.currencyCode === 'USDC_BASE') {
      return 1; // USDC is roughly 1:1 with USD
    }
    return 1;
  }, [state.nativeFiatCurrency, state.selectedCryptoCurrency]);

  // Get the min/max limits for the selected currency
  // This is used for amount validation to prevent users from entering invalid amounts
  const limits = React.useMemo(() => {
    return config?.limits.find(l => l.currencyCode === state.nativeFiatCurrency?.currencyCode);
  }, [config?.limits, state.nativeFiatCurrency?.currencyCode]);

  if (state.loading && state.step === 'loading') {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-lg p-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-gray-400">Setting up your onramp...</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <div className="text-red-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-300 mb-2">Setup Error</h3>
            <p className="text-red-200 mb-4">{state.error}</p>
            <button
              onClick={loadConfigAndDetectCountry}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">

        {/* Single Step: Purchase (Crypto Selection + Amount) */}
        {state.step === 'purchase' && currencies && state.nativeFiatCurrency && state.selectedCryptoCurrency && (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold text-white">
                Purchase crypto
              </h2>
              {/* Compact Country Display */}
              {state.detectedCountry && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg">
                  <img
                    src={state.detectedCountry.flagImageUrl}
                    alt={`${state.detectedCountry.name} flag`}
                    className="w-4 h-3 object-cover rounded"
                    loading="lazy"
                  />
                  <span className="text-sm text-white">{state.detectedCountry.name}</span>
                  {geoLocation.detected && (
                    <span className="text-xs text-green-400">Auto-detected</span>
                  )}
                </div>
              )}
            </div>

            <SmartAmountInput
              fiatCurrency={state.nativeFiatCurrency}
              cryptoCurrency={state.selectedCryptoCurrency}
              availableCryptos={currencies.crypto}
              exchangeRate={exchangeRate}
              initialFiatAmount={state.fiatAmount}
              limits={limits}
              onAmountChange={handleAmountChange}
              onCryptoChange={handleCryptoSelect}
              onValidationChange={handleValidationChange}
            />


            <button
              onClick={handleProceedToPurchase}
              disabled={!state.selectedPaymentMethod || !state.fiatAmount || state.loading || !state.isAmountValid}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50 cursor-pointer hover:cursor-pointer disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-green-500/25"
            >
              <div className="flex items-center justify-center gap-2">
                {state.loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Payment</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Phase 3: Processing */}
        {state.step === 'processing' && state.quote && (
          <div className="text-center py-8">
            <div className="text-green-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Payment Window Opened</h3>
            <p className="text-gray-400 mb-4">
              Complete your purchase in the payment window that opened.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Funds will be deposited to your Abstract wallet after successful payment.
            </p>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={resetFlow}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors"
              >
                Start New Purchase
              </button>
              
              {/* Popup Blocked Fallback */}
              {widgetUrl && (
                <button
                  onClick={() => window.open(widgetUrl, '_blank')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Open Payment Window
                  <svg className="w-5 h-5 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {state.loading && state.step !== 'loading' && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-gray-400">Processing...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}