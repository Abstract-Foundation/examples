import { clearStoredSession } from "./clearStoredSession";
import { createAndStoreSession } from "./createAndStoreSession";
import { SupportedChain } from "@/config/chain";
import { abstractTestnet } from "viem/chains";
import type { AbstractClient } from "@abstract-foundation/agw-client";
import type { Address } from "viem";
import type { SessionConfig } from "@abstract-foundation/agw-client/sessions";

/**
 * @function validateSession
 * @description Checks if a session is valid by querying the session validator contract
 *
 * This function verifies whether a session is still valid (active) by calling the
 * sessionStatus function on the Abstract Global Wallet session validator contract.
 * If the session is found to be invalid (expired, closed, or non-existent), it
 * automatically cleans up the invalid session data and attempts to create a new session.
 *
 * The validation is performed on-chain by checking the status of the session hash
 * for the given wallet address. The status is mapped to the SessionStatus enum,
 * where Active (1) indicates a valid session.
 *
 * @param {Address} address - The wallet address that owns the session
 * @param {string} sessionHash - The hash of the session to validate
 * @param {SupportedChain} chain - The blockchain configuration to use for validation
 * @param {(params: { session: SessionConfig }) => Promise<{ transactionHash?: `0x${string}`; session: SessionConfig }>} createSessionAsync - The function to create a new session
 *
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether
 *                            the session is valid (true) or not (false)
 */
export const validateSession = async (
  abstractClient: AbstractClient,
  address: Address,
  sessionHash: `0x${string}`,
  chain: SupportedChain,
  createSessionAsync: (params: {
    session: SessionConfig;
  }) => Promise<{ transactionHash?: `0x${string}`; session: SessionConfig }>
): Promise<boolean> => {

  try {
    const status = await abstractClient.getSessionStatus(sessionHash);

    console.log("status", status);
    console.log("chain", chain);

    // On Abstract testnet, any session is allowed, so we skip the check
    // However, on mainnet, we need to check if the session is both whitelisted and active.
    const isValid =
      status === SessionStatus.Active ||
      (chain === abstractTestnet && status === SessionStatus.NotInitialized);

    if (!isValid) {
      clearStoredSession(address);
      await createAndStoreSession(address, createSessionAsync);
    }

    return isValid;
  } catch (error) {
    console.error("Failed to validate session:", error);
    return false;
  }
};

/**
 * @enum {number} SessionStatus
 * @description Represents the possible statuses of an Abstract Global Wallet session
 *
 * This enum maps to the SessionKeyPolicyRegistry.Status values.
 * It's used to determine if a session is valid and can be used to submit transactions on behalf of the wallet.
 */
enum SessionStatus {
  /**
   * Session has not been initialized or does not exist
   */
  NotInitialized = 0,

  /**
   * Session is active and can be used to submit transactions
   */
  Active = 1,

  /**
   * Session has been manually closed/revoked by the wallet owner
   */
  Closed = 2,

  /**
   * Session has expired (exceeded its expiresAt timestamp)
   */
  Expired = 3,
}

export default SessionStatus;
