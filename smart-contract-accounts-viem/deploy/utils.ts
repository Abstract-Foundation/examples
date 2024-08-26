import * as hre from "hardhat";
import { vars } from "hardhat/config";
import {
  createPublicClient,
  createWalletClient,
  encodeAbiParameters,
  formatEther,
  getContract,
  Hex,
  http,
  PrivateKeyAccount,
} from "viem";
import { abstractTestnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import {
  eip712WalletActions,
  zksyncInMemoryNode,
  ZksyncSmartAccount,
} from "viem/zksync";

import "@matterlabs/hardhat-zksync-node/dist/type-extensions";
import "@matterlabs/hardhat-zksync-verify/dist/src/type-extensions";

const PRIVATE_KEY_HARDHAT_CONFIGURATION_VARIABLE_NAME = "WALLET_PRIVATE_KEY";

export const getPublicClient = () => {
  const rpcUrl = hre.network.config.url;

  return createPublicClient({
    transport: http(rpcUrl),
    chain: getChain(),
  }).extend(eip712WalletActions());
};

export const getWalletClient = (account?: ZksyncSmartAccount) => {
  const rpcUrl = hre.network.config.url;

  return createWalletClient({
    chain: getChain(),
    transport: http(rpcUrl),
    account,
  }).extend(eip712WalletActions());
};

export const getAccount = (privateKey?: Hex): PrivateKeyAccount => {
  if (!privateKey) {
    const hardhatConfigPrivateKey = loadPrivateKeyFromHardhatConfig();
    privateKey = hardhatConfigPrivateKey as Hex;
  }

  if (!privateKey.startsWith("0x")) {
    privateKey = `0x${privateKey}`;
  }

  return privateKeyToAccount(`${privateKey}`);
};

export const verifyEnoughBalance = async (
  wallet: PrivateKeyAccount,
  amount: bigint
) => {
  const balance = await getPublicClient().getBalance({
    address: wallet.address,
  });

  if (balance < amount)
    throw `⛔️ Wallet balance is too low! Required ${formatEther(
      amount
    )} ETH, but current ${wallet.address} balance is ${formatEther(
      balance
    )} ETH`;
};

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

export const deployContract = async (
  contractArtifactName: string,
  deploymentType: "create" | "create2" | "createAccount" | "create2Account",
  constructorArguments: any[] = []
) => {
  console.log(`\nStarting deployment process of "${contractArtifactName}"...`);

  const client = getPublicClient();
  const account = getAccount();

  const { abi, bytecode, deployedBytecode, contractName, sourceName } =
    hre.artifacts.readArtifactSync(contractArtifactName);

  const accountBalance = await client.getBalance({
    address: account.address,
  });

  if (accountBalance == 0n) {
    if (hre.network.name === "inMemoryNode") {
      console.log(
        `⛔️ Wallet balance is 0 ETH.
        
        Use a rich wallet from the LOCAL_RICH_WALLETS array in deploy/utils.ts.`
      );
    } else {
      throw `⛔️ Wallet balance is 0 ETH. Fund your wallet using a faucet.

      Learn more: https://docs.abs.xyz/ecosystem/faucets`;
    }
  }

  const transactionHash = await client.deployContract({
    account: account,
    chain: getChain(),
    abi: abi,
    bytecode: bytecode as Hex,
    args: constructorArguments,
    deploymentType: deploymentType,
  });

  const transactionDetails = await client.waitForTransactionReceipt({
    hash: transactionHash,
  });

  if (!transactionDetails || !transactionDetails.contractAddress) {
    throw `⛔️ Contract deployment failed!`;
  }

  const contract = getContract({
    address: transactionDetails.contractAddress,
    client: client,
    abi,
  });

  if (!contract.address) {
    throw `⛔️ Contract deployment failed!`;
  }

  console.log(`✅ Contract address: ${contract.address}`);

  // Viem concatenates the contract bytecode onto the ABI encoded data.
  const encodedConstructorArguments = encodeAbiParameters(
    abi.find((item) => item.type === "constructor")?.inputs || [],
    constructorArguments
  );

  if (hre.network.name === "abstractTestnet" && hre.network.verifyURL) {
    await verifyContract({
      address: contract.address,
      bytecode: deployedBytecode,
      constructorArguments: encodedConstructorArguments,
      contract: `${sourceName}:${contractName}`,
    });
    logExplorerUrl(contract.address, "address");
  }

  return contract;
};

export const getChain = () => {
  if (hre.network.name === "inMemoryNode") {
    return zksyncInMemoryNode;
  }

  if (hre.network.name === "abstractTestnet") {
    return abstractTestnet;
  } else {
    throw `⛔️ Unsupported network: ${hre.network.name}
    Supported networks are: inMemoryNode, abstractTestnet.

    See the getChain() function in deploy/utils.ts for more details.`;
  }
};

function loadPrivateKeyFromHardhatConfig() {
  try {
    return vars.get(PRIVATE_KEY_HARDHAT_CONFIGURATION_VARIABLE_NAME);
  } catch (error) {
    throw `⛔️ No Hardhat configuration variable found for WALLET_PRIVATE_KEY.
    Run npx hardhat vars set WALLET_PRIVATE_KEY
    and enter a new wallet's private key (do NOT use your mainnet wallet)!`;
  }
}

export function logExplorerUrl(address: Hex, type: "address" | "tx") {
  if (hre.network.name === "abstractTestnet") {
    const explorerUrl = `https://explorer.testnet.abs.xyz/${type}/${address}`;
    const prettyType = type === "address" ? "account" : "transaction";

    console.log(
      `🔗 View your ${prettyType} on the Abstract Explorer: ${explorerUrl}\n`
    );
  }
}

/**
 * Rich wallets can be used for testing purposes.
 * Available on the In-memory node and Dockerized node.
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
