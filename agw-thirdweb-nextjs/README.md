# Abstract Global Wallet with Thirdweb

This example showcases how to use the Abstract Global Wallet react
SDK with [Thirdweb](https://www.thirdweb.xyz/) inside a [Next.js](https://nextjs.org/) application.

## Local Development

1. Get a copy of the `agw-thirdweb-nextjs` example directory from the Abstract Examples repository:

   ```bash
   mkdir -p agw-thirdweb-nextjs && curl -L https://codeload.github.com/Abstract-Foundation/examples/tar.gz/main | tar -xz --strip=2 -C agw-thirdweb-nextjs examples-main/agw-thirdweb-nextjs && cd agw-thirdweb-nextjs
   ```

2. Set up a Thirdweb API key:
   - Go to the [Thirdweb dashboard](https://thirdweb.com/dashboard) and create an account or sign in
   - Navigate to the **Project Settings** tab and copy your project&rsquo;s **Client ID**
   - Create a `.env.local` file in the project root and add your client ID:
     ```bash
     NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your-client-id-here
     ```

3. Install dependencies

   ```bash
   npm install
   ```

4. Run the development server

   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Useful Links

- [Docs](https://docs.abs.xyz/)
- [Official Site](https://abs.xyz/)
- [GitHub](https://github.com/Abstract-Foundation)
- [X](https://x.com/AbstractChain)
- [Discord](https://discord.com/invite/abstractchain)
