## Smart Contract Account Factory Contracts

See [the root README](../README.md) for an overview of the project.

This is the setup instructions for the smart contracts of this repository.

1. Compiling the contracts.

   ```bash
   npx hardhat compile
   ```

2. Create a new [Hardhat configuration variable](https://hardhat.org/hardhat-runner/docs/guides/configuration-variables) for your wallet private key.

   When prompted, enter the private key of the wallet you want to use to deploy the contract.
   It is strongly recommended to use a new wallet for this purpose.

   ```bash
   npx hardhat vars set WALLET_PRIVATE_KEY
   ```

3. Run the [deploy script](./contracts/deploy/deploy.ts) to deploy the smart contract account factory and create a smart account via the factory.

   _Note: The `defaultNetwork` inside [hardhat.config.ts](./contracts/hardhat.config.ts) is set to `abstractTestnet`. You will need [testnet ETH from a faucet](https://docs.abs.xyz/ecosystem/faucets) in your wallet to deploy the contract to Abstract._

   ```bash
   npx hardhat deploy-zksync --script deploy.ts
   ```

If successful, this will print something like this:

```
Your verification ID is: 613
Contract successfully verified on ZKsync block explorer!
✅ Factory contract deployed at: 0x72716f76d912f8AD6BB39a782D55581F3ABb5378
🔗 View your account on the Abstract Explorer: https://explorer.testnet.abs.xyz/address/0x72716f76d912f8AD6BB39a782D55581F3ABb5378

Your verification ID is: 614
Contract successfully verified on ZKsync block explorer!
✅ New account deployed via factory at: 0x9ACEB7d1d9EF3e6927B56b4D4fb78d280e24305c
🔗 View your account on the Abstract Explorer: https://explorer.testnet.abs.xyz/address/0x9ACEB7d1d9EF3e6927B56b4D4fb78d280e24305c

Smart contract has no funds. Loaded funds to cover gas fees.
Submitting transaction from smart account...
✅ Transaction submitted from smart contract: 0x091e8488bbc24f9dc7c5efdc4401bd96adf17dc437ad751d8cf3881c3ef6d9fd
🔗 View your transaction on the Abstract Explorer: https://explorer.testnet.abs.xyz/tx/0x091e8488bbc24f9dc7c5efdc4401bd96adf17dc437ad751d8cf3881c3ef6d9fd

```

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
