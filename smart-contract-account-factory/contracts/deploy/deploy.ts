import * as hre from "hardhat";
import { vars } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync";
import { Wallet } from "zksync-ethers";
import { Contract, ContractTransactionReceipt } from "ethers";

// An example of a deploy script that will deploy and call a simple contract.
export default async function deploy(hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script...`);

  // Initialize the wallet using your private key.
  const wallet = new Wallet(vars.get("DEPLOYER_PRIVATE_KEY"));
  const walletAddress = await wallet.getAddress();

  const deployer = new Deployer(hre, wallet);

  // Setup the SmartAccount ( we need to include the account bytecode hash when deploying the factory )
  const accountConstructorArgs = [walletAddress];
  const accountArtifact = await deployer.loadArtifact("SmartAccount");

  // Setup the SmartAccountFactory
  const factoryArtifact = await deployer.loadArtifact("SmartAccountFactory");
  const factoryDeployment = await deployer.deploy(factoryArtifact);
  const factoryContract = await factoryDeployment.waitForDeployment();
  const factoryContractAddress = await factoryContract.getAddress();

  await verifyContract({
    address: factoryContractAddress,
    constructorArguments: factoryContract.interface.encodeDeploy([]),
    bytecode: factoryArtifact.bytecode,
    contract: `${factoryArtifact.sourceName}:${factoryArtifact.contractName}`,
  });

  console.log(`✅ Factory contract deployed at: ${factoryContractAddress}`);

  // Call the factory contract to create a new account
  const newAccountTx = await factoryContract.deployAccount(walletAddress);
  const receipt: ContractTransactionReceipt = await newAccountTx.wait();
  const deployedContractAddress = receipt.contractAddress as string;
  const newAccountContract: Contract = new Contract(deployedContractAddress, accountArtifact.abi)

  await verifyContract({
    address: deployedContractAddress!,
    constructorArguments: newAccountContract.interface.encodeDeploy(accountConstructorArgs),
    bytecode: accountArtifact.bytecode,
    contract: `${accountArtifact.sourceName}:${accountArtifact.contractName}`,
  });

  console.log(`✅ New account deployed via factory at: ${deployedContractAddress}`);
}

const verifyContract = async (data: {
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