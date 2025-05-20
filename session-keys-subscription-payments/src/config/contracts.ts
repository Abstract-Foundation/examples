export const SUBSCRIPTION_CONTRACT_ADDRESS =
  "0x52625e32Da56bd703B80eDFd270c86188fd77ca6" as `0x${string}`; // testnet address

export const SUBSCRIPTION_CONTRACT_ABI = [
  {
    type: "function",
    name: "isSubscribed",
    inputs: [{ name: "user", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "subscribe",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "subscriptionDuration",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "subscriptionExpiry",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "subscriptionFee",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "NewSubscription",
    inputs: [
      {
        name: "subscriber",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "expiresAt",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
];
