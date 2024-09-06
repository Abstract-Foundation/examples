import {
  createPublicClient,
  createWalletClient,
  Hex,
  http,
} from "viem";
import { abstractTestnet } from "viem/chains";
import { eip712WalletActions } from "viem/zksync";
import {
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


(async () => {
  ensurePrivateKeyIsSet();

  // Regular smart contracts:
  const myContractFactoryAddress = await deployMyContractFactory();
  await deployMyContractUsingFactory(myContractFactoryAddress);
})();
