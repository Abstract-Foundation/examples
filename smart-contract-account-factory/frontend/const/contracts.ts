const FACTORY_CONTRACT_ADDRESS = "0x5B4381C913eE267034ce4401E4e1178A98a29eBA";

const FACTORY_CONTRACT_ADDRESS_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "accountAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "AccountCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "deployAccount",
    outputs: [
      {
        internalType: "address",
        name: "accountAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export { FACTORY_CONTRACT_ADDRESS, FACTORY_CONTRACT_ADDRESS_ABI };
