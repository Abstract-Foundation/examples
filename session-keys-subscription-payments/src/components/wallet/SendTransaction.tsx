import React from "react";
import { useWriteContractSponsored } from "@abstract-foundation/agw-react";
import { useWaitForTransactionReceipt, useAccount } from "wagmi";
import { getGeneralPaymasterInput } from "viem/zksync";
import { parseAbi } from "viem";

export function SendTransaction() {
  const { address } = useAccount();
  const {
    writeContractSponsored,
    data: transactionHash,
    isPending,
  } = useWriteContractSponsored();

  const { data: transactionReceipt } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  const hasTransaction = !!transactionReceipt;

  const onSubmitTransaction = () => {
    if (!address) return;

    writeContractSponsored({
      abi: parseAbi(["function mint(address,uint256) external"]),
      address: "0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA",
      functionName: "mint",
      args: [address, BigInt(1)],
      paymaster: "0x5407B5040dec3D339A9247f3654E59EEccbb6391",
      paymasterInput: getGeneralPaymasterInput({
        innerInput: "0x",
      }),
    });
  };

  return (
    <div className="flex flex-col w-full border-solid">
      <button
        className={`rounded-full border border-solid transition-colors flex items-center justify-center text-white gap-2 text-sm h-10 px-5 font-[family-name:var(--font-roobert)] w-full
          ${
            isPending || hasTransaction
              ? "bg-gray-500 cursor-not-allowed opacity-50"
              : "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 hover:cursor-pointer border-transparent"
          }`}
        onClick={onSubmitTransaction}
        disabled={!address || isPending || hasTransaction}
      >
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <span className="w-full text-center">Submit tx</span>
      </button>

      {transactionHash && (
        <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg text-center w-full">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm sm:text-base font-medium font-[family-name:var(--font-roobert)]">
              {transactionReceipt ? (
                <>
                  Transaction Success
                  <span className="ml-1 text-green-500">✅</span>
                </>
              ) : (
                <>
                  Transaction Pending
                  <span className="ml-1 text-yellow-500">⏳</span>
                </>
              )}
            </p>

            <a
              href={`https://sepolia.abscan.org/tx/${transactionReceipt?.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 underline"
            >
              View on Explorer
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
