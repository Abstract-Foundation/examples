import { HardhatUserConfig } from 'hardhat/config';
import '@matterlabs/hardhat-zksync';
import '@nomicfoundation/hardhat-chai-matchers';

const config: HardhatUserConfig = {
  zksolc: {
    version: 'latest',
    settings: {
      enableEraVMExtensions: false,
    },
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      zksync: false,
    },
    abstractTestnet: {
      url: 'https://api.testnet.abs.xyz',
      ethNetwork: 'sepolia',
      zksync: true,
      verifyURL: 'https://api-explorer-verify.testnet.abs.xyz/contract_verification',
    },
  },
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
};

export default config;
