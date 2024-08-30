import { Contract, JsonRpcProvider, Wallet, zeroPadValue } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { vars } from "hardhat/config";
import { config } from "./connect-contracts";

export default async function mintNft(hre: HardhatRuntimeEnvironment) {
  console.log("Running mint NFT script...");

  const baseProvider = new JsonRpcProvider(
    // @ts-ignore
    hre.config.networks.baseSepolia.url!
  );
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
