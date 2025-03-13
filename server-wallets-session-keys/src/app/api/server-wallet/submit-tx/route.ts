import { NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
import { createViemAccount } from "@privy-io/server-auth/viem";
import { checkRequiredEnvVars } from "@/lib/check-env";
import { parseAbi, type Address } from "viem";
import { chain } from "@/const/chain";
import { createSessionClient } from "@abstract-foundation/agw-client/sessions";
import { deserializeWithBigInt } from "@/lib/session-storage";
import { SessionData } from "../../siwe/nonce/route";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { ironOptions } from "@/types/ironOptions";

type ServerWalletResponse = {
  hash?: string;
  error?: string;
};

/**
 * Submit a transaction from a session key using the Privy server wallet as the signer.
 * Docs: https://docs.privy.io/guide/server-wallets/usage/ethereum#viem
 * @returns {Promise<NextResponse<ServerWalletResponse>>} An object containing the transaction hash or error.
 */
export async function POST(
  request: Request
): Promise<NextResponse<ServerWalletResponse>> {
  try {
    checkRequiredEnvVars();

    // Session here is not related to our session keys.
    // This is just related to auth / sign in with Ethereum.
    // We implement SIWE auth to get the AGW on the server side.
    const session = await getIronSession<SessionData>(
      await cookies(),
      ironOptions
    );
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!session.address) {
      return NextResponse.json({ error: "No address found" }, { status: 401 });
    }

    // Here: grab the authenticated user's AGW wallet address
    const agwAddress = session.address;

    // Get the session key config from the request body
    const body = await request.json();
    const { sessionConfig: rawSessionConfig } = body;
    const sessionConfig = deserializeWithBigInt(rawSessionConfig);

    // Initialize Privy client using environment variables
    const privy = new PrivyClient(
      process.env.PRIVY_APP_ID!,
      process.env.PRIVY_APP_SECRET!
    );

    // Create a viem account instance for the server wallet
    const account = await createViemAccount({
      walletId: process.env.PRIVY_SERVER_WALLET_ID!,
      address: process.env.PRIVY_SERVER_WALLET_ADDRESS as Address,
      privy,
    });

    // Initialize the AGW Session client to send transactions from the server wallet using the session key
    const agwSessionClient = createSessionClient({
      account: agwAddress, // The AGW wallet address to send the transaction from
      chain,
      signer: account, // The Privy server wallet as the signer
      session: sessionConfig, // The session configuration loaded from local storage
    });

    // Use the session client to make transactions. e.g. mint NFT the AGW wallet address
    const hash = await agwSessionClient.writeContract({
      account: agwAddress, // The AGW wallet address to send the transaction from
      chain,
      address: "0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA", // The contract address to send the transaction to
      abi: parseAbi(["function mint(address,uint256) external"]), // The contract ABI
      functionName: "mint", // The contract function to call
      args: [agwAddress, BigInt(1)], // The function arguments (e.g. mint 1 NFT to the AGW wallet address)
    });

    return NextResponse.json({
      hash,
    });
  } catch (error) {
    console.error("Error submitting transaction:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
