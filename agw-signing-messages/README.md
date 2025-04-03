# EIP-1271 Signature Verification with Abstract Global Wallet

This example demonstrates how to implement EIP-1271 message signing and verification with Abstract Global Wallet inside a [Next.js](https://nextjs.org/) application.

## Features

- Connect with Abstract Global Wallet
- Sign messages with your wallet
- Verification of signatures using EIP-1271 standard

## Local Development

1. Get a copy of the example:

   ```bash
   mkdir -p agw-signing-messages && curl -L https://codeload.github.com/Abstract-Foundation/examples/tar.gz/main | tar -xz --strip=2 -C agw-signing-messages examples-main/agw-signing-messages && cd agw-signing-messages
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

1. **Frontend (`/src/components/wallet/SignMessage.tsx`)**:

   - Allows users to input a custom message
   - Signs the message using the connected AGW
   - Automatically verifies the signature

2. **Backend (`/src/app/api/verify-message/route.ts`)**:
   - Provides an API endpoint for verifying signatures
   - Uses viem's `verifyMessage` function which supports EIP-1271
   - Works with both regular EOA wallets and Smart Contract wallets

## Technical Details

This implementation leverages the EIP-1271 standard which allows smart contract wallets to verify signatures. When verifying a signature:

- For EOAs: Recovers the address from the signature and compares it
- For Smart Contract Wallets: Calls the wallet's `isValidSignature` method

## Useful Links

- [EIP-1271 Standard](https://eips.ethereum.org/EIPS/eip-1271)
- [Viem Documentation](https://viem.sh/docs/actions/public/verifyMessage.html)
- [Abstract Docs](https://docs.abs.xyz/)
- [Official Site](https://abs.xyz/)
- [GitHub](https://github.com/Abstract-Foundation)
- [X](https://x.com/AbstractChain)
- [Discord](https://discord.com/invite/abstractchain)
