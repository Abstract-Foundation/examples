/**
 * The FIAT on-ramp flow is about getting a quote to generate a widget URL with.
 * Our end goal is to get a quote from a provider, and get a widget URL that
 * allows the user to execute that quote inside the widget.
 * 
 * To create a quote, we need some information:
 *  - country `string` The ISO country code for the user.
 *  - destinationCurrency `string` The code for the Crypto Currency.
 *  - sourceCurrency `string` The code for the Fiat Currency.
 *  - amount `string` The amount (in source currency) to buy.
 *  - paymentMethod `string` The identifier for the Payment Method (e.g. Apple Pay, Credit Card, etc.)
 *  - walletAddress `string` The wallet address for the user making this request (does not have to be AGW)
 *  - toAddress `string` The deposit address on Base returned in the quote
 *  - serviceProvider `string` Service Provider to use for this session
 *  - redirectUrl `string (optional)` URL to navigate back to when widget flow is complete
 *  - referrer `string (optional)` The name of the app referring the user to the Onramp
 * 
 * So we basically just need the user to provide this information, or load it ourselves,
 * and then call the API to get a quote, and pass that quote to the widget endpoint.
 * 
 * Most of that logic is in this file, except for the geo-location stuff.
 */

// This is Abstract's staging onramp API. In production, you'd use the production URL
const ONRAMP_BASE_URL = 'https://onramp.staging-portal.abs.xyz';

// The Country interface represents a country that supports crypto purchases
// Each country has different available currencies and payment methods
export interface Country {
  countryCode: string; // ISO country code like 'US', 'GB', 'DE'
  name: string; // Display name like 'United States'
  flagImageUrl: string; // URL to flag image for the UI
  regions?: Array<{
    regionCode: string;
    name: string;
  }> | null; // Some countries have regions with different rules
  defaultFiatCurrency: string; // What currency this country typically uses (USD, EUR, etc.)
}

// Currency can be either fiat (USD, EUR) or crypto (ETH, USDC)
// The API returns both types but separates them into fiat/crypto arrays
export interface Currency {
  currencyCode: string; // Like 'USD', 'EUR', 'ETH_BASE', 'USDC_BASE'
  name: string; // Human readable name
  symbolImageUrl: string; // URL to currency icon
  symbol?: string; // Short symbol like '$', '€', 'ETH'
  chainCode?: string; // For crypto: which blockchain 
  chainName?: string; // For crypto: chain display name
  chainId?: string | null; // For crypto: chain ID number
  contractAddress?: string | null; // For crypto: token contract address
}

// Payment methods vary by country - some have Apple Pay, others only cards, etc.
export interface PaymentMethod {
  paymentMethod: string; // Unique ID like 'APPLE_PAY', 'CREDIT_DEBIT_CARD'
  name: string; // Display name for users
  paymentType: string; // Category like 'CARD', 'MOBILE_WALLET', 'BANK_TRANSFER'
  logos: {
    light: string; // Logo URL for light theme
    dark: string; // Logo URL for dark theme
  };
}

// A Quote tells you exactly how much crypto you'll get for your fiat money
// Different providers give different quotes, so you can pick the best one
export interface Quote {
  transactionType: string;
  sourceAmount: number; // How much fiat the user will pay (including fees)
  sourceAmountWithoutFees: number; // The actual purchase amount before fees
  fiatAmountWithoutFees: number; // Same as above, in fiat currency
  destinationAmountWithoutFees: number | null; // How much crypto before fees
  sourceCurrencyCode: string; // What fiat currency (USD, EUR, etc.)
  countryCode: string; // Which country this quote is for
  totalFee: number; // All fees combined
  networkFee: number | null; // Blockchain network fees
  transactionFee: number; // Provider's transaction fee
  destinationAmount: number; // Final crypto amount user will receive
  destinationCurrencyCode: string; // Which crypto (ETH_BASE, USDC_BASE, etc.)
  exchangeRate: number; // How much 1 unit of fiat equals in crypto
  paymentMethodType: string; // Which payment method was used for this quote
  customerScore: number; // Some kind of risk/trust score
  serviceProvider: string; // Which provider gave this quote (MoonPay, etc.)
  institutionName: string | null; // Bank or institution name if applicable
  lowKyc: boolean | null; // Whether this requires minimal identity verification
  partnerFee: number; // Abstract's partner fee
  walletAddress: string; // User's wallet where crypto will be sent
  toAddress: string; // Specific address for this transaction
  relayFee: number; // Fee for relaying the transaction
}

