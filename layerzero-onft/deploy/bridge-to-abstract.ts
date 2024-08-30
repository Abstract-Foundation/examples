import {
  Contract,
  ethers,
  JsonRpcProvider,
  Wallet,
  zeroPadBytes,
} from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { vars } from "hardhat/config";
import { config } from "./connect-contracts";

export default async function bridgeNftToAbstract(
  hre: HardhatRuntimeEnvironment
) {
  console.log(`Running bridge script`);

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
  const receiverAddress = "0x8e729E23CDc8bC21c37a73DA4bA9ebdddA3C8B6d"; // Replace with the receiver's address on the Abstract chain

  //   struct SendParam {
  //     uint32 dstEid; // Destination LayerZero EndpointV2 ID.
  //     bytes32 to; // Recipient address.
  //     uint256 tokenId;
  //     bytes extraOptions; // Additional options supplied by the caller to be used in the LayerZero message.
  //     bytes composeMsg; // The composed message for the send() operation.
  //     bytes onftCmd; // The ONFT command to be executed, unused in default ONFT implementations.
  // }

  // Prepare the SendParam
  const sendParam = {
    dstEid: config.abstractTestnet.endpointId,
    to: ethers.zeroPadBytes(receiverAddress, 32), // Convert address to bytes32
    tokenId: tokenId,
    extraOptions: "0x",
    composeMsg: "0x",
    onftCmd: "0x",
  };

  // Get the messaging fee
  //   const messagingFee = await baseNftContract.quoteSend(sendParam, false);

  try {
    // Send the NFT
    const tx = await baseNftContract.send(
      sendParam,
      {
        nativeFee: ethers.parseEther("0.001"),
        lzTokenFee: 0,
      },
      baseWallet.address,
      { value: ethers.parseEther("0.001") }
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

bridgeNftToAbstract(require("hardhat"));
