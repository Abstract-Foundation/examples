import {
  getSessionHash,
  SessionConfig,
} from "@abstract-foundation/agw-client/sessions";
import { LOCAL_STORAGE_KEY_PREFIX } from "./constants";
import { getEncryptionKey } from "./getEncryptionKey";
import { decrypt } from "./decryptSession";
import { validateSession } from "./validateSession";
import { SupportedChain } from "@/config/chain";
import type { Address } from "viem";

/**
 * @function getStoredSession
 * @description Retrieves, decrypts, and validates a stored session for a wallet address
 *
 * This function performs several steps to securely retrieve and validate a stored session:
 * 1. Checks local storage for encrypted session data under the wallet address key
 * 2. Retrieves the encryption key for the wallet address
 * 3. Decrypts the session data using the encryption key
 * 4. Parses the decrypted data to obtain session information
 * 5. Validates the session by checking its status on-chain
 *
 * If the session is found to be invalid during validation, it will be automatically
 * cleared and a new session will be created.
 *
 * @param {Address} address - The wallet address whose session should be retrieved
 * @param {SupportedChain} chain - The blockchain configuration to use for validation
 * @param {(params: { session: SessionConfig }) => Promise<{ transactionHash?: `0x${string}`; session: SessionConfig }>} createSessionAsync - The function to create a new session
 *
 * @returns {Promise<Object|null>} A promise that resolves to:
 *   - The session data object (containing `session` and `privateKey`) if successful
 *   - null if no session exists or if decryption/validation fails
 *
 * The returned session object contains:
 * - session: The Abstract Global Wallet session configuration
 * - privateKey: The private key for the session signer
 */
export const getStoredSession = async (
  address: Address,
  chain: SupportedChain,
  createSessionAsync: (params: {
    session: SessionConfig;
  }) => Promise<{ transactionHash?: `0x${string}`; session: SessionConfig }>
): Promise<object | null> => {
  console.log("Getting stored session for address:", address);
  if (!address) return null;

  const encryptedData = localStorage.getItem(
    `${LOCAL_STORAGE_KEY_PREFIX}${address}`
  );
  if (!encryptedData) return null;

  try {
    const key = await getEncryptionKey(address);
    const decryptedData = await decrypt(encryptedData, key);
    const parsedData = JSON.parse(decryptedData);
    const sessionHash = getSessionHash(parsedData.session);
    await validateSession(address, sessionHash, chain, createSessionAsync);
    return parsedData;
  } catch (error) {
    console.error("Failed to decrypt session:", error);
    return null;
  }
};
