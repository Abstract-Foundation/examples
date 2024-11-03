import { Contract, ethers, JsonRpcProvider, Wallet } from "ethers";
import { Options } from '@layerzerolabs/lz-v2-utilities';
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { vars } from "hardhat/config";
import { config } from "./connect-contracts";

export default async function bridgeNftToAbstract(
  hre: HardhatRuntimeEnvironment
) {
  console.log(`Running bridge script`);

  // Setup Base Sepolia provider and wallet
  const baseProvider = new JsonRpcProvider(`https://sepolia.base.org`);

  const baseWallet = new Wallet(vars.get("DEPLOYER_PRIVATE_KEY"), baseProvider);

  // Load the ONFT721 contract artifact and create contract instance
  const baseArtifact = await hre.artifacts.readArtifact("MyONFT721");
  const baseNftContract = new Contract(
    config.baseSepolia.nftContractAddress,
    baseArtifact.abi,
    baseWallet
  );

  // Parameters for the send function
  const tokenId = 0; // Replace with the ID of the NFT you minted
  const receiverAddress = "0x273B3527BF5b607dE86F504fED49e1582dD2a1C6"; // Replace with the receiver's address on the Abstract chain

  const GAS_LIMIT = 2000000; // Gas limit for the executor
  const MSG_VALUE = 0; // msg.value for the lzReceive() fun ction on destination in wei
  const _options = Options.newOptions().addExecutorLzReceiveOption(GAS_LIMIT, MSG_VALUE);

  const sendParam = {
    dstEid: BigInt(config.abstractTestnet.endpointId),
    to: ethers.zeroPadBytes(receiverAddress, 32), // Convert address to bytes32
    tokenId: tokenId,
    extraOptions: _options.toHex(), // Use the manually constructed extraOptions
    composeMsg: "0x", // Keep as is or modify as needed
    onftCmd: "0x",
  };

  // Get the messaging fee
  const messagingFee = await baseNftContract.quoteSend(sendParam, false);
  const nativeFee = messagingFee[0]; // Extract the native fee value

  try {
    // Send the NFT
    const tx = await baseNftContract.send(
      sendParam,
      { nativeFee, zroFee: 0n, lzTokenFee: 0n },
      baseWallet.address,
      { value: nativeFee } // Use the extracted nativeFee
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
