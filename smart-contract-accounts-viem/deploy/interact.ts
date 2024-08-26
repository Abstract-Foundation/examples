import { getProvider, logExplorerUrl } from "./utils";
import { serializeEip712 } from "zksync-ethers/build/utils";
import { L2VoidSigner, Wallet } from "zksync-ethers";
import { parseEther } from "ethers";
import loadFundsToAccount from "./loadFundsToAccount";

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

  const provider = getProvider();

  // Create a "VoidSigner" setting the account to connect to as the smart contract account.
  // We can use a void signer because our contract doesn't verify any signatures.
  const signer = new L2VoidSigner(CONTRACT_ADDRESS, provider);

  // Get the current nonce of the smart contract account
  const nonce = await signer.getNonce();

  // Check if the smart contract has any funds to pay for gas fees
  const balance = await provider.getBalance(CONTRACT_ADDRESS);

  // If it does not have any funds, load funds to the contract from your EOA (set as Hardhat private key)
  if (balance == 0n) {
    loadFundsToAccount(CONTRACT_ADDRESS, parseEther("0.001"));
  }

  // Create a transaction object to send "from" the smart smart contract account
  const transaction = await signer.populateTransaction({
    nonce: nonce, // You may need to change this if you're sending multiple transactions.
    to: Wallet.createRandom().address, // As an example, let's send money to another random wallet for our tx.
    customData: {
      customSignature: "0x69", // Since our contract does no validation, we can put any hex value here. But it is still required.
    },
  });

  // Broadcast the transaction to the network
  const sentTx = await getProvider().broadcastTransaction(
    serializeEip712(transaction)
  );
  const resp = await sentTx.wait();

  logExplorerUrl(resp.hash, "tx");
}
