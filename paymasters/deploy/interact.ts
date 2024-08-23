import { getWallet, LOCAL_RICH_WALLETS } from "./utils";
import { hexlify, parseEther, toUtf8Bytes } from "ethers";
import {
  getApprovalBasedPaymasterInput,
  getGeneralPaymasterInput,
  getPaymasterParams,
} from "zksync-ethers/build/paymaster-utils";

// Address of the contract to interact with

const CONTRACT_ADDRESS = "0x92B4D2E818C52204811d3A4BD062163903bdEC99";
if (!CONTRACT_ADDRESS)
  throw `⛔️ Provide the address of the contract to interact with.
  You must set the CONTRACT_ADDRESS variable in the interact.ts file to the address of your deployed paymaster contract.`;

// An example of a script to interact with the contract
export default async function () {
  console.log(`Running script to interact with contract ${CONTRACT_ADDRESS}`);

  // Connect to our wallet to send the transaction from
  const wallet = getWallet();

  // On your first run, the paymaster will need some funds to pay for gas.
  // This is a one-time operation, so you can comment this out after the first run.
  const loadFundsToPaymaster = (
    await wallet.sendTransaction({
      to: CONTRACT_ADDRESS,
      value: parseEther("0.001"), // load 0.001 ETH to the paymaster from your wallet
    })
  ).wait();

  // First we need to create the paymaster params object to send with the transaction.
  // There are a few helper functions in ethers to generate this for you:
  //   1. getPaymasterParams: Format the paymaster params object
  //   2. getGeneralPaymasterInput: Helper for general paymaster flow
  //   3. getApprovalBasedPaymasterInput: Helper for approval-based paymaster flow
  const type = "General"; // We're using a general flow in this example

  // Create the object
  const paymasterParams = getPaymasterParams(CONTRACT_ADDRESS, {
    type,
    innerInput: getGeneralPaymasterInput({
      type,
      innerInput: "0x", // Any additional info to send to the paymaster
    }),
  });

  // Submit tx, as an example, send a message to another wallet.
  const tx = await wallet.sendTransaction({
    to: LOCAL_RICH_WALLETS[4].address, // Just send it to some other wallet
    data: hexlify(toUtf8Bytes("Hello, world!")), // Send them a cute lil message
    customData: {
      paymasterParams, // Provide the paymaster params object
    },
  });

  // Wait for tx to be mined and get the result
  const res = await tx.wait();

  console.log(res);
}
