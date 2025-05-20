import {
  LimitType,
  type SessionConfig,
} from "@abstract-foundation/agw-client/sessions";
import { parseEther, toFunctionSelector } from "viem";

/**
 * Default call policies for session keys
 * Defines which contract functions the session key can call and with what limits
 */
export const DEFAULT_CALL_POLICIES = [
  {
    target: "0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA" as `0x${string}`, // NFT contract
    selector: toFunctionSelector("mint(address,uint256)"),
    valueLimit: {
      limitType: LimitType.Unlimited,
      limit: BigInt(0),
      period: BigInt(0),
    },
    maxValuePerUse: BigInt(0),
    constraints: [],
  },
];

export const SESSION_KEY_CONFIG: Omit<SessionConfig, "signer"> = {
  expiresAt: BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24),
  feeLimit: {
    limitType: LimitType.Lifetime,
    limit: parseEther("1"),
    period: BigInt(0),
  },
  callPolicies: DEFAULT_CALL_POLICIES,
  transferPolicies: [],
};
