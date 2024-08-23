import * as hre from "hardhat";
import { Provider, Wallet } from "zksync-ethers";
import { Deployer } from "@matterlabs/hardhat-zksync";
import { ethers } from "ethers";
import { vars } from "hardhat/config";

import "@matterlabs/hardhat-zksync-node/dist/type-extensions";
import "@matterlabs/hardhat-zksync-verify/dist/src/type-extensions";
import { DeploymentType } from "zksync-ethers/build/types";

const PRIVATE_KEY_HARDHAT_CONFIGURATION_VARIABLE_NAME = "WALLET_PRIVATE_KEY";

export const getProvider = () => {
  const rpcUrl = hre.network.config.url;
  if (!rpcUrl)
    throw `⛔️ RPC URL wasn't found in "${hre.network.name}"! Please add a "url" field to the network config in hardhat.config.ts`;

  // Initialize Abstract Provider
  const provider = new Provider(rpcUrl);

  return provider;
};

/**
 * Creates and returns a wallet instance.
 *
 * If a `privateKey` is provided, the wallet is initialized with that private key.
 * If no `privateKey` is provided, attempts to load the private key from Hardhat configuration variables.
 *
 * @param privateKey - Optional private key string used to initialize the wallet. If not provided, the private key is retrieved from Hardhat configuration variables.
 *                     For local development, use the RICH_WALLETS array to find private keys with funds on the local node.
 * @returns Wallet - A wallet instance initialized with the provided or configured private key and connected to the specified provider.
 * @throws Will throw an error if the private key cannot be found in the Hardhat configuration and none is provided.
 */
export const getWallet = (privateKey?: string) => {
  if (!privateKey) {
    const hardhatConfigPrivateKey = loadPrivateKeyFromHardhatConfig();
    privateKey = hardhatConfigPrivateKey;
  }

  const provider = getProvider();
  const wallet = new Wallet(privateKey, provider);

  return wallet;
};

/**
 * Verifies if the specified wallet has enough balance to cover a given amount.
 *
 * This function retrieves the balance of the provided wallet and compares it with the required amount.
 * If the wallet's balance is less than the required amount, an error is thrown with a message indicating
 * the shortfall.
 *
 * @param wallet - The `Wallet` instance whose balance is to be checked.
 * @param amount - The amount (in `bigint`) required to be available in the wallet.
 * @throws Will throw an error if the wallet's balance is less than the specified amount. The error message
 *         includes both the required amount and the current balance in ETH.
 */
export const verifyEnoughBalance = async (wallet: Wallet, amount: bigint) => {
  const balance = await wallet.getBalance();
  if (balance < amount)
    throw `⛔️ Wallet balance is too low! Required ${ethers.formatEther(
      amount
    )} ETH, but current ${wallet.address} balance is ${ethers.formatEther(
      balance
    )} ETH`;
};

/**
 * Verifies a contract on a blockchain using a given set of parameters.
 *
 * This function submits a contract verification request using Hardhat's `verify:verify` task.
 *
 * @param data - An object containing the contract verification parameters:
 *   - `address` (string): The address of the deployed contract to be verified.
 *   - `contract` (string): The path and name of the contract file, formatted as "contracts/MyPaymaster.sol:MyPaymaster".
 *   - `constructorArguments` (string): The constructor arguments used when deploying the contract, encoded as a string.
 *   - `bytecode` (string): The bytecode of the contract to be verified.
 *
 * @returns Promise<number> - The request ID of the verification request, which can be used to track the status of the verification.
 *
 * @throws Will throw an error if the verification request fails.
 */
export const verifyContract = async (data: {
  address: string;
  contract: string;
  constructorArguments: string;
  bytecode: string;
}) => {
  const verificationRequestId: number = await hre.run("verify:verify", {
    ...data,
    noCompile: true,
  });
  return verificationRequestId;
};

type DeployContractOptions = {
  /**
   * If true, the deployment process will not print any logs
   */
  silent?: boolean;
  /**
   * If true, the contract will not be verified on Block Explorer
   */
  noVerify?: boolean;
  /**
   * If specified, the contract will be deployed using this wallet
   */
  wallet?: Wallet;
};

/**
 * Deploys a contract to the blockchain and optionally verifies it.
 *
 *
 * @param contractArtifactName - The name of the contract artifact to be deployed. This should match the name used
 *                                when compiling the contract. E.g., "MyPaymaster".
 * @param deploymentType - The deployment type to be used. For smart contract accounts, use "createAccount".
 * @param constructorArguments - Optional arguments to be passed to the contract's constructor. These should be provided
 *                                as an array and are used when deploying the contract.
 * @param options - Optional deployment options:
 *   - `wallet` (Wallet): An optional wallet instance to be used for the deployment. If not provided, the getWallet() function
 *                        will be used.
 *   - `silent` (boolean): If `true`, suppresses logging messages.
 *   - `noVerify` (boolean): If `true`, skips the contract verification step after deployment.
 *
 * @returns Promise<Contract> - A promise that resolves to the deployed contract instance.
 *
 * @throws Will throw an error if:
 *   - The contract artifact cannot be found or loaded.
 *   - The wallet has insufficient balance for deployment.
 *   - Contract verification fails (if `noVerify` is not set to `true` and verification is requested).
 *
 * Example usage:
 * ```typescript
 * const contract = await deployContract("MyPaymaster");
 * ```
 */
