# Abstract Global Wallet with Onramp

This example showcases how to integrate Abstract Global Wallet's FIAT onramp functionality, allowing users to purchase cryptocurrency (ETH or USDC) using traditional payment methods like credit cards, Apple Pay, or Google Pay, with crypto deposited directly into their Abstract Global Wallet.

## Local Development

1. Get a copy of the `agw-onramp` example directory from the Abstract Examples repository:

   ```bash
   mkdir -p agw-onramp && curl -L https://codeload.github.com/Abstract-Foundation/examples/tar.gz/main | tar -xz --strip=2 -C agw-onramp examples-main/agw-onramp && cd agw-onramp
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Run the development server

   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## How It Works

### 1. User Country Detection

The app automatically detects the user's location using a three-tier strategy for optimal UX:

```typescript
// Server-side detection (most accurate)
const country = headers().get('x-vercel-ip-country')

// Client-side timezone fallback
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const country = timezoneToCountry[timeZone]

// Default fallback
const country = 'US'
```

### 2. Configuration and Currency Setup

The onramp service loads available configurations, currencies, and payment methods:

```typescript
// Load onramp configuration
const config = await onrampService.getConfig()

// Get available currencies for user's country
const currencies = await onrampService.getCurrencies(country)

// Get supported payment methods
const paymentMethods = await onrampService.getPaymentMethods(country)
```

### 3. Quote Generation

Real-time quotes are fetched from multiple payment providers:

```typescript
// Generate quote for purchase
const quote = await onrampService.getQuotes({
  sourceCurrency: 'USD',
  targetCurrency: 'ETH',
  sourceAmount: 100,
  country: 'US',
  paymentMethod: 'credit_card'
})
```

### 4. Payment Processing

The app creates a widget session and opens the payment interface:

```typescript
// Create payment widget session
const session = await onrampService.createWidgetSession({
  walletAddress: address,
  quote: selectedQuote,
  successUrl: window.location.origin,
  cancelUrl: window.location.origin
})

// Open payment widget
window.open(session.widgetUrl, '_blank')
```

### 5. Wallet Integration

The Abstract Global Wallet handles the final transaction:

```typescript
// AGW Provider setup
<AbstractWalletProvider
  config={{
    testnet: true, // Use testnet for development
    // Configure for mainnet in production
  }}
>
  <QuickPurchaseFlow />
</AbstractWalletProvider>
```

## Key Features

- **Smart Defaults**: Auto-detects user country and currency preferences
- **Multiple Payment Methods**: Credit cards, Apple Pay, Google Pay, bank transfers
- **Real-time Quotes**: Live exchange rates from multiple providers (MoonPay, Stripe, etc.)
- **Seamless Integration**: Direct deposits to Abstract Global Wallet
- **Mobile Optimized**: Responsive design with touch-friendly interface
- **Error Handling**: Graceful fallbacks and user-friendly error messages

## Useful Links

- [Docs](https://docs.abs.xyz/)
- [Official Site](https://abs.xyz/)
- [GitHub](https://github.com/Abstract-Foundation)
- [X](https://x.com/AbstractChain)
- [Discord](https://discord.com/invite/abstractchain)