import { ENCRYPTION_KEY_PREFIX } from "./constants";
import type { Address } from "viem";

/**
 * @function getEncryptionKey
 * @description Retrieves or generates an AES-GCM encryption key for a specific wallet address
 *
 * This function manages encryption keys used to secure session data in local storage.
 * It first checks if an encryption key already exists for the given wallet address.
 * If found, it imports and returns the existing key. Otherwise, it generates a new
 * 256-bit AES-GCM key, stores it in local storage, and returns it.
 *
 * The encryption keys are stored in local storage with a prefix (defined in constants.ts)
 * followed by the wallet address to ensure each wallet has its own unique encryption key.
 *
 * @param {Address} userAddress - The wallet address to get or generate an encryption key for
 *
 * @returns {Promise<CryptoKey>} A promise that resolves to a CryptoKey object that can be
 *                              used with the Web Crypto API for encryption and decryption
 */
export const getEncryptionKey = async (
  userAddress: Address
): Promise<CryptoKey> => {
  console.log("Getting encryption key for address:", userAddress);
  const storedKey = localStorage.getItem(
    `${ENCRYPTION_KEY_PREFIX}${userAddress}`
  );

  if (storedKey) {
    return crypto.subtle.importKey(
      "raw",
      Buffer.from(storedKey, "hex"),
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
  }

  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const exportedKey = await crypto.subtle.exportKey("raw", key);
  localStorage.setItem(
    `${ENCRYPTION_KEY_PREFIX}${userAddress}`,
    Buffer.from(exportedKey).toString("hex")
  );

  return key;
};
