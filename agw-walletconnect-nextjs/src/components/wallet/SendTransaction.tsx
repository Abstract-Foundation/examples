import {
  useSendTransaction,
  useAccount,
  useDisconnect,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";

export function SendTransaction() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const {
    sendTransactionAsync,
    data: transactionHash,
    isPending,
  } = useSendTransaction();

  const { data: transactionReceipt } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  console.log(transactionHash);

  async function submitTransaction() {
    if (!address) {
      return;
    }

    try {
      const result = await sendTransactionAsync({
        to: "0xfE8f62b2ec3f6594499C94D02c7bE15394Ef53EE",
        value: parseEther("0.00001"),
      });

      console.log("Transaction result:", result);
    } catch (err) {
      console.error("Error sending transaction:", err);
    }
  }

  return (
    <div className="flex flex-col w-full border-solid gap-2">
      {address && (
        <button
          className={`rounded-full border border-solid transition-colors flex items-center justify-center text-white gap-2 text-sm h-10 px-5 font-[family-name:var(--font-roobert)] w-full
            ${
              isPending
                ? "bg-gray-500 cursor-not-allowed opacity-50"
                : "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 hover:cursor-pointer border-transparent"
            }`}
          onClick={submitTransaction}
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
          <span className="w-full text-center">
            {isPending ? "Sending..." : "Submit tx"}
          </span>
        </button>
      )}

      {address && (
        <button
          className="rounded-full border border-solid transition-colors flex items-center justify-center text-white gap-2 text-sm h-10 px-5 font-[family-name:var(--font-roobert)] w-full bg-transparent hover:bg-red-500/20 hover:cursor-pointer"
          onClick={() => disconnect()}
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="w-full text-center">Disconnect</span>
        </button>
      )}

      {transactionReceipt && (
        <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg text-center w-full">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm sm:text-base font-medium font-[family-name:var(--font-roobert)]">
              Transaction Success
              <span className="ml-1 text-green-500">✅</span>
            </p>

            <a
              href={`https://abscan.org/tx/${transactionReceipt.transactionHash}`}
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
