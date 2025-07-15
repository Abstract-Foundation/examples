# Abstract Global Wallet with Vue

This example showcases how to use the Abstract Global Wallet with [Vue.js](https://vuejs.org/) using the new EIP-6963 provider discovery standard.

It uses MIPD (Multi Injected Provider Discovery) EIP-6963 implementation with the `agw-web` package that announces AGW as an EIP-6963 provider.

## Local Development

1. Get a copy of the `agw-vue` example directory from the Abstract Examples repository:

   ```bash
   mkdir -p agw-vue && curl -L https://codeload.github.com/Abstract-Foundation/examples/tar.gz/main | tar -xz --strip=2 -C agw-vue examples-main/agw-vue && cd agw-vue
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Run the development server

   ```bash
   npm run dev
   ```

Visit [http://localhost:5173](http://localhost:5173) to see the app.

## How It Works

### 1. Provider Discovery

The app uses MIPD to discover available wallet providers following the EIP-6963 standard:

```typescript
import { createStore } from 'mipd'

const store = createStore()
const providers = store.getProviders()
const agwProvider = providers.find(p => p.info.name.includes('Abstract'))
```

### 2. Wallet Connection

The `useWallet` composable manages connection state and wallet interactions:

```typescript
const { connect, disconnect, address, isConnected } = useWallet()
```

### 3. Sponsored Transactions

Send gas-sponsored transactions using paymasters:

```typescript
// Send sponsored contract interaction
const hash = await walletClient.value.writeContract({
  abi: parseAbi(['function mint(address,uint256) external']),
  address: '0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA',
  functionName: 'mint',
  args: [address.value, BigInt(1)],
  paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
  paymasterInput: getGeneralPaymasterInput({ innerInput: '0x' })
})
```

## Useful Links

- [Abstract Global Wallet Docs](https://docs.abs.xyz/abstract-global-wallet/overview)
- [EIP-6963 Standard](https://eips.ethereum.org/EIPS/eip-6963)
- [MIPD Documentation](https://github.com/wevm/mipd)
- [Vue.js Composition API](https://vuejs.org/guide/reusability/composables.html)
- [Official Site](https://abs.xyz/)
- [GitHub](https://github.com/Abstract-Foundation)
- [X](https://x.com/AbstractChain)
- [Discord](https://discord.com/invite/abstractchain)
