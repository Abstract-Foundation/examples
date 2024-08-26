import { Hex } from "viem";
import { getAccount, getPublicClient } from "./utils";

/**
 * Simple function to load funds to our smart account so it can pay gas fees to the bootloader.
 */
export default async function (smartAccountAddress: Hex, amount: bigint) {
  try {
    const account = getAccount();
    const client = getPublicClient();

    const transactionHash = await client.sendTransaction({
      account,
      to: smartAccountAddress,
      value: amount,
    });

    const transactionDetails = await client.waitForTransactionReceipt({
      hash: transactionHash,
    });

    console.log("Smart contract has no funds. Loaded funds to cover gas fees.");
    return transactionDetails;
  } catch (e) {
    console.error("Error loading funds to smart account:", e);
    throw e;
  }
}
