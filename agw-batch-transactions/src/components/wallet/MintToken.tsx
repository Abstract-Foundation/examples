import { erc20Abi, parseAbi } from "viem";
import { tokenAddress } from "@/app/constants";
import { useSendCalls, useWaitForCallsStatus } from "wagmi/experimental";
import { useAccount } from "wagmi";
import { useEffect } from "react";

interface MintTokenProps {
  onTransactionUpdate: (state: {
    transactionHash: `0x${string}` | undefined;
    isSuccess: boolean;
    explorerUrl?: string | undefined;
  } | null) => void;
}

interface BundleData {
  id: `0x${string}`;
}

export function MintToken({ onTransactionUpdate }: MintTokenProps) {
  const { address } = useAccount();
  const { sendCalls, data: bundle, isPending } = useSendCalls();

  const { data: callReceipts, status } = useWaitForCallsStatus({
    id: (bundle as unknown as BundleData)?.id,
    query: {
      enabled: bundle !== undefined,
    },
  });

  useEffect(() => {
    const bundleData = bundle as unknown as BundleData | undefined;
    if (bundleData?.id) {
      onTransactionUpdate({
        transactionHash: bundleData.id,
        isSuccess: (callReceipts as any)?.statusCode === 200,
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
          abi: parseAbi(["function mint(address) external"]),
          to: tokenAddress,
          functionName: "mint",
          args: [address],
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
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        <span className="w-full text-center">Mint Tokens</span>
      </button>
    </div>
  );
}

