"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { OnrampService, type Country, type Currency, type PaymentMethod, type Quote, type ConfigResponse } from '@/services/onramp';
import { SmartAmountInput } from './SmartAmountInput';
import { CryptocurrencySelector } from './CryptocurrencySelector';
import { CryptocurrencySelection } from './CryptocurrencySelection';
import { CountrySelector } from './CountrySelector';
import { CountrySelection } from './CountrySelection';
import { CurrencySelector } from './CurrencySelector';
import { CurrencySelection } from './CurrencySelection';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PaymentProviderSelector } from './PaymentProviderSelector';
import { PaymentMethodSelection } from './PaymentMethodSelection';
import { PaymentProviderSelection } from './PaymentProviderSelection';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { getDefaultFiatAmount } from '@/utils/currencyUtils';
import { getSmartPaymentMethod } from '@/utils/deviceDetection';
import { getSmartDefaultPaymentRoute } from '@/utils/paymentRouteUtils';


// The flow has 8 main steps: loading setup, showing purchase form, crypto selection, country selection, currency selection, payment method selection, provider selection, and processing payment
export type QuickPurchaseStep = 'loading' | 'purchase' | 'crypto-selection' | 'country-selection' | 'currency-selection' | 'payment-method-selection' | 'provider-selection' | 'processing';

// This keeps track of everything the user has selected and the current state
export interface QuickPurchaseState {
  step: QuickPurchaseStep;
  detectedCountry: Country | null; // Auto-detected from user's location
  nativeFiatCurrency: Currency | null; // The fiat currency for their country (USD, EUR, etc.)
  selectedCryptoCurrency: Currency | null; // What crypto they want to buy (ETH, USDC, etc.)
  selectedPaymentMethod: PaymentMethod | null; // How they want to pay (Apple Pay, card, etc.)
  selectedProvider: string | null; // Which provider they want to use (MoonPay, Transak, etc.)
  fiatAmount: number; // How much fiat they want to spend
  cryptoAmount: number; // How much crypto they'll get (calculated from exchange rate)
  quote: Quote | null; // The selected quote from a provider
  availableQuotes: Quote[]; // All available quotes to choose from
  quotesLoading: boolean; // Whether we're currently fetching quotes
  quotesError: string | null; // Any error messages for quotes
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
    selectedProvider: null,
    fiatAmount: 0,
    cryptoAmount: 0,
    quote: null,
    availableQuotes: [],
    quotesLoading: false,
    quotesError: null,
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

  const handleOpenCryptoSelection = () => {
    setState(prev => ({ ...prev, step: 'crypto-selection' }));
  };

  const handleBackToPurchase = () => {
    setState(prev => ({ ...prev, step: 'purchase' }));
  };

  const handleOpenCountrySelection = () => {
    setState(prev => ({ ...prev, step: 'country-selection' }));
  };

