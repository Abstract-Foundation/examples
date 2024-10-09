import { HardhatRuntimeEnvironment } from "hardhat/types";
import { vars } from "hardhat/config";
import { Contract, ContractFactory, ethers, JsonRpcProvider, Wallet } from "ethers";
import { config } from "./connect-contracts";

// https://docs.layerzero.network/v2/developers/solana/technical-reference/deployed-contracts#base-sepolia
export const BASE_SEPOLIA_LZ_ENDPOINT =
  "0x6EDCE65403992e310A62460808c4b910D972f10f";

// An example of a deploy script that will deploy and call a simple contract.
export default async function deploy(hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script`);

  // Setup Base Sepolia provider and wallet
  const baseProvider = new JsonRpcProvider(
    // @ts-ignore
    hre.config.networks.baseSepolia.url!
  );
  const baseWallet = new Wallet(vars.get("DEPLOYER_PRIVATE_KEY"), baseProvider);

  // Load the ONFT721 contract artifact
  const baseArtifact = await hre.artifacts.readArtifact("MyONFT721");

  // Deploy this contract. The returned object will be of a `Contract` type.
  const constructorArgs = [
    "MyONFT721", // Name
    "MONFT", // Symbol
    BASE_SEPOLIA_LZ_ENDPOINT, // LZ Endpoint
  ];

  const contractDeployer = new ContractFactory(baseArtifact.abi, baseArtifact.bytecode, baseWallet);
  const contractDeployment = await contractDeployer.deploy(...constructorArgs);

  // Wait for deployment
  await contractDeployment.waitForDeployment();
  const contractAddress = await contractDeployment.getAddress();
  const contract = new Contract(contractAddress, baseArtifact.abi, baseWallet);

  console.log(
    `✅ ${baseArtifact.contractName} was deployed to ${contractAddress} on Base Sepolia Testnet`
  )

}

deploy(require("hardhat"));
