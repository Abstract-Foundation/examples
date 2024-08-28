"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { useAddress } from "@/lib/useAddress";
import {
  FACTORY_CONTRACT_ADDRESS,
  FACTORY_CONTRACT_ADDRESS_ABI,
} from "@/const/contracts";
import useWalletClient from "@/lib/useWalletClient";
import { abstractTestnet } from "viem/chains";
import { createPublicClient, Hex, http } from "viem";
import Link from "next/link";

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

              const transactionHash = await walletClient?.writeContract({
                abi: FACTORY_CONTRACT_ADDRESS_ABI,
                address: FACTORY_CONTRACT_ADDRESS,
                functionName: "deployAccount",
                args: [address],
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
    </div>
  );
}
