# LayerZero Example

This example shows you how to use [LayerZero](https://layerzero.network/) to bridge assets from another EVM chain to Abstract.

It shows you how to create a cross-chain NFT collection using LayerZero&rsquo;s [ONFT](https://docs.layerzero.network/v2/developers/evm/onft/quickstart) standard; and bridge an NFT from Base to Abstract using LayerZero.

## Local Development

1. Get a copy of the `layerzero-onft` example directory from the Abstract Examples repository:

   ```bash
   mkdir -p layerzero-onft && curl -L https://codeload.github.com/Abstract-Foundation/examples/tar.gz/main | tar -xz --strip=2 -C layerzero-onft examples-main/layerzero-onft && cd layerzero-onft
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Run the scripts in the `deploy` folder according to the instructions below.

### 1. Deploy NFT collection on Base

The code in [`deploy/deploy-base-sepolia.ts`](deploy/deploy-base-sepolia.ts) will deploy the cross-chain NFT collection on the Base Sepolia testnet.

```bash
yarn deploy-base
```

### 2. Deploy NFT collection on Abstract

The code in [`deploy/deploy-abstract-testnet.ts`](deploy/deploy-abstract-testnet.ts) will deploy the cross-chain NFT collection on the Abstract Testnet.

```bash
yarn deploy-abstract
```

### 3. Connect contracts

We link the two contracts together using LayerZero so we can bridge NFTs between the two chains.

First, take the contract addresses from the previous steps, and add them to the `config` object in [`deploy/connect-contracts.ts`](deploy/connect-contracts.ts):

```typescript
export const config = {
  baseSepolia: {
    endpointId: 40245,
    // Replace with your own NFT contract address
    nftContractAddress: "0x-your-base-nft-contract-address",
  },
  abstractTestnet: {
    endpointId: 40313,
    // Replace with your own NFT contract address
    nftContractAddress: "0x-your-abstract-nft-contract-address",
  },
};
```

Then, run the script to connect the contracts:

```bash
yarn connect-contracts
```

### 4. Mint NFT on Base

The code in [`deploy/mint-nft.ts`](deploy/mint-nft.ts) will mint an example NFT on the Base Sepolia testnet.

We&rsquo;ll use this NFT as an example to bridge across from Base to Abstract.

```bash
yarn mint-nft
```

### 5. Bridge NFT to Abstract

The code in [`deploy/bridge-to-abstract.ts`](deploy/bridge-to-abstract.ts) will bridge the NFT from Base to Abstract using LayerZero!

```bash
yarn bridge-to-abstract
```

## Useful Links

- [Docs](https://docs.abs.xyz/)
- [LayerZero Docs](https://docs.layerzero.network/)
- [Official Site](https://abs.xyz/)
- [GitHub](https://github.com/Abstract-Foundation)
- [X](https://x.com/AbstractChain)
- [Discord](https://discord.com/invite/abstractchain)
