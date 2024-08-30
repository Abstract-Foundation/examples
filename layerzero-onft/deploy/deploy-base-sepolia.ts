import { HardhatRuntimeEnvironment } from "hardhat/types";
import { vars } from "hardhat/config";
import { Contract, ethers, JsonRpcProvider, Wallet } from "ethers";
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

  // Load the ONFT721 contract artifact and create contract instance
  const baseArtifact = await hre.artifacts.readArtifact("MyONFT721");
  const baseNftContract = new Contract(
    config.baseSepolia.nftContractAddress,
    baseArtifact.abi,
    baseWallet
  );

  // Parameters for the send function
  const tokenId = 1; // Replace with the ID of the NFT you minted
  const abstractChainId = 1234; // Replace with the correct chain ID for your Abstract chain
  const receiverAddress = "0x..."; // Replace with the receiver's address on the Abstract chain

  // Prepare the SendParam
  const sendParam = {
    dstEid: abstractChainId,
    to: ethers.zeroPadValue(ethers.toBeHex(receiverAddress), 32), // Convert address to bytes32
    tokenId: tokenId,
    extraOptions: "0x",
    composeMsg: "0x",
  };

  // Get the messaging fee
  const messagingFee = await baseNftContract.quoteSend(sendParam, false);

  try {
    // Send the NFT
    const tx = await baseNftContract.send(
      sendParam,
      messagingFee,
      baseWallet.address,
      { value: messagingFee.nativeFee }
    );

    console.log("Bridging transaction sent. Waiting for confirmation...");
    const receipt = await tx.wait();

    console.log(`✅ NFT bridged from Base Sepolia to Abstract chain
    - Transaction Hash: ${receipt.hash}
    - From: ${baseWallet.address}
    - To: ${receiverAddress}
    - Token ID: ${tokenId}
  `);
  } catch (error) {
    console.error("Error bridging NFT:", error);
  }
}

deploy(require("hardhat"));
