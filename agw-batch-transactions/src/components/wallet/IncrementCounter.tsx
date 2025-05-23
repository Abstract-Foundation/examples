import { erc20Abi } from "viem";
import { counterAbi, counterAddress, tokenAddress } from "@/app/constants";
import { useAccount, useSendCalls, useWaitForCallsStatus } from "wagmi";
import { useEffect } from "react";

interface IncrementCounterProps {
  price: bigint;
  onTransactionUpdate: (state: {
    transactionHash: `0x${string}` | undefined;
    isSuccess: boolean;
    explorerUrl?: string | undefined;
  } | null) => void;
}

export function IncrementCounter({
  price,
  onTransactionUpdate,
}: IncrementCounterProps) {
  const { address } = useAccount();
  const { sendCalls, data: bundle, isPending } = useSendCalls();

  const { data: callReceipts } = useWaitForCallsStatus({
    id: bundle?.id,
    query: {
      enabled: bundle !== undefined,
    },
  });

  useEffect(() => {
    if (bundle?.id) {
      onTransactionUpdate({
        transactionHash: bundle.id as `0x${string}`,
        isSuccess: callReceipts?.statusCode === 200,
        explorerUrl: callReceipts?.receipts?.[0]?.transactionHash,
      });
    } else {
      onTransactionUpdate(null);
    }
  }, [bundle, callReceipts, onTransactionUpdate]);

  const onSubmitTransaction = () => {
    if (!address) return;

    sendCalls({
      calls: [
        {
          abi: erc20Abi,
          to: tokenAddress,
          functionName: "approve",
          args: [counterAddress, price],
        },
        {
          abi: counterAbi,
          to: counterAddress,
          functionName: "increment",
          args: [],
        },
      ],
    });
  };

  return (
    <div className="flex flex-col w-full border-solid">
      <button
        className={`rounded-full border border-solid transition-colors flex items-center justify-center text-white gap-2 text-sm h-10 px-5 font-[family-name:var(--font-roobert)] w-full
          ${
            isPending
              ? "bg-gray-500 cursor-not-allowed opacity-50"
              : "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 hover:cursor-pointer border-transparent"
          }`}
        onClick={onSubmitTransaction}
        disabled={!address || isPending}
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
        <span className="w-full text-center">Increment Counter</span>
      </button>
    </div>
  );
}