  const handleCountrySelect = async (country: Country) => {
    if (!config) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Get currencies and payment methods for the new country
      const [currenciesData, paymentMethodsData] = await Promise.all([
        OnrampService.getCurrencies(country.countryCode),
        OnrampService.getPaymentMethods(country.countryCode),
      ]);

      // Check if country supports crypto purchases
      if (currenciesData.fiat.length === 0 || currenciesData.crypto.length === 0) {
        setState(prev => ({ 
          ...prev, 
          error: `${country.name} is not currently supported for crypto purchases.`,
          loading: false
        }));
        return;
      }

      setCurrencies(currenciesData);
      setPaymentMethods(paymentMethodsData.paymentMethods);

      // Set up smart defaults for the new country
      const nativeFiatCurrency = currenciesData.fiat.find(c => c.currencyCode === country.defaultFiatCurrency) || currenciesData.fiat[0];
      const defaultCryptoCurrency = currenciesData.crypto.find(c => c.currencyCode === 'ETH_BASE') || currenciesData.crypto[0];
      const smartDefaultPaymentMethod = getSmartPaymentMethod(paymentMethodsData.paymentMethods);
      
      // Use the API's suggested default amount, or calculate one based on the currency
      const limits = config.limits.find(l => l.currencyCode === nativeFiatCurrency.currencyCode);
      const defaultAmount = limits?.defaultAmount || getDefaultFiatAmount(nativeFiatCurrency.currencyCode);

      setState(prev => ({ 
        ...prev, 
        detectedCountry: country,
        nativeFiatCurrency,
        selectedCryptoCurrency: defaultCryptoCurrency,
        selectedPaymentMethod: smartDefaultPaymentMethod,
        fiatAmount: defaultAmount,
        cryptoAmount: defaultAmount / 3000, // Rough ETH price estimate for display purposes
        availableQuotes: [], // Clear existing quotes
        quote: null,
        step: 'purchase',
        loading: false
      }));

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to change country',
        loading: false
      }));
    }
  };

  const handleOpenCurrencySelection = () => {
    setState(prev => ({ ...prev, step: 'currency-selection' }));
  };

  const handleCurrencySelect = (currency: Currency) => {
    setState(prev => ({ 
      ...prev, 
      nativeFiatCurrency: currency,
      step: 'purchase'
    }));
  };

  const handleOpenPaymentMethodSelection = () => {
    setState(prev => ({ ...prev, step: 'payment-method-selection' }));
  };

  const handleOpenProviderSelection = () => {
    setState(prev => ({ ...prev, step: 'provider-selection' }));
  };

  const handlePaymentMethodSelect = (paymentMethod: PaymentMethod) => {
    setState(prev => ({ 
      ...prev, 
      selectedPaymentMethod: paymentMethod,
      step: 'purchase',
      quotesError: null // Clear any existing quote errors when payment method changes
    }));
  };

  const handleProviderSelect = (provider: string) => {
    setState(prev => ({ 
      ...prev, 
      selectedProvider: provider,
      step: 'purchase',
      quotesError: null // Clear any existing quote errors when provider changes
    }));
  };

  // Called when user changes the amount they want to spend
  // The SmartAmountInput component handles the conversion between fiat and crypto amounts
  const handleAmountChange = useCallback((fiatAmount: number, cryptoAmount: number) => {
    setState(prev => ({ 
      ...prev, 
      fiatAmount,
      cryptoAmount,
      quotesError: null // Clear any existing quote errors when amount changes
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




  // Debounced function to fetch quotes automatically
  const fetchQuotes = useCallback(async () => {
    // Make sure we have everything we need before proceeding
    if (!state.detectedCountry || !state.nativeFiatCurrency || !state.selectedCryptoCurrency || !address || !state.isAmountValid || state.fiatAmount <= 0) {
      return;
    }

    // Use smart payment method if none selected yet
    const paymentMethodToUse = state.selectedPaymentMethod || getSmartPaymentMethod(paymentMethods);

    // If no payment method is available, we can't proceed
    if (!paymentMethodToUse) {
      setState(prev => ({ 
        ...prev, 
        quotesError: 'No payment methods available',
        quotesLoading: false
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, quotesLoading: true, quotesError: null }));
      
      // Get fresh quotes from providers
      const quoteResponse = await OnrampService.getQuote({
        country: state.detectedCountry.countryCode,
        destinationCurrency: state.selectedCryptoCurrency.currencyCode,
        sourceCurrency: state.nativeFiatCurrency.currencyCode,
        amount: state.fiatAmount.toString(),
        paymentMethod: paymentMethodToUse.paymentMethod,
        walletAddress: address,
      });
      
      if (quoteResponse.quotes.length === 0) {
        setState(prev => ({ 
          ...prev, 
          availableQuotes: [],
          quotesError: 'No quotes available for this transaction',
          quotesLoading: false
        }));
        return;
      }

      // Sort quotes by destination amount (best rate first)
      const sortedQuotes = quoteResponse.quotes.sort((a, b) => b.destinationAmount - a.destinationAmount);
      
      // Set smart defaults if not already selected
      let updatedState: Partial<QuickPurchaseState> = {
        availableQuotes: sortedQuotes,
        quote: sortedQuotes[0], // Auto-select the best quote
        quotesLoading: false
      };

      // Set smart defaults for payment method and provider if not already selected
      if (!state.selectedPaymentMethod || !state.selectedProvider) {
        const smartDefaults = getSmartDefaultPaymentRoute(paymentMethods, sortedQuotes);
        if (smartDefaults) {
          updatedState = {
            ...updatedState,
            selectedPaymentMethod: smartDefaults.paymentMethod,
            selectedProvider: smartDefaults.provider
          };
        }
      }
      
      setState(prev => ({ 
        ...prev, 
        ...updatedState
      }));
      
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        quotesError: error instanceof Error ? error.message : 'Failed to get quotes',
        quotesLoading: false
      }));
    }
  }, [state.detectedCountry, state.nativeFiatCurrency, state.selectedCryptoCurrency, state.selectedPaymentMethod, state.fiatAmount, state.isAmountValid, address, paymentMethods]);

  // Debounced version of fetchQuotes for amount changes only
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuotes();
    }, 250); // Wait 1 second after user stops typing amount

    return () => clearTimeout(timer);
  }, [state.fiatAmount, state.isAmountValid]); // Only debounce for amount changes

  // Immediate quote fetching for option changes (currency, payment method, etc.)
  useEffect(() => {
    fetchQuotes();
  }, [
    state.detectedCountry, 
    state.nativeFiatCurrency, 
    state.selectedCryptoCurrency, 
    state.selectedPaymentMethod,
    address,
    paymentMethods
  ]); // Immediate fetch when options change

  // This function proceeds with the selected or best quote
  const handleProceedToPurchase = async () => {
    if (!state.quote) {
      return;
    }
    
    await handleQuoteSelection(state.quote);
  };

  // This function handles the actual payment processing after quote selection
  const handleQuoteSelection = async (selectedQuote: Quote) => {
    if (!state.detectedCountry || !state.nativeFiatCurrency || !state.selectedCryptoCurrency || !state.selectedPaymentMethod || !address) {
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Create a payment session with the selected quote
      const session = await OnrampService.createWidgetSession({
        country: state.detectedCountry.countryCode,
        destinationCurrency: state.selectedCryptoCurrency.currencyCode,
        sourceCurrency: state.nativeFiatCurrency.currencyCode,
        amount: state.fiatAmount.toString(),
        paymentMethod: state.selectedPaymentMethod.paymentMethod,
        walletAddress: address,
        toAddress: selectedQuote.toAddress, // Specific address for this transaction
        serviceProvider: selectedQuote.serviceProvider, // Which provider (MoonPay, etc.)
        redirectUrl: window.location.href, // Where to go after payment
        referrer: 'abstract-onramp-demo', // Your app name for tracking
      });
      
      // Update the UI to show we're processing
      setState(prev => ({ 
        ...prev, 
        quote: selectedQuote,
        step: 'processing'
      }));
      
      // Store the widget URL in case popup is blocked and we need to show a button
      setWidgetUrl(session.widgetUrl);
      
      // Open the payment window
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
      availableQuotes: [],
      error: null,
    }));
  };


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
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8 pb-2 border-b border-white/10">
              <CryptocurrencySelector
                selectedCurrency={state.selectedCryptoCurrency}
                onClick={handleOpenCryptoSelection}
              />
              {/* Country and Currency Selectors */}
              <div className="flex items-center space-x-3">
                <CountrySelector
                  selectedCountry={state.detectedCountry}
                  onClick={handleOpenCountrySelection}
                />
                <div className="w-px h-6 bg-white/20"></div>
                <CurrencySelector
                  selectedCurrency={state.nativeFiatCurrency}
                  onClick={handleOpenCurrencySelection}
                />
              </div>
            </div>

            <div className="space-y-1">
              <SmartAmountInput
                fiatCurrency={state.nativeFiatCurrency}
                initialFiatAmount={state.fiatAmount}
                limits={limits}
                onAmountChange={handleAmountChange}
                onValidationChange={handleValidationChange}
              />

              {/* Crypto Amount Display */}
              {(state.quote || state.quotesLoading || state.quotesError) && (
                <div className="text-center">
                  <span className={`text-sm ${state.quotesError ? 'text-red-400' : 'text-gray-400'}`}>
                    {state.quotesLoading 
                      ? "fetching quotes..."
                      : state.quotesError
                      ? `Error: ${state.quotesError}`
                      : `= ${state.quote?.destinationAmount.toFixed(6)} ${state.selectedCryptoCurrency?.symbol}`
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Payment Method and Provider Selection */}
            <div className="flex flex-row items-center justify-between gap-2 pt-6 border-t border-white/10">
              <PaymentMethodSelector
                selectedPaymentMethod={state.selectedPaymentMethod}
                onClick={handleOpenPaymentMethodSelection}
              />
              <PaymentProviderSelector
                selectedProvider={state.selectedProvider}
                onClick={handleOpenProviderSelection}
              />
            </div>

            {/* Continue to Payment Button */}
            <button
              onClick={handleProceedToPurchase}
              disabled={state.loading || state.quotesLoading || !state.quote || !!state.quotesError}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50 cursor-pointer hover:cursor-pointer disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-green-500/25"
            >
              <div className="flex items-center justify-center gap-2">
                {state.loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : state.quotesLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Fetching Quotes...</span>
                  </>
                ) : state.quotesError ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.764 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span>Error Getting Quotes</span>
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

        {/* Crypto Selection */}
        {state.step === 'crypto-selection' && currencies && (
          <CryptocurrencySelection
            currencies={currencies.crypto}
            selectedCurrency={state.selectedCryptoCurrency}
            onCurrencySelect={handleCryptoSelect}
            onBack={handleBackToPurchase}
          />
        )}

        {/* Country Selection */}
        {state.step === 'country-selection' && config && (
          <CountrySelection
            countries={config.countries}
            selectedCountry={state.detectedCountry}
            onCountrySelect={handleCountrySelect}
            onBack={handleBackToPurchase}
          />
        )}

        {/* Currency Selection */}
        {state.step === 'currency-selection' && currencies && (
          <CurrencySelection
            currencies={currencies.fiat}
            selectedCurrency={state.nativeFiatCurrency}
            onCurrencySelect={handleCurrencySelect}
            onBack={handleBackToPurchase}
          />
        )}

        {/* Payment Method Selection */}
        {state.step === 'payment-method-selection' && (
          <PaymentMethodSelection
            paymentMethods={paymentMethods}
            selectedPaymentMethod={state.selectedPaymentMethod}
            onPaymentMethodSelect={handlePaymentMethodSelect}
            onBack={handleBackToPurchase}
          />
        )}

        {/* Provider Selection */}
        {state.step === 'provider-selection' && (
          <PaymentProviderSelection
            quotes={state.availableQuotes}
            selectedProvider={state.selectedProvider}
            onProviderSelect={handleProviderSelect}
            onBack={handleBackToPurchase}
          />
        )}

        {/* Processing */}
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