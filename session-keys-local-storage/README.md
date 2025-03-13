# Abstract Global Wallet Session Keys with Local Storage

This example demonstrates how to securely store and manage [session keys](https://docs.abs.xyz/abstract-global-wallet/agw-client/session-keys/overview) from the Abstract Global Wallet in the browser's local storage with encryption. Session keys allow temporary access to perform pre-defined actions without requiring the user to sign each transaction.

## Local Development

1. Get a copy of the `session-keys-local-storage` example directory from the Abstract Examples repository:

   ```bash
   mkdir -p session-keys-local-storage && curl -L https://codeload.github.com/Abstract-Foundation/examples/tar.gz/main | tar -xz --strip=2 -C session-keys-local-storage examples-main/session-keys-local-storage && cd session-keys-local-storage
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Run the development server

   ```bash
   pnpm dev
   ```

4. Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Useful Links

- [Docs](https://docs.abs.xyz/)
- [Official Site](https://abs.xyz/)
- [GitHub](https://github.com/Abstract-Foundation)
- [X](https://x.com/AbstractChain)
- [Discord](https://discord.com/invite/abstractchain)
