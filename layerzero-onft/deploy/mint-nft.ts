import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { vars } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { config } from "./config";

export default async function mintNft(hre: HardhatRuntimeEnvironment) {
  console.log("Running mint NFT script...");

  const baseProvider = new JsonRpcProvider(`https://sepolia.base.org`);

  const baseWallet = new Wallet(vars.get("DEPLOYER_PRIVATE_KEY"), baseProvider);
  const baseArtifact = await hre.artifacts.readArtifact("MyONFT721");
  const baseNftContract = new Contract(
    config.baseSepolia.nftContractAddress,
    baseArtifact.abi,
    baseWallet
  );

  const baseTx = await baseNftContract.mint(baseWallet.address, 0);

  console.log(baseTx);
  await baseTx.wait();

  console.log(`✅ NFT minted on Base Sepolia
        - Contract: ${config.baseSepolia.nftContractAddress}
        - To: ${baseWallet.address}
    `);

  console.log(baseTx);
}

mintNft(require("hardhat"));
