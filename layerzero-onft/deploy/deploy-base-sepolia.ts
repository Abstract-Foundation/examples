import { HardhatRuntimeEnvironment } from "hardhat/types";
import { vars } from "hardhat/config";
import { ethers, JsonRpcProvider, Wallet } from "ethers";

// https://docs.layerzero.network/v2/developers/solana/technical-reference/deployed-contracts#base-sepolia
const BASE_SEPOLIA_LZ_ENDPOINT = "0x6EDCE65403992e310A62460808c4b910D972f10f";

// An example of a deploy script that will deploy and call a simple contract.
export default async function deploy(hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script`);

  // @ts-ignore Initialize the wallet using your private key.
  const provider = new JsonRpcProvider(hre.config.networks.baseSepolia.url!);
  const wallet = new Wallet(vars.get("DEPLOYER_PRIVATE_KEY"), provider);

  // Create deployer object and load the artifact of the contract we want to deploy.
  const artifact = await hre.artifacts.readArtifact("MyONFT721");
  const deployer = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  // Deploy this contract. The returned object will be of a `Contract` type,
  // similar to the ones in `ethers`.
  const nftContract = await deployer.deploy(
    "MyONFT721", // Name
    "MONFT", // Symbol
    BASE_SEPOLIA_LZ_ENDPOINT // LZ endpoint
  );
  await nftContract.waitForDeployment();

  console.log(
    `${artifact.contractName} was deployed to ${await nftContract.getAddress()}`
  );
}

(async () => {
  await deploy(require("hardhat"));
})();
