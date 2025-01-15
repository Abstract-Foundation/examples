# Abstract Global Wallet Session Keys

This example showcases how to use [session keys](https://docs.abs.xyz/abstract-global-wallet/agw-client/session-keys/overview) with the Abstract Global Wallet  - temporary keys that are approved to execute a pre-defined set of actions without the need for the owner to sign each transaction.

## Local Development

1. Get a copy of the `session-keys` example directory from the Abstract Examples repository:

   ```bash
   mkdir -p session-keys && curl -L https://codeload.github.com/Abstract-Foundation/examples/tar.gz/main | tar -xz --strip=2 -C session-keys examples-main/session-keys && cd session-keys
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

The example demonstrates three main components:

1. **Wallet Connection**: Users can connect their wallet using the Abstract Global Wallet SDK.

2. **Session Creation**: Once connected, users can create a session key with specific permissions:
   - Time-limited access (24 hour expiry)
   - Limited to specific contract interactions (NFT minting)
   - Maximum fee limits for transactions
   - Gas fees sponsored by a paymaster

3. **NFT Minting**: Using the created session key, users can mint NFTs without requiring additional wallet signatures.

## Key Components

The main components used in this example are:

- `ConnectWallet.tsx`: Handles wallet connection and displays connection status
- `CreateSession.tsx`: Creates a new session key with specific permissions
- `MintNft.tsx`: Demonstrates using the session key to mint NFTs
