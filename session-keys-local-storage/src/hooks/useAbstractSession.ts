import { useAccount } from "wagmi";
import { useCreateSession } from "@abstract-foundation/agw-react";
import { getStoredSession } from "../lib/getStoredSession";
import { validateSession } from "../lib/validateSession";
import { createAndStoreSession } from "../lib/createAndStoreSession";
import { clearStoredSession } from "../lib/clearStoredSession";
import type { SupportedChain } from "@/config/chain";

/**
 * @function useAbstractSession
 * @description React hook for managing Abstract Global Wallet sessions in local storage
 *
 * This hook provides a comprehensive API for working with Abstract Global Wallet sessions.
 * It uses the connected wallet's address to manage session data specific to that wallet.
 * The hook encapsulates all the session-related functionality into a simple interface
 * that can be used throughout the application.
 *
 * The hook handles:
 * - Retrieving stored sessions from local storage
 * - Validating sessions against the on-chain session validator
 * - Creating new sessions with specific permissions
 * - Clearing session data from local storage
 *
 * All functions automatically use the connected wallet's address, so you don't need
 * to pass it explicitly when calling the returned functions.
 *
 * @param {SupportedChain} chain - The blockchain configuration to use for session operations
 *
 * @returns An object containing functions for managing sessions:
 *   - getStoredSession: Retrieves and validates the stored session
 *   - validateSession: Validates a specific session hash
 *   - createAndStoreSession: Creates a new session and stores it
 *   - clearStoredSession: Clears session data from local storage
 *
 * If no wallet is connected, all functions will return null.
 */
export const useAbstractSession = (chain: SupportedChain) => {
  const { address } = useAccount();
  const { createSessionAsync } = useCreateSession();

  if (!address)
    return {
      getStoredSession: () => null,
      validateSession: () => null,
      createAndStoreSession: () => null,
      clearStoredSession: () => null,
    };

  return {
    getStoredSession: () =>
      getStoredSession(address, chain, createSessionAsync),
    validateSession: (sessionHash: string) =>
      validateSession(address, sessionHash, chain, createSessionAsync),
    createAndStoreSession: () =>
      createAndStoreSession(address, createSessionAsync),
    clearStoredSession: () => clearStoredSession(address),
  };
};
