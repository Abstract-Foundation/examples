# Abstract Global Wallet with WalletConnect

This example showcases how to use the Abstract Global Wallet react SDK with [WalletConnect](https://walletconnect.com/) inside a [Next.js](https://nextjs.org/) application.

## Local Development

1. Follow the Reown [installation instructions](https://docs.reown.com/appkit/next/core/installation) to configure your Reown project and get a Reown APP ID.

2. Add your Reown APP ID to the `.env.local` file:

   ```bash
   # .env.local
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-reown-app-id
   ```

3. Get a copy of the `agw-walletconnect-nextjs` example directory from the Abstract Examples repository:

   ```bash
   mkdir -p agw-walletconnect-nextjs && curl -L https://codeload.github.com/Abstract-Foundation/examples/tar.gz/main | tar -xz --strip=2 -C agw-walletconnect-nextjs examples-main/agw-walletconnect-nextjs && cd agw-walletconnect-nextjs
   ```

4. Install dependencies

   ```bash
   pnpm install
   ```

5. Run the development server

   ```bash
   pnpm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## How It Works

This example demonstrates how to:

- Connect to Abstract Global Wallet via WalletConnect
- Approve transactions from within the [Abstract Portal](https://portal.abs.xyz/profile)
- Configure Abstract or Abstract Testnet as the chain in your AppKit configuration

## Useful Links

- [Docs](https://docs.abs.xyz/)
- [Official Site](https://abs.xyz/)
- [GitHub](https://github.com/Abstract-Foundation)
- [X](https://x.com/AbstractChain)
- [Discord](https://discord.com/invite/abstractchain)
