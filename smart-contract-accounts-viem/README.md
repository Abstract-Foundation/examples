# Smart Contract Accounts with Viem

Build and deploy a [smart contract wallet](https://docs.abs.xyz/how-abstract-works/native-account-abstraction/smart-contract-wallets) that can validate and execute transactions with arbitrary logic on Abstract using [viem](https://docs.abs.xyz/build-on-abstract/applications/viem).

## Local Development

1. Get a copy of the `smart-contract-accounts-viem` example directory from the Abstract Examples repository:

   ```bash
   mkdir -p smart-contract-accounts-viem && curl -L https://codeload.github.com/Abstract-Foundation/examples/tar.gz/main | tar -xz --strip=2 -C smart-contract-accounts-viem examples-main/smart-contract-accounts-viem && cd smart-contract-accounts-viem
   ```

2. Install dependencies.

   ```bash
   yarn
   ```

3. Use [Hardhat](https://hardhat.org/) to run `yarn compile` and compile the `BasicAccount` smart contract.

## Deploy & Use the Smart Contract Wallet

To demo the code, deploy and submit a transaction from the smart contract wallet, by:

1. Compiling the contracts.

   ```bash
   yarn compile
   ```

2. Create a new [Hardhat configuration variable](https://hardhat.org/hardhat-runner/docs/guides/configuration-variables) for your wallet private key.

   When prompted, enter the private key of the wallet you want to use to deploy the contract.
   It is strongly recommended to use a new wallet for this purpose.

   ```bash
   npx hardhat vars set WALLET_PRIVATE_KEY
   ```

3. Deploy the `BasicAccount` contract.

   The `defaultNetwork` inside [hardhat.config.ts](./hardhat.config.ts) is set to `abstractTestnet`. You will need [testnet ETH from a faucet](https://docs.abs.xyz/ecosystem/faucets) in your wallet to deploy the contract to Abstract.

   ```bash
   yarn deploy
   ```

4. Take the outputted `Contract address` and paste it on line `12` of the [interact.ts](./deploy/interact.ts) file:

   ```typescript
   const CONTRACT_ADDRESS = "<your-deployed-contract-address-here>";
   ```

5. Interact with the deployed contract.

   ```bash
   yarn interact
   ```

   This will submit a transaction that originates from your deployed smart contract account.

## Using a local node with Docker

1. Install the ZKsync CLI

   ```bash
   yarn global add zksync-cli
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

5. Use the `RICH_WALLETS` array available in the [utils.ts](./deploy/utils.ts) file to access accounts loaded with funds on the local node.

## Useful Links

- [Docs](https://docs.abs.xyz/)
- [Official Site](https://abs.xyz/)
- [GitHub](https://github.com/Abstract-Foundation)
- [X](https://x.com/AbstractChain)
- [Discord](https://discord.com/invite/abstractchain)
