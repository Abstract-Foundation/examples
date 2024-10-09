import "@matterlabs/hardhat-zksync";
import { HardhatUserConfig } from "hardhat/config";
import { vars } from "hardhat/config";

const config: HardhatUserConfig = {
  zksolc: {
    version: "latest",
    settings: {
      // This is the current name of the "isSystem" flag
      enableEraVMExtensions: false, // Note: NonceHolder and the ContractDeployer system contracts can only be called with a special isSystem flag as true
    },
  },
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
    baseSepolia: {
      url: "https://sepolia.base.org",
      ethNetwork: "sepolia",
      zksync: false,
      chainId: 84532,
      accounts: [vars.get("DEPLOYER_PRIVATE_KEY")],
    },
  },
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};

export default config;
