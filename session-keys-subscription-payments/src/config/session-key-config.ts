import {
  LimitType,
  type SessionConfig,
} from "@abstract-foundation/agw-client/sessions";
import { parseEther, toFunctionSelector } from "viem";
import { SUBSCRIPTION_CONTRACT_ADDRESS } from "./contracts";

/**
 * Default call policies for session keys
 * Defines which contract functions the session key can call and with what limits
 */
export const DEFAULT_CALL_POLICIES = [
  {
    target: SUBSCRIPTION_CONTRACT_ADDRESS, // Subscription contract
    selector: toFunctionSelector("subscribe()"),
    valueLimit: {
      limitType: LimitType.Allowance,
      limit: BigInt(parseEther("0.0001")), // Subscription fee
      period: BigInt(15 * 60), // 15 minutes
    },
    maxValuePerUse: BigInt(parseEther("0.0001")), // Max value per call is the subscription fee
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
