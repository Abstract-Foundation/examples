/**
 * @function decrypt
 * @description Decrypts data that was encrypted using the encrypt function
 *
 * This function uses the Web Crypto API to decrypt session data that was previously
 * encrypted with the corresponding encrypt function. It expects the input to be a
 * JSON string containing both the encrypted data and the initialization vector (IV)
 * that was used for encryption.
 *
 * @param {string} encryptedData - The encrypted data JSON string containing both the
 *                                encrypted data and the initialization vector (IV)
 *                                as hex strings
 * @param {CryptoKey} key - The AES-GCM decryption key to use (same key used for encryption)
 *
 * @returns {Promise<string>} A promise that resolves to the decrypted data as a string
 *
 * @throws Will throw an error if decryption fails, which may happen if the encryption
 *        key is incorrect or the data has been tampered with
 */
export const decrypt = async (
  encryptedData: string,
  key: CryptoKey
): Promise<string> => {
  console.log("Decrypting data:", encryptedData);
  const { iv, data } = JSON.parse(encryptedData);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: Buffer.from(iv, "hex") },
    key,
    Buffer.from(data, "hex")
  );

  return new TextDecoder().decode(decrypted);
};
