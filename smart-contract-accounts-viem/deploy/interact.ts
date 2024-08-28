import {
  logExplorerUrl,
  getChain,
  getWalletClient,
  getPublicClient,
} from "./utils";
import loadFundsToAccount from "./loadFundsToAccount";
import { parseEther } from "viem";
import { toSmartAccount } from "viem/zksync";

// Address of the contract to interact with
const CONTRACT_ADDRESS = "";
if (!CONTRACT_ADDRESS)
  throw `⛔️ Provide the address of the contract to interact with.
  You must set the CONTRACT_ADDRESS variable in the interact.ts file to the address of your deployed smart contract account.`;

// What we're doing here is:
//  1. Creating a structured object (following EIP-712) that represents the transaction we want to send
//  2. Broadcasting the transaction to the network. Once it reaches the network, it:
//     1. Gets picked up by the bootloader
//     2. The bootloader sends it to the "from" address, which we set to the smart contract account we deployed (line 7)
//     3. The smart contract account (BasicAccount.sol) runs it's three functions in this order:
//        a) validateTransaction
//        b) payForTransaction
//        c) executeTransaction
export default async function () {
  console.log(`Running script to interact with contract ${CONTRACT_ADDRESS}`);

  const account = toSmartAccount({
    address: CONTRACT_ADDRESS,
    async sign({ hash }) {
      // ... signing logic (ours has no validation, so we leave it empty)
      return hash;
    },
  });

  const publicClient = getPublicClient();
  const walletClient = getWalletClient(account);

  // Check if the smart contract has any funds to pay for gas fees
  const balance = await publicClient.getBalance({
    address: walletClient.account.address,
  });

  // If it does not have any funds, load funds to the contract from your EOA (set as Hardhat private key)
  if (balance == 0n) {
    await loadFundsToAccount(CONTRACT_ADDRESS, parseEther("0.001"));
  }

  const transactionHash = await walletClient.sendTransaction({
    to: "0x8e729E23CDc8bC21c37a73DA4bA9ebdddA3C8B6d", // Example address to send funds to
    chainId: getChain().id,
    data: "0x69",
  });

  const resp = await publicClient.waitForTransactionReceipt({
    hash: transactionHash,
  });

  logExplorerUrl(resp.transactionHash, "tx");
}
