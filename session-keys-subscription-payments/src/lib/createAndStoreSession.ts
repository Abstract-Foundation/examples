import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Address } from "viem";
import { SessionConfig } from "@abstract-foundation/agw-client/sessions";
import { LOCAL_STORAGE_KEY_PREFIX } from "./constants";
import { getEncryptionKey } from "./getEncryptionKey";
import { encrypt } from "./encryptSession";
import { SESSION_KEY_CONFIG } from "@/config/session-key-config";
import { AbstractClient } from "@abstract-foundation/agw-client";

/**
 * @function createAndStoreSession
 * @description Creates a new Abstract Global Wallet session and stores it securely in local storage
 *
 * This function generates a new session with custom permissions for interacting with
 * specific contract functions. The session is then encrypted and stored in local storage.
 * The process includes:
 *
 * 1. Generating a new random private key for the session signer
 * 2. Creating a session with specific permissions using Abstract Global Wallet's createSessionAsync
 * 3. Encrypting both the session configuration and private key
 * 4. Storing the encrypted data in local storage
 *
 * The created session will have permissions to call specific functions on the bonding curve
 * factory contract with nearly unlimited value limits. The session is configured to last for
 * 30 days before expiring.
 *
 * @param {Address} userAddress - The wallet address that will own the session
 *
 * @returns {Promise<Object|null>} A promise that resolves to:
 *   - The created session data object (containing `session` and `privateKey`) if successful
 *   - null if the userAddress is empty or invalid
 *
 * @throws {Error} Throws "Session creation failed" if there's an error during session creation
 */
export const createAndStoreSession = async (
  abstractClient: AbstractClient,
  userAddress: Address
): Promise<{
  session: SessionConfig;
  privateKey: Address;
} | null> => {
  console.log("Creating session for address:", userAddress);
  if (!userAddress) return null;

  try {
    const sessionPrivateKey = generatePrivateKey();
    const sessionSigner = privateKeyToAccount(sessionPrivateKey);

    const { session } = await abstractClient.createSession({
      session: {
        signer: sessionSigner.address,
        ...SESSION_KEY_CONFIG,
      },
    });

    const sessionData = { session, privateKey: sessionPrivateKey };
    const key = await getEncryptionKey(userAddress);
    const encryptedData = await encrypt(
      JSON.stringify(sessionData, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      ),
      key
    );

    localStorage.setItem(
      `${LOCAL_STORAGE_KEY_PREFIX}${userAddress}`,
      encryptedData
    );
    return sessionData;
  } catch (error) {
    console.error("Failed to create session:", error);
    throw new Error("Session creation failed");
  }
};
