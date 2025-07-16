# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

Package manager: **pnpm** (version 9.15.4+)

## Project Architecture

This is a **Next.js 15** React application that demonstrates **Abstract Global Wallet (AGW) onramp integration** for purchasing cryptocurrency with fiat currency. The app allows users to buy ETH or USDC using credit cards, Apple Pay, or Google Pay, with funds deposited directly to their Abstract wallet.

### Key Technologies
- **Next.js 15** with React 19
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **Wagmi** for Ethereum wallet interactions
- **Abstract Foundation AGW** libraries for wallet integration
- **React Query** for state management and API caching

### Core Architecture Components

**Wallet Integration** (`src/components/NextAbstractWalletProvider.tsx`):
- Wraps the app with Abstract Wallet Provider
- Configured for Abstract testnet (change to mainnet for production)
- Manages wallet connection, account info, and transaction capabilities

**Onramp Service** (`src/services/onramp.ts`):
- Central API service for Abstract's onramp functionality
- Handles: config, currencies, payment methods, quotes, widget sessions
- API Base URL: `https://onramp.staging-portal.abs.xyz` (staging)
- Key flow: get config → get currencies → get payment methods → get quotes → create widget session

**Purchase Flow** (`src/components/onramp/QuickPurchaseFlow.tsx`):
- Main component orchestrating the entire onramp flow
- Auto-detects user country and currency for better UX
- Handles quote fetching and payment session creation
- Opens payment widget in new window for completion

**Geo-location Detection** (`src/hooks/useGeoLocation.ts`):
- Three-tier detection strategy:
  1. Server-side via Vercel geo headers (most accurate)
  2. Client-side timezone detection (fallback)
  3. Default to US (final fallback)
- Provides country/region detection for currency defaults

### Data Flow
1. **Initialization**: Load config, detect country, get available currencies/payment methods
2. **User Input**: Select crypto currency, enter amount, choose payment method
3. **Quote**: Get real-time quotes from providers (MoonPay, etc.)
4. **Payment**: Create widget session, open payment window
5. **Completion**: Funds deposited to user's Abstract wallet

### Important Notes
- Uses Abstract **testnet** for development
- Real exchange rates come from quote API (component uses rough estimates for display)
- Multiple payment providers supported (MoonPay, Stripe, etc.)
- Payment completion happens in external widget (popup window)
- Geo-detection improves UX by pre-selecting appropriate currency and country