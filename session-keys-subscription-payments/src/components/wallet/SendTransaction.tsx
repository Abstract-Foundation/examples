import React, { useCallback } from "react";
import { useAbstractClient } from "@abstract-foundation/agw-react";
import { useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther } from "viem";
import {
  SUBSCRIPTION_CONTRACT_ABI,
  SUBSCRIPTION_CONTRACT_ADDRESS,
} from "../../config/contracts";
import { useAbstractSession } from "@/hooks/useAbstractSession";
import { privateKeyToAccount } from "viem/accounts";
import { chain } from "@/config/chain";

export function SendTransaction() {
  const { address } = useAccount();

  const { data: abstractClient } = useAbstractClient();
  const { data: sessionData } = useAbstractSession();

  const subscribe = useCallback(async () => {
    if (!address || !abstractClient || !sessionData) return;

    console.log(`Calling subscribe ${Date.now()}`);

    const sessionClient = abstractClient.toSessionClient(
      privateKeyToAccount(sessionData.privateKey),
      sessionData.session
    );

    const hash = await sessionClient.writeContract({
      abi: SUBSCRIPTION_CONTRACT_ABI,
      address: SUBSCRIPTION_CONTRACT_ADDRESS,
      functionName: "subscribe",
      value: BigInt(parseEther("0.0001")),
      account: sessionClient.account,
      chain: chain,
    });

    console.log(hash);
  }, [address]);

  return (
    <div className="flex flex-col w-full border-solid">
      <button
        className={`rounded-full border border-solid transition-colors flex items-center justify-center text-white gap-2 text-sm h-10 px-5 font-[family-name:var(--font-roobert)] w-full`}
        onClick={subscribe}
        disabled={!address}
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
        <span className="w-full text-center">Renew Subscription</span>
      </button>
    </div>
  );
}
