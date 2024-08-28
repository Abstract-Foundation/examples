import type { HardhatUserConfig } from "hardhat/config";
import "@matterlabs/hardhat-zksync";
import "@nomicfoundation/hardhat-ethers";

const config: HardhatUserConfig = {
  defaultNetwork: "abstractTestnet",
  networks: {
    abstractTestnet: {
      url: "https://api.testnet.abs.xyz",
      ethNetwork: "sepolia",
      zksync: true,
      verifyURL:
        "https://api-explorer-verify.testnet.abs.xyz/contract_verification",
      chainId: 11124,
    },
    inMemoryNode: {
      url: "http://127.0.0.1:8011",
      ethNetwork: "localhost",
      zksync: true,
      chainId: 260,
    },
    hardhat: {
      zksync: true,
    },
  },
  solidity: {
    version: "0.8.24",
  },
  zksolc: {
    version: "latest",
    settings: {
      // This is the current name of the "isSystem" flag
      enableEraVMExtensions: true, // Note: NonceHolder and the ContractDeployer system contracts can only be called with a special isSystem flag as true
    },
  },
  paths: {
    sources: "src",
    tests: "test",
    cache: "cache-zk",
    artifacts: "artifacts-zk",
  },
};

export default config;
