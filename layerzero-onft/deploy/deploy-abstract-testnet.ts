import { Contract, Wallet } from "zksync-ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync";
import { vars } from "hardhat/config";

// https://docs.layerzero.network/v2/developers/solana/technical-reference/deployed-contracts#abstract-testnet
export const ABSTRACT_TESTNET_LZ_ENDPOINT =
  "0x16c693A3924B947298F7227792953Cd6BBb21Ac8";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script`);

  // Initialize the wallet using your private key.
  const wallet = new Wallet(vars.get("DEPLOYER_PRIVATE_KEY"));

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact("MyONFT721");

  // Deploy this contract. The returned object will be of a `Contract` type.
  const constructorArgs = [
    "MyONFT721", // Name
    "MONFT", // Symbol
    ABSTRACT_TESTNET_LZ_ENDPOINT, // LZ Endpoint
  ];
  const contractDeployment = await deployer.deploy(artifact, constructorArgs);

  // Wait for deployment
  await contractDeployment.waitForDeployment();
  const contractAddress = await contractDeployment.getAddress();
  const contract = new Contract(contractAddress, artifact.abi, wallet);

  // Verify contract
  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: contract.interface.encodeDeploy(constructorArgs),
    bytecode: artifact.bytecode,
    contract: `${artifact.sourceName}:${artifact.contractName}`,
    noCompile: true,
  });

  console.log(
    `✅ ${artifact.contractName} was deployed to ${contractAddress} on Abstract Testnet`
  );
}
