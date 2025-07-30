import { useWriteContractSponsored } from "@abstract-foundation/agw-react";
import { parseAbi } from "viem";
import { getGeneralPaymasterInput } from "viem/zksync";
import { useWaitForTransactionReceipt } from "wagmi";

export const useContract = () => {
  const { writeContractSponsored, data: transactionHash } =
    useWriteContractSponsored();
  const { data: transactionReceipt } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  const mintToken = (address: string) => {
    writeContractSponsored({
      abi: parseAbi(["function mint(address,uint256) external"]),
      address: "0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA",
      functionName: "mint",
      args: [address as `0x${string}`, BigInt(1)],
      paymaster: "0x5407B5040dec3D339A9247f3654E59EEccbb6391",
      paymasterInput: getGeneralPaymasterInput({
        innerInput: "0x",
      }),
    });
  };

  return {
    mintToken,
    transactionReceipt,
    canSubmitTransaction: !!writeContractSponsored,
  };
};
