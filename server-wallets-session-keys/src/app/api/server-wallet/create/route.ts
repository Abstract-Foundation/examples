import { NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
import { checkRequiredEnvVars } from "@/lib/check-env";

type ServerWalletResponse = {
  walletId: string;
  address: string;
};

/**
 * Create a new Privy server wallet to use as the signer for session keys.
 * We call this API a single time to generate a Privy server wallet ID and address.
 * We take these values and store them in the environment variables (or a database for example)
 * Docs: https://docs.privy.io/guide/server-wallets/create/
 * @returns {Promise<NextResponse<ServerWalletResponse>>} An object containing the walletId, wallet address.
 */
export async function GET(): Promise<NextResponse<ServerWalletResponse>> {
  checkRequiredEnvVars(["PRIVY_APP_ID", "PRIVY_APP_SECRET"]);

  // Initialize Privy client using environment variables
  const privy = new PrivyClient(
    process.env.PRIVY_APP_ID!,
    process.env.PRIVY_APP_SECRET!
  );

  // Create a server wallet using Privy's API
  const { id: walletId, address } = await privy.walletApi.create({
    chainType: "ethereum",
  });

  //
  console.log(`✅ Server wallet created. 
    
Store the following values in your environment variables or datababase:
  PRIVY_SERVER_WALLET_ID: ${walletId}
  PRIVY_SERVER_WALLET_ADDRESS: ${address}`);

  return NextResponse.json({
    walletId,
    address,
  });
}
