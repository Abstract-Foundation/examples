import { parseEther } from "viem";
import {
  LimitType,
  SessionConfig,
} from "@abstract-foundation/agw-client/sessions";
import { toFunctionSelector } from "viem";

/**
 * Create a session key configuration object given a server wallet address.
 * @param serverWalletAddress - The wallet address to use as the signer.
 * @returns SessionConfig object.
 */
export function createSessionConfig(
  serverWalletAddress: `0x${string}`
): SessionConfig {
  return {
    signer: serverWalletAddress, // Pass the server wallet address as the signer
    expiresAt: BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60), // 1 week
    feeLimit: {
      limitType: LimitType.Lifetime,
      limit: parseEther("1"), // 1 ETH lifetime gas limit
      period: BigInt(0),
    },
    callPolicies: [
      {
        target: "0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA", // Example NFT Contract
        selector: toFunctionSelector("mint(address,uint256)"), // Allowed function (mint)
        valueLimit: {
          limitType: LimitType.Unlimited,
          limit: BigInt(0),
          period: BigInt(0),
        },
        maxValuePerUse: BigInt(0),
        constraints: [],
      },
    ],
    transferPolicies: [],
  };
}
