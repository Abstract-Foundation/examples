"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { useAddress } from "@/lib/useAddress";
import {
  FACTORY_CONTRACT_ADDRESS,
  FACTORY_ABI,
  NFT_ABI,
  NFT_ADDRESS,
  VALIDATOR_ADDRESS,
} from "@/const/contracts";
import useWalletClient from "@/lib/useWalletClient";
import { abstractTestnet } from "viem/chains";
import {
  createPublicClient,
  createWalletClient,
  encodeAbiParameters,
  encodeFunctionData,
  Hex,
  http,
  parseAbiParameters,
  parseEther,
} from "viem";
import Link from "next/link";
import {
  toSmartAccount,
  eip712WalletActions,
  serializeTransaction,
} from "viem/zksync";
import {
  generateRandom32ByteHex,
  getSignInput,
  getTypedDataDomain,
  typedDataTypes,
} from "@/lib/utils";

export default function DeploySmartWalletSection() {
  const walletClient = useWalletClient();
  const address = useAddress();

  const [smartContractAccountAddress, setSmartContractAccountAddress] =
    useState<Hex | null>(null);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full my-2 pt-6">
      {!address ? null : (
        <>
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-center">
            2. Deploy Smart Contract Account
          </h2>

          <p className="leading-7 mt-2 text-center">
            Your EOA will be set as the signer of the smart contract account.
          </p>

          <Button
            className="w-full max-w-[256px] mt-2"
            onClick={async () => {
              // Swap to Abstract testnet
              await walletClient?.addChain({
                chain: abstractTestnet,
              });

              // Generate a random salt
              const salt = generateRandom32ByteHex();

              const transactionHash = await walletClient?.writeContract({
                abi: FACTORY_ABI,
                address: FACTORY_CONTRACT_ADDRESS,
                functionName: "deployAccount",
                args: [address, salt.toString()],
                account: address,
                chain: abstractTestnet,
              });

              const publicClient = createPublicClient({
                chain: abstractTestnet,
                transport: http(),
              });

              if (!transactionHash) {
                alert("Failed to deploy smart contract account");
                return;
              }

              // Get the return value from the transaction
              const transactionDetails =
                await publicClient.waitForTransactionReceipt({
                  hash: transactionHash,
                });

              console.log("Transaction details: ", transactionDetails);

              setSmartContractAccountAddress(
                transactionDetails.contractAddress as Hex
              );
            }}
          >
            Deploy Smart Wallet
          </Button>

          {smartContractAccountAddress && (
            <p className="mt-2 text-green-500">
              Smart Contract Account Address:{" "}
              <Link
                target="_blank"
                rel="noopener noreferrer"
                className="bold underline"
                href={`https://explorer.testnet.abs.xyz/address/${smartContractAccountAddress}`}
              >
                {smartContractAccountAddress.slice(0, 6)}...
                {smartContractAccountAddress.slice(-4)}
              </Link>
            </p>
          )}
        </>
      )}

      {smartContractAccountAddress && (
        <>
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-center mt-12">
            3. Submit Transaction from Smart Contract Account
          </h2>

          <p className="leading-7 mt-2 text-center">
            Mint an NFT from the smart contract account.
          </p>

          <Button
            className="w-full max-w-[256px] mt-2"
            onClick={async () => {
              // First load some funds into the smart contract account
              walletClient?.sendTransaction({
                account: address as Hex,
                to: smartContractAccountAddress,
                value: parseEther("0.001"),
              });

              const smartAccount = toSmartAccount({
                address: smartContractAccountAddress, // The address of the deployed smart contract account
                async sign({ hash }) {
                  const result = await walletClient?.signMessage({
                    message: hash,
                    account: address as Hex,
                  });
                  return result as Hex;
                },
              });
              const smartAccountClient = createWalletClient({
                account: smartAccount, // Use the smart contract account
                chain: abstractTestnet,
                transport: http(`https://api.testnet.abs.xyz`),
              }).extend(eip712WalletActions());

              const mintData = encodeFunctionData({
                abi: NFT_ABI,
                functionName: "mint",
                args: [smartContractAccountAddress, 1],
              });

              // Prepare a transaction to mint an NFT using the smart account
              const preppedTx =
                await smartAccountClient.prepareTransactionRequest({
                  account: smartContractAccountAddress as Hex,
                  chain: abstractTestnet,
                  data: mintData,
                  to: NFT_ADDRESS,
                  type: "eip712",
                });

              // Convert the prepped transaction into a typed data object
              const typedData = {
                types: typedDataTypes(),
                primaryType: "Transaction",
                message: getSignInput(preppedTx as any), // Reshape the object into Eip-712 format
                domain: getTypedDataDomain(),
              };

              // The EOA signs the typed data under the hood
              const rawSignature = await smartAccountClient.signTypedData(
                typedData as any
              );

              const signature = encodeAbiParameters(
                parseAbiParameters(["bytes", "address", "bytes[]"]),
                [rawSignature as `0x${string}`, VALIDATOR_ADDRESS, []]
              );

              // Finally, format a transaction where it's sent from the smart contract
              // But the signature is from the EOA that is the signer of the account
              const serializedTx = serializeTransaction({
                ...preppedTx,
                customSignature: signature,
              } as any);

              const transactionHash =
                await smartAccountClient.sendRawTransaction({
                  serializedTransaction: serializedTx,
                });

              console.log("Transaction hash: ", transactionHash);
            }}
          >
            Mint NFT
          </Button>
        </>
      )}
    </div>
  );
}
