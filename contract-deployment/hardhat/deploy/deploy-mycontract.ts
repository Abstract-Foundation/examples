import { Deployer } from "@matterlabs/hardhat-zksync";
import { Wallet } from "zksync-ethers";
import { vars } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { randomBytes } from "ethers";
import { TransactionReceipt } from "zksync-ethers/build/types";

/**
 * An example of using the hardhat-zksync plugin to deploy smart contracts.
 *  1. Deploys the MyContractFactory contract.
 *    - Since the factory can also deploy the MyContract contract, it also requires the bytecode of the MyContract contract in factoryDeps.
 *    - However, the zksolc compiler detects it automatically, and populates it in the factoryDeps field of the factory artifact.
 *       - See the /artifacts-zk/contracts/MyContractFactory.sol/MyContractFactory.json - factoryDeps field.
 *    - The Deployer from @matterlabs/hardhat-zksync reads this and includes the factoryDeps in the EIP-712 deployment transaction.
 * 
 *  2. Using the factory, deploy an new instance of MyContract via the 4 different methods.
 */

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script... 👨‍🍳`);

  // Initialize the wallet using your private key.
  // https://hardhat.org/hardhat-runner/docs/guides/configuration-variables
  // Run npx hardhat vars set DEPLOYER_PRIVATE_KEY and put a new wallet's private key.
  const wallet = new Wallet(vars.get("DEPLOYER_PRIVATE_KEY"));

  // Create deployer from hardhat-zksync and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);

  // Load the artifact. Remember, for the factory, this artifact includes the factoryDeps containing the reference to the MyContract bytecode.
  const factoryArtifact = await deployer.loadArtifact("MyContractFactory");

  // Deploy the factory contract. The returned object will be of a `Contract` type.
  // Notice that we do NOT have to manually provide the factoryDeps field containing the bytecode of the MyContract contract.
  // Since this is already included in the factory artifact, the Deployer will automatically include it in the deployment transaction.
  // Under the hood, it will also add the bytecode of the factory itself to the factoryDeps field.
  const deployedFactoryContract = await deployer.deploy(factoryArtifact);

  // From the factory contract, deploy the MyContract contract using the 4 different methods.
  const createTx: TransactionReceipt = await (await deployedFactoryContract.createMyContract()).wait();
  const create2Tx: TransactionReceipt = await (await deployedFactoryContract.create2MyContract(randomBytes(32),)).wait(); // random salt
  const createAssemblyTx: TransactionReceipt = await (await deployedFactoryContract.createMyContractAssembly()).wait();
  const create2AssemblyTx: TransactionReceipt = await (await deployedFactoryContract.create2MyContractAssembly(randomBytes(32))).wait(); // random salt

  console.log(
    `Deployed ${factoryArtifact.contractName} at ${await deployedFactoryContract.getAddress()} 🚀
      ✅ Deployed new contract via factory using create: ${createTx.contractAddress}
      ✅ Deployed new contract via factory using create2: ${create2Tx.contractAddress}
      ✅ Deployed new contract via factory using create (with assembly): ${createAssemblyTx.contractAddress}
      ✅ Deployed new contract via factory using create2 (with assembly): ${create2AssemblyTx.contractAddress}
    `
  );
}
