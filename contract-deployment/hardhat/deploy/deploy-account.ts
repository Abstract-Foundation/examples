import { Deployer } from "@matterlabs/hardhat-zksync";
import { Wallet } from "zksync-ethers";
import { vars } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { randomBytes } from "ethers";
import { TransactionReceipt } from "zksync-ethers/build/types";
import { hashBytecode } from "zksync-ethers/build/utils";

/**
 * An example of using the hardhat-zksync plugin to deploy smart contracts.
 *  1. Deploys the AccountFactory contract.
 *    - Since the factory can also deploy the Account contract, it also requires the bytecode of the Account contract in factoryDeps.
 *    - Because the Account contract is not explicitly deployed in the factory code, we need to manually provide it
 *        in the factoryDeps field when we go to deploy the factory contract.
 * 
 *  2. Using the factory, deploy an new instance of Account via the 2 different methods.
 */

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script... 👨‍🍳`);

  // Initialize the wallet using your private key.
  // https://hardhat.org/hardhat-runner/docs/guides/configuration-variables
  // Run npx hardhat vars set DEPLOYER_PRIVATE_KEY and put a new wallet's private key.
  const wallet = new Wallet(vars.get("DEPLOYER_PRIVATE_KEY"));

  // Create deployer from hardhat-zksync and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);

  // Load the artifact for the Account factory contract. 
  const factoryArtifact = await deployer.loadArtifact("AccountFactory");
  // Load the artifact for the Account contract itself - since we need to provide the bytecode of it.
  const accountArtifact = await deployer.loadArtifact("Account");

  // Deploy the factory contract. The returned object will be of a `Contract` type.
  const deployedFactoryContract = await deployer.deploy(
    factoryArtifact, // contract artifact
    [hashBytecode(accountArtifact.bytecode)], // constructor arguments - bytecode hash of the Account contract
    undefined, // deployment type, defaults to create
    undefined, // overrides, defaults to {}
    // Here - We need to provide the bytecode of the Account contract here.
    // Under the hood, it will also add the bytecode of the factory itself to the factoryDeps field.
    [accountArtifact.bytecode] // Provide the bytecode of the Account contract.
  );

  // From the factory contract, deploy the MyContract contract using the 2 different methods.
  const createTx: TransactionReceipt = await (await deployedFactoryContract.createAccount(wallet.address)).wait();
  const create2Tx: TransactionReceipt = await (await deployedFactoryContract.create2Account(wallet.address, randomBytes(32),)).wait(); // random salt

  console.log(
    `Deployed ${factoryArtifact.contractName} at ${await deployedFactoryContract.getAddress()} 🚀
      ✅ Deployed new contract via factory using create: ${createTx.contractAddress}
      ✅ Deployed new contract via factory using create2: ${create2Tx.contractAddress}
    `
  );
}
