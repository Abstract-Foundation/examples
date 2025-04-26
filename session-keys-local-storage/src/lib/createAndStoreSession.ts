import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Address, parseEther, toFunctionSelector } from "viem";
import {
  LimitType,
  SessionConfig,
} from "@abstract-foundation/agw-client/sessions";
import { LOCAL_STORAGE_KEY_PREFIX } from "./constants";
import { getEncryptionKey } from "./getEncryptionKey";
import { encrypt } from "./encryptSession";

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
 * @param {(params: { session: SessionConfig }) => Promise<{ transactionHash?: `0x${string}`; session: SessionConfig }>} createSessionAsync - The createSessionAsync function from useCreateSession hook
 * @param {SupportedChain} chain - The blockchain configuration to use (determines which factory address to use)
 *
 * @returns {Promise<Object|null>} A promise that resolves to:
 *   - The created session data object (containing `session` and `privateKey`) if successful
 *   - null if the userAddress is empty or invalid
 *
 * @throws {Error} Throws "Session creation failed" if there's an error during session creation
 */
export const createAndStoreSession = async (
  userAddress: Address,
  createSessionAsync: (params: {
    session: SessionConfig;
  }) => Promise<{ transactionHash?: `0x${string}`; session: SessionConfig }>
): Promise<{
  session: SessionConfig;
  privateKey: Address;
} | null> => {
  console.log("Creating session for address:", userAddress);
  if (!userAddress) return null;

  try {
    const sessionPrivateKey = generatePrivateKey();
    const sessionSigner = privateKeyToAccount(sessionPrivateKey);

    const { session } = await createSessionAsync({
      session: {
        signer: sessionSigner.address,
        expiresAt: BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24),
        feeLimit: {
          limitType: LimitType.Lifetime,
          limit: parseEther("1"),
          period: BigInt(0),
        },
        callPolicies: DEFAULT_CALL_POLICIES,
        transferPolicies: [],
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
