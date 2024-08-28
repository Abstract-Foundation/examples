# Smart Contract Account Factory

Build a [smart contract wallet](https://docs.abs.xyz/how-abstract-works/native-account-abstraction/smart-contract-wallets) **factory**
that deploys smart contract accounts with an EOA (Externally Owned Account) set as the signer for each smart contract account on [Abstract](https://docs.abs.xyz/).

This example consists of two components:

1. [contracts](./contracts) - Solidity smart contracts in a [Hardhat](https://hardhat.org/) environment that define the smart contract account and factory.
2. [frontend](./frontend) - A simple frontend using [Next.js](https://nextjs.org/) and [Viem](https://viem.sh/) to interact with the contracts.

## Local Development

1. Get a copy of the `smart-contract-accounts-factory` example directory from the Abstract Examples repository:

   ```bash
   mkdir -p smart-contract-accounts-factory && curl -L https://codeload.github.com/Abstract-Foundation/examples/tar.gz/main | tar -xz --strip=2 -C smart-contract-accounts-factory examples-main/smart-contract-accounts-factory && cd smart-contract-accounts-factory
   ```

### Contract Development

1. Change directory to the `contracts` folder.

   ```bash
   cd contracts
   ```

2. Compiling the contracts.

   ```bash
   npx hardhat compile
   ```

3. Create a new [Hardhat configuration variable](https://hardhat.org/hardhat-runner/docs/guides/configuration-variables) for your wallet private key.

   When prompted, enter the private key of the wallet you want to use to deploy the contract.
   It is strongly recommended to use a new wallet for this purpose.

   ```bash
   npx hardhat vars set WALLET_PRIVATE_KEY
   ```

4. Run the [deploy script](./contracts/deploy/deploy.ts) to deploy the smart contract account factory and create a smart account via the factory.

   _Note: The `defaultNetwork` inside [hardhat.config.ts](./contracts/hardhat.config.ts) is set to `abstractTestnet`. You will need [testnet ETH from a faucet](https://docs.abs.xyz/ecosystem/faucets) in your wallet to deploy the contract to Abstract._

   ```bash
   npx hardhat deploy-zksync --script deploy.ts
   ```

### Frontend Development

1. Change directory to the `frontend` folder.

   ```bash
   # if you are in the contracts folder
   cd ../frontend
   # Or, if you are in the root folder
   cd frontend
   ```

2. Install the dependencies.

   ```bash
   npm install
   ```

3. Start the frontend.

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using a local node with Docker

To deploy onto a local node (instead of the Abstract testnet), follow the instructions below.

1. Install the ZKsync CLI

   ```bash
   npm install -g zksync-cli
   ```

2. For local development, ensure [Docker](https://docs.docker.com/get-docker/) is installed and running.

   ```bash
   docker --version
   docker info
   ```

3. For local development, run an "In Memory node".

   ```bash
   zksync-cli dev start
   ```

4. Set the hardhat default network to `inMemoryNode` in [hardhat.config.ts](./hardhat.config.ts).

   ```typescript
   defaultNetwork: "inMemoryNode",
   ```

5. Use the [rich wallets](https://docs.zksync.io/build/test-and-debug/in-memory-node#pre-configured-rich-wallets) to access accounts loaded with funds on the local node.

## Useful Links

- [Docs](https://docs.abs.xyz/)
- [Official Site](https://abs.xyz/)
- [GitHub](https://github.com/Abstract-Foundation)
- [X](https://x.com/AbstractChain)
- [Discord](https://discord.com/invite/abstractchain)

## License

This project is under the [MIT](./LICENSE) license.