export const deployContract = async (
  contractArtifactName: string,
  deploymentType: DeploymentType,
  constructorArguments?: any[],
  options?: DeployContractOptions
) => {
  const log = (message: string) => {
    if (!options?.silent) console.log(message);
  };

  log(`\nStarting deployment process of "${contractArtifactName}"...`);

  const wallet = options?.wallet ?? getWallet();
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer
    .loadArtifact(contractArtifactName)
    .catch((error) => {
      if (
        error?.message?.includes(
          `Artifact for contract "${contractArtifactName}" not found.`
        )
      ) {
        console.error(error.message);
        throw `⛔️ Please make sure you have compiled your contracts or specified the correct contract name!`;
      } else {
        throw error;
      }
    });

  // Estimate contract deployment fee
  const deploymentFee = await deployer.estimateDeployFee(
    artifact,
    constructorArguments || []
  );
  log(`Estimated deployment cost: ${ethers.formatEther(deploymentFee)} ETH`);

  // Check if the wallet has enough balance
  await verifyEnoughBalance(wallet, deploymentFee);

  // Deploy the contract to zkSync
  const contract = await deployer.deploy(
    artifact,
    constructorArguments,
    deploymentType
  );
  const address = await contract.getAddress();
  const constructorArgs = contract.interface.encodeDeploy(constructorArguments);
  const fullContractSource = `${artifact.sourceName}:${artifact.contractName}`;

  // Display contract deployment info
  log(`\n"${artifact.contractName}" was successfully deployed:`);
  log(` - Contract address: ${address}`);
  log(` - Contract source: ${fullContractSource}`);
  log(` - Encoded constructor arguments: ${constructorArgs}\n`);

  if (!options?.noVerify && hre.network.config.verifyURL) {
    log(`Requesting contract verification...`);
    await verifyContract({
      address,
      contract: fullContractSource,
      constructorArguments: constructorArgs,
      bytecode: artifact.bytecode,
    });
  }

  logExplorerUrl(address, "address");

  return contract;
};

/**
 * Rich wallets can be used for testing purposes.
 * Available on zkSync In-memory node and Dockerized node.
 */
export const LOCAL_RICH_WALLETS = [
  {
    address: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
    privateKey:
      "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110",
  },
  {
    address: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
    privateKey:
      "0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3",
  },
  {
    address: "0x0D43eB5B8a47bA8900d84AA36656c92024e9772e",
    privateKey:
      "0xd293c684d884d56f8d6abd64fc76757d3664904e309a0645baf8522ab6366d9e",
  },
  {
    address: "0xA13c10C0D5bd6f79041B9835c63f91de35A15883",
    privateKey:
      "0x850683b40d4a740aa6e745f889a6fdc8327be76e122f5aba645a5b02d0248db8",
  },
  {
    address: "0x8002cD98Cfb563492A6fB3E7C8243b7B9Ad4cc92",
    privateKey:
      "0xf12e28c0eb1ef4ff90478f6805b68d63737b7f33abfa091601140805da450d93",
  },
  {
    address: "0x4F9133D1d3F50011A6859807C837bdCB31Aaab13",
    privateKey:
      "0xe667e57a9b8aaa6709e51ff7d093f1c5b73b63f9987e4ab4aa9a5c699e024ee8",
  },
  {
    address: "0xbd29A1B981925B94eEc5c4F1125AF02a2Ec4d1cA",
    privateKey:
      "0x28a574ab2de8a00364d5dd4b07c4f2f574ef7fcc2a86a197f65abaec836d1959",
  },
  {
    address: "0xedB6F5B4aab3dD95C7806Af42881FF12BE7e9daa",
    privateKey:
      "0x74d8b3a188f7260f67698eb44da07397a298df5427df681ef68c45b34b61f998",
  },
  {
    address: "0xe706e60ab5Dc512C36A4646D719b889F398cbBcB",
    privateKey:
      "0xbe79721778b48bcc679b78edac0ce48306a8578186ffcb9f2ee455ae6efeace1",
  },
  {
    address: "0xE90E12261CCb0F3F7976Ae611A29e84a6A85f424",
    privateKey:
      "0x3eb15da85647edd9a1159a4a13b9e7c56877c4eb33f614546d4db06a51868b1c",
  },
];

function loadPrivateKeyFromHardhatConfig() {
  try {
    return vars.get(PRIVATE_KEY_HARDHAT_CONFIGURATION_VARIABLE_NAME);
  } catch (error) {
    throw `⛔️ No Hardhat configuration variable found for WALLET_PRIVATE_KEY.
    Run npx hardhat vars set WALLET_PRIVATE_KEY
    and enter a new wallet's private key (do NOT use your mainnet wallet)!`;
  }
}

export function logExplorerUrl(address: string, type: "address" | "tx") {
  if (hre.network.name === "abstractTestnet") {
    const explorerUrl = `https://explorer.testnet.abs.xyz/${type}/${address}`;
    const prettyType = type === "address" ? "account" : "transaction";

    console.log(
      `🔗 View your ${prettyType} on the Abstract Explorer: ${explorerUrl}\n`
    );
  }
}
