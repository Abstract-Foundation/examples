import { EIP712_TYPES } from "zksync-ethers/build/utils";

export const eip712Domain = {
  name: "zkSync",
  version: "2",
  chainId: 11124,
};

export const eip712Types = EIP712_TYPES;
