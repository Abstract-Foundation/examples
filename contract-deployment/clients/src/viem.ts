import { createPublicClient, createWalletClient, Hex, http, toHex } from "viem";
import { abstractTestnet } from "viem/chains";
import { eip712WalletActions, hashBytecode } from "viem/zksync";
import {
  ACCOUNT_BYTECODE,
  ACCOUNT_FACTORY_ABI,
  ACCOUNT_FACTORY_BYTECODE,
  ensurePrivateKeyIsSet,
  MY_CONTRACT_BYTECODE,
  MY_CONTRACT_FACTORY_ABI,
  MY_CONTRACT_FACTORY_BYTECODE,
  PRIVATE_KEY,
  RPC_URL,
} from "./constants.js";
import { privateKeyToAccount } from "viem/accounts";

const walletClient = createWalletClient({
  chain: abstractTestnet,
  transport: http(RPC_URL),
}).extend(eip712WalletActions());

const publicClient = createPublicClient({
  chain: abstractTestnet,
  transport: http(RPC_URL),
}).extend(eip712WalletActions());

async function deployMyContractFactory() {
  const hash = await walletClient.deployContract({
    abi: MY_CONTRACT_FACTORY_ABI,
    account: privateKeyToAccount(`0x${PRIVATE_KEY}` as Hex),
    bytecode: MY_CONTRACT_FACTORY_BYTECODE,
    // Add the bytecode for the MyContract.sol contract in the factoryDeps
    factoryDeps: [MY_CONTRACT_BYTECODE],
    chain: abstractTestnet,
    kzg: null,
    args: [],
    deploymentType: "create",
  });

  const transaction = await publicClient.waitForTransactionReceipt({ hash });

  console.log("✅ MyContractFactory deployed at:", transaction.contractAddress);

  return transaction.contractAddress;
}

async function deployMyContractUsingFactory(factoryContractAddress: Hex) {
  const hash = await walletClient.writeContract({
    account: privateKeyToAccount(`0x${PRIVATE_KEY}` as Hex),
    address: factoryContractAddress,
    abi: MY_CONTRACT_FACTORY_ABI,
    chain: abstractTestnet,
    functionName: "createMyContract",
  });

  const transaction = await publicClient.waitForTransactionReceipt({ hash });

  console.log(
    `✅ Deployed new contract via factory using create: ${transaction.contractAddress}`
  );
}

async function deployAccountFactory() {
  const bytecodeHash = toHex(hashBytecode(ACCOUNT_BYTECODE));

  // @ts-ignore
  const hash = await walletClient.deployContract({
    abi: ACCOUNT_FACTORY_ABI,
    account: privateKeyToAccount(`0x${PRIVATE_KEY}` as Hex),
    bytecode: ACCOUNT_FACTORY_BYTECODE,
    // Add the bytecode for the Account.sol contract in the factoryDeps
    factoryDeps: [ACCOUNT_BYTECODE],
    chain: abstractTestnet,
    kzg: null,
    args: [
      // @ts-ignore
      bytecodeHash,
    ],
    deploymentType: "create",
  });

  const transaction = await publicClient.waitForTransactionReceipt({ hash });

  console.log("✅ AccountFactory deployed at:", transaction.contractAddress);

  return transaction.contractAddress;
}

async function deployAccountUsingFactory(factoryContractAddress: Hex) {
  const ownerAccount = privateKeyToAccount(`0x${PRIVATE_KEY}` as Hex);

  const hash = await walletClient.writeContract({
    address: factoryContractAddress,
    account: ownerAccount,
    abi: ACCOUNT_FACTORY_ABI,
    chain: abstractTestnet,
    functionName: "createAccount",
    args: [ownerAccount.address],
  });

  const transaction = await publicClient.waitForTransactionReceipt({ hash });

  console.log(
    `✅ Deployed new contract via factory using create: ${transaction.contractAddress}`
  );
}

(async () => {
  ensurePrivateKeyIsSet();

  // Regular smart contracts:
  const myContractFactoryAddress = await deployMyContractFactory();
  await deployMyContractUsingFactory(myContractFactoryAddress);

  // Accounts:
  const accountFactoryAddress = await deployAccountFactory();
  await deployAccountUsingFactory(accountFactoryAddress);
})();
