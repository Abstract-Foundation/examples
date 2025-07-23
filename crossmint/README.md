# Crossmint + Abstract Global Wallet

This example showcases how to integrate Crossmint's "Pay with Card" feature with the Abstract Global Wallet in a [Next.js](https://nextjs.org/) application. Users can connect their Abstract Global Wallet and purchase NFTs using credit cards or Google Pay via Crossmint.

## Local Development

1. Get a copy of the `crossmint` example directory from the Abstract Examples repository:

   ```bash
   mkdir -p crossmint && curl -L https://codeload.github.com/Abstract-Foundation/examples/tar.gz/main | tar -xz --strip=2 -C crossmint examples-main/crossmint && cd crossmint
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   Create a [Crossmint Token Collection](https://docs.crossmint.com/payments/guides/create-collection) on the Abstract testnet. Import your existing collection or create a new one (a basic example is provided in the `contracts` directory).

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_CROSSMINT_API_KEY=your_crossmint_client_api_key
   NEXT_PUBLIC_CROSSMINT_COLLECTION_ID=your_collection_id
   ```
   - `NEXT_PUBLIC_CROSSMINT_API_KEY`: Your Crossmint client-side API key
   - `NEXT_PUBLIC_CROSSMINT_COLLECTION_ID`: The ID of your Crossmint collection

4. Run the development server:

   ```bash
   pnpm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## How It Works

1. **Connect Wallet**: Users first connect their Abstract Global Wallet
2. **Purchase NFT**: The Crossmint embedded checkout appears, allowing credit card payments
3. **NFT Delivery**: The purchased NFT is minted directly to the connected wallet address
4. **Payment Processing**: Crossmint handles all payment processing and blockchain interactions

## Useful Links

- [Abstract Docs](https://docs.abs.xyz/)
- [Crossmint Docs](https://docs.crossmint.com/payments/embedded/overview)
- [Crossmint Console](https://staging.crossmint.com/console)
- [GitHub](https://github.com/Abstract-Foundation)
- [X](https://x.com/AbstractChain)
- [Discord](https://discord.com/invite/abstractchain)
