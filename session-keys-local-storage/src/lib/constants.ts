/**
 * @constant {string} SESSION_KEY_VALIDATOR
 * @description The address of the Abstract Global Wallet session key validator contract
 * Docs: https://docs.abs.xyz/abstract-global-wallet/session-keys/going-to-production
 *
 * This contract is used to verify the validity of session keys and determine their status.
 * It implements the sessionStatus function which takes an account address and a session hash
 * and returns the current status of that session.
 */
export const SESSION_KEY_VALIDATOR =
  "0x00180f0b9d72664AC2D494Dec6E39d3aC061ed65";

/**
 * @constant {Array} SESSION_VALIDATOR_ABI
 * @description The ABI (Application Binary Interface) for the session key validator contract
 *
 * Contains the function signature for sessionStatus which can be used to check if a session
 * is still valid. This ABI only includes the relevant function needed for session validation.
 */
export const SESSION_VALIDATOR_ABI = [
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "bytes32", name: "sessionHash", type: "bytes32" },
    ],
    name: "sessionStatus",
    outputs: [
      { internalType: "enum SessionLib.Status", name: "", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

/**
 * @constant {string} LOCAL_STORAGE_KEY_PREFIX
 * @description Prefix used for storing encrypted session data in local storage
 *
 * The actual storage key is created by appending the user's wallet address to this prefix,
 * ensuring each wallet address has its own unique storage key.
 * The prefix includes the current NODE_ENV to separate data between environments.
 */
export const LOCAL_STORAGE_KEY_PREFIX = `abstract_session_${process.env.NODE_ENV || 'development'}_`;

/**
 * @constant {string} ENCRYPTION_KEY_PREFIX
 * @description Prefix used for storing encryption keys in local storage
 *
 * The actual storage key is created by appending the user's wallet address to this prefix,
 * ensuring each wallet address has its own unique encryption key stored separately from the
 * encrypted session data.
 * The prefix includes the current NODE_ENV to separate data between environments.
 */
export const ENCRYPTION_KEY_PREFIX = `encryption_key_${process.env.NODE_ENV || 'development'}_`;
