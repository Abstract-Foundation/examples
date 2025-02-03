# Contract Deployment Examples

This repository contains examples of how to deploy smart contracts and smart contract factories (contracts that can deploy other contracts) on Abstract using:

- [Hardhat](/hardhat/deploy)
- [Ethers.js](/clients/src/ethers.ts)
- [Viem](/clients/src/viem.ts)

Get a copy of the `contract-deployment` example directory from the Abstract Examples repository:

```bash
mkdir -p contract-deployment && curl -L https://codeload.github.com/Abstract-Foundation/examples/tar.gz/main | tar -xz --strip=2 -C contract-deployment examples-main/contract-deployment && cd contract-deployment
```

### Hardhat

1. Change the directory into the `hardhat` folder and install the dependencies.

   ```bash
   cd hardhat
   npm install
   ```

This is the setup instructions for the smart contracts of this repository.

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

4. Run the [deploy script](./hardhat/deploy/deploy-account.ts) to deploy the smart contract account factory and create a smart account via the factory.

   _Note: The `defaultNetwork` inside [hardhat.config.ts](./contracts/hardhat.config.ts) is set to `abstractTestnet`. You will need [testnet ETH from a faucet](https://docs.abs.xyz/ecosystem/faucets) in your wallet to deploy the contract to Abstract._

   ```bash
   npx hardhat deploy-zksync --script deploy-mycontract.ts
   npx hardhat deploy-zksync --script deploy-account.ts
   ```

### Ethers / zksync-ethers

1. Change the directory into the `clients` folder.

   ```bash
   cd clients

   # or if you were in the hardhat folder
   cd ../clients
   ```

2. Install the dependencies.

   ```bash
   npm install
   ```

3. Set your private key inside an environment variable.

   ```bash
   cp .env.example .env
   ```

   Replace the `PRIVATE_KEY` value with your wallet's private key.

4. Run the scripts

   ```bash
   npm run run-ethers
   npm run run-viem
   ```

## Useful Links

- [Docs](https://docs.abs.xyz/)
- [Official Site](https://abs.xyz/)
- [GitHub](https://github.com/Abstract-Foundation)
- [X](https://x.com/AbstractChain)
- [Discord](https://discord.com/invite/abstractchain)
