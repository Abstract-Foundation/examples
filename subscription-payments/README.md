# Abstract Subscription Payments example

This project demonstrates a subscription payment system built on Abstract. It includes smart contracts for managing subscriptions and payments.

## Flow:

1. Registry owner creates subscription plans
2. Users deploy SubscriptionAccount
3. Account owner subscribes to plans
4. External services/automation can trigger subscription payments when due
5. Payments are processed through the account and sent to the registry

## Architecture

### SubscriptionRegistry

- Central contract managing all subscription plans
- Handles plan creation and management
- Tracks all active subscriptions
- Processes payments and withdrawals
- Owned by a central administrator

### SubscriptionAccount

- Smart contract wallet for subscription management
- zk compatible account implementation
- Secure transaction validation using `ECDSA`
- Only owner can modify subscription status

## Security Considerations

1. All contracts use OpenZeppelin's security primitives
2. Reentrancy protection on critical functions
3. Proper access control with ownership
4. Signature validation for all transactions
5. Balance checks before payments

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set your deployment private key:
   Make to go to faucet and get testnet funds

```bash
npx hardhat vars set DEPLOYER_PRIVATE_KEY <your_private_key_here>
```

## Available Commands

```bash
# Clean the project and remove all artifacts
npm run clean

# Compile contracts for Abstract
npm run compile

# Run tests (uses local Hardhat network)
npm test

# Deploy contracts to Abstract testnet
npm run deploy

# Verify contract on Abstract Explorer (replace CONTRACT_ADDRESS with your deployed contract address)
npm run verify CONTRACT_ADDRESS

# Check deployer balance
npm run check-balance
```

## Important Notes

1. Make sure to get testnet funds from the Abstract faucet before deployment
2. Use a new wallet for testing - don't use your real private key associated with real real trading wallet.
3. Tests run on local network, and deployment goes to Abstract testnet
