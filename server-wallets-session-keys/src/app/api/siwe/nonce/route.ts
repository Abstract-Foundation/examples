import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateNonce } from "siwe";
import { getIronSession } from "iron-session";
import { SiweMessage } from "siwe";
import { ironOptions } from "@/types/ironOptions";

export interface SessionData {
  nonce?: string;
  isAuthenticated?: boolean;
  address?: `0x${string}`;
  siweMessage?: SiweMessage;
}

/**
 * Sign in with Ethereum - Generate a unique nonce for the SIWE message.
 */
export async function GET() {
  // The "session" here is not related to our session keys.
  // This is just related to auth / sign in with Ethereum.
  const session = await getIronSession<SessionData>(
    await cookies(),
    ironOptions
  );

  // Generate and store the nonce
  const nonce = generateNonce();
  session.nonce = nonce;
  await session.save();

  // Return the nonce as plain text
  return new NextResponse(nonce);
}