// After the user picks a quote, you create a WidgetSession
// This opens a payment window where they complete the actual purchase
export interface WidgetSession {
  id: string; // Session ID for tracking
  externalSessionId: string; // Provider's session ID
  externalCustomerId: string; // Provider's customer ID
  customerId: string; // Abstract's customer ID
  widgetUrl: string; // URL to open in popup/new tab for payment
  token: string; // Auth token for the session
}

// Service providers are companies that actually process the payments
export interface ServiceProvider {
  serviceProvider: string; // Unique ID
  name: string; // Display name like "MoonPay"
  status: string; // Whether they're active, maintenance, etc.
  categories: string[]; // What types of transactions they support
  categoryStatuses: Record<string, string>; // Status for each category
  websiteUrl: string; // Provider's website
  customerSupportUrl: string; // Where users can get help
  logos: {
    dark: string; // Logo for dark theme
    light: string; // Logo for light theme
    darkShort: string; // Compact logo for dark theme
    lightShort: string; // Compact logo for light theme
  };
}

// The config endpoint gives you all the basic setup info you need
export interface ConfigResponse {
  countries: Country[]; // All supported countries
  limits: Array<{
    currencyCode: string; // Which currency these limits apply to
    defaultAmount: number; // Suggested default amount (good UX to pre-fill this)
    minimumAmount: number; // Smallest allowed purchase
    maximumAmount: number; // Largest allowed purchase
  }>;
  serviceProviders: ServiceProvider[]; // All available payment providers
}

// API responses are wrapped in these interfaces
export interface CurrenciesResponse {
  fiat: Currency[]; // Available fiat currencies for this country
  crypto: Currency[]; // Available crypto currencies for this country
}

export interface PaymentMethodsResponse {
  paymentMethods: PaymentMethod[]; // Available payment methods for this country
}

export interface QuoteResponse {
  quotes: Quote[]; // Multiple quotes from different providers - user or app picks the best one
}

/**
 * OnrampService handles all the API calls to Abstract's onramp service.
 */
export class OnrampService {
  // Helper method to make HTTP requests with error handling
  // All onramp API calls go through this to ensure consistent error handling
  private static async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${ONRAMP_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      // Try to get a detailed error message from the API response
      let errorMessage = `Onramp API error: ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.text();
        if (errorBody) {
          errorMessage += ` - ${errorBody}`;
        }
      } catch {
        // If we can't read the error body, just use the status
      }
      console.error(`API Request failed: ${endpoint}`, errorMessage);
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Step 1: Get the initial configuration
  // Call this first to get supported countries, limits, and providers
  static async getConfig(): Promise<ConfigResponse> {
    return this.makeRequest<ConfigResponse>('/config');
  }

  // Step 2: Get available currencies for a specific country
  // Different countries support different fiat and crypto currencies
  static async getCurrencies(country: string): Promise<CurrenciesResponse> {
    return this.makeRequest<CurrenciesResponse>(`/currencies?country=${encodeURIComponent(country)}`);
  }

  // Step 3: Get payment methods available in that country
  // Some countries have Apple Pay, others only have cards, etc.
  static async getPaymentMethods(country: string): Promise<PaymentMethodsResponse> {
    return this.makeRequest<PaymentMethodsResponse>(`/payment-methods?country=${encodeURIComponent(country)}`);
  }

  // Step 4: Get quotes from providers
  // This tells you how much crypto you'll get for your fiat money
  // You get multiple quotes and can pick the best one (lowest fees, most crypto, etc.)
  static async getQuote(params: {
    country: string; // User's country
    destinationCurrency: string; // What crypto they want (ETH_BASE, USDC_BASE, etc.)
    sourceCurrency: string; // What fiat they're paying with (USD, EUR, etc.)
    amount: string; // How much fiat they want to spend
    paymentMethod: string; // Which payment method they chose
    walletAddress: string; // Where to send the crypto
  }): Promise<QuoteResponse> {
    const queryParams = new URLSearchParams(params);
    return this.makeRequest<QuoteResponse>(`/quote?${queryParams}`);
  }

  // Step 5: Create a payment session
  // After user picks a quote, create a widget session to handle the actual payment
  // This returns a URL that you open in a popup/new tab where user completes payment
  static async createWidgetSession(params: {
    country: string;
    destinationCurrency: string;
    sourceCurrency: string;
    amount: string;
    paymentMethod: string;
    walletAddress: string;
    toAddress: string; // From the selected quote
    serviceProvider: string; // From the selected quote
    redirectUrl?: string; // Where to go after payment (usually back to your app)
    referrer?: string; // Your app name for tracking
  }): Promise<WidgetSession> {
    return this.makeRequest<WidgetSession>('/widget', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}