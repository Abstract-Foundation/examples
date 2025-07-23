# Contracts

This is a demo NFT contract that allows users to pay a small fee to mint an NFT to demonstrate the Crossmint checkout flow.

The contract is deployed and verified on the Abstract testnet at [0x15DD55162257F34a0Fe87fe0E8eaBc15B0288305](https://sepolia.abscan.org/address/0x15DD55162257F34a0Fe87fe0E8eaBc15B0288305).

## Local Development

Follow the instructions on the [Abstract Foundry documentation](https://docs.abs.xyz/build-on-abstract/smart-contracts/foundry/get-started) to install and get started with Foundry.

**Install dependencies**

```bash
forge install
```

**Compile contracts**

```bash
forge build --zksync
```

**Deploy & verify contracts**

Follow the [keystore instructions](https://docs.abs.xyz/build-on-abstract/smart-contracts/foundry/get-started#6-deploy-the-smart-contract) to create a keystore file.

```bash
forge create src/NFTCollection.sol:NFTCollection \
    --account myKeystore \
    --rpc-url https://api.testnet.abs.xyz \
    --chain 11124 \
    --zksync \
    --verify \
    --verifier etherscan \
    --verifier-url https://api-sepolia.abscan.org/api \
    --etherscan-api-key TACK2D1RGYX9U7MC31SZWWQ7FCWRYQ96AD
```
