import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TransactionRequest } from "viem";
import { abstractTestnet } from "viem/chains";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandom32ByteHex() {
  let result = "0x";
  const hexChars = "0123456789abcdef";
  for (let i = 0; i < 64; i++) {
    result += hexChars[Math.floor(Math.random() * 16)];
  }
  return result;
}

export type AbstractTransactionRequest = TransactionRequest & {
  paymasterInput: string;
  paymaster: string;
};

export function getSignInput(transaction: AbstractTransactionRequest) {
  const tx = {
    txType: 113n,
    from: transaction.from!,
    to: transaction.to,
    gasLimit: transaction.gas,
    gasPerPubdataByteLimit: 50_000n,
    maxFeePerGas: transaction.maxFeePerGas,
    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
    paymaster: transaction.paymaster,
    nonce: transaction.nonce,
    value: 0,
    data: transaction.data,
    factoryDeps: [],
    paymasterInput: transaction.paymasterInput,
  };

  console.log(tx);

  return tx;
}

export function typedDataTypes() {
  return {
    Transaction: [
      { name: "txType", type: "uint256" },
      { name: "from", type: "uint256" },
      { name: "to", type: "uint256" },
      { name: "gasLimit", type: "uint256" },
      { name: "gasPerPubdataByteLimit", type: "uint256" },
      { name: "maxFeePerGas", type: "uint256" },
      { name: "maxPriorityFeePerGas", type: "uint256" },
      { name: "paymaster", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
      { name: "factoryDeps", type: "bytes32[]" },
      { name: "paymasterInput", type: "bytes" },
    ],
  };
}

export function getTypedDataDomain() {
  return {
    name: "zkSync",
    version: "2",
    chainId: abstractTestnet.id,
  };
}
