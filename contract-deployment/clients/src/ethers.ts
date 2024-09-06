import { ContractFactory, Provider, Wallet } from "zksync-ethers";
import {
  ACCOUNT_BYTECODE,
  ACCOUNT_FACTORY_ABI,
  ACCOUNT_FACTORY_BYTECODE,
  MY_CONTRACT_BYTECODE,
  MY_CONTRACT_FACTORY_ABI,
  MY_CONTRACT_FACTORY_BYTECODE,
  PRIVATE_KEY,
  RPC_URL,
} from "./constants.js";
import { hashBytecode } from "zksync-ethers/build/utils.js";

const provider = new Provider(RPC_URL);
const wallet = new Wallet(PRIVATE_KEY, provider);

async function deployMyContractFactory() {
  const myContractFactoryDeployer = new ContractFactory(
    MY_CONTRACT_FACTORY_ABI,
    MY_CONTRACT_FACTORY_BYTECODE,
    wallet
  );

  const contract = await myContractFactoryDeployer.deploy({
    customData: {
      // Add the bytecode for the MyContract.sol contract in the factoryDeps
      factoryDeps: [MY_CONTRACT_BYTECODE],
    },
  });

  console.log("✅ MyContractFactory deployed at:", await contract.getAddress());
  return contract;
}

async function deployMyContractUsingFactory(factoryContract) {
  const createMyContract = await(await factoryContract.createMyContract()).wait();

  console.log(
    `✅ Deployed new contract via factory using create: ${createMyContract.contractAddress}`
  );
}

async function deployAccountFactory() {
  const accountFactoryDeployer = new ContractFactory(
    ACCOUNT_FACTORY_ABI,
    ACCOUNT_FACTORY_BYTECODE,
    wallet
  );

  const accountBytecodeHash = hashBytecode(ACCOUNT_BYTECODE);

  const contract = await accountFactoryDeployer.deploy(
    accountBytecodeHash, // constructor args
    {
    customData: {
      // Add the bytecode for the Account.sol contract in the factoryDeps
      factoryDeps: [ACCOUNT_BYTECODE],
    },
  });

  console.log("✅ AccountFactory deployed at:", await contract.getAddress());
  return contract;
}

async function deployAccountUsingFactory(factoryContract) {
  const createAccount = await(await factoryContract.createAccount(
    wallet.address, // owner argument
  )).wait();

  console.log(
    `✅ Deployed new account via factory using create: ${createAccount.contractAddress}`
  );
}

(async () => {
  // Regular smart contracts:
  const myContractFactory = await deployMyContractFactory();
  await deployMyContractUsingFactory(myContractFactory);

  // Accounts:
  const accountFactory = await deployAccountFactory();
  await deployAccountUsingFactory(accountFactory);
})();
