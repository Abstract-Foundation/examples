/**
 * @function encrypt
 * @description Encrypts data using AES-GCM encryption with a provided CryptoKey
 *
 * This function uses the Web Crypto API to encrypt session data for secure storage
 * in the browser's local storage. It generates a random initialization vector (IV)
 * for each encryption operation to ensure security. The encrypted data and IV are
 * both stored in the returned JSON string.
 *
 * @param {string} data - The data to encrypt, typically a stringified JSON object
 *                        containing session information and private keys
 * @param {CryptoKey} key - The AES-GCM encryption key to use
 *
 * @returns {Promise<string>} A promise that resolves to a JSON string containing
 *                           the encrypted data and the initialization vector (IV)
 *                           both encoded as hex strings
 */
export const encrypt = async (
  data: string,
  key: CryptoKey
): Promise<string> => {
  console.log("Encrypting data:", data);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(data)
  );

  return JSON.stringify({
    iv: Buffer.from(iv).toString("hex"),
    data: Buffer.from(encrypted).toString("hex"),
  });
};
