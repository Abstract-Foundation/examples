import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData } from "../nonce/route";
import { chain } from "@/const/chain";
import { ironOptions } from "@/types/ironOptions";

/**
 * Sign in with Ethereum - Get the currently authenticated user information.
 * @returns
 */
export async function GET() {
  try {
    // The "session" here is not related to our session keys.
    // This is just related to auth / sign in with Ethereum.
    const session = await getIronSession<SessionData>(
      await cookies(),
      ironOptions
    );

    if (!session.isAuthenticated || !session.siweMessage) {
      return NextResponse.json(
        { ok: false, message: "No user session found." },
        { status: 401 }
      );
    }

    if (
      session.siweMessage.expirationTime &&
      parseInt(session.siweMessage.expirationTime) < Date.now()
    ) {
      return NextResponse.json(
        { ok: false, message: "SIWE session expired." },
        { status: 401 }
      );
    }

    if (session.siweMessage.chainId !== chain.id) {
      return NextResponse.json(
        { ok: false, message: "Invalid chain." },
        { status: 401 }
      );
    }

    // Return the SIWE session data
    return NextResponse.json({
      ok: true,
      user: {
        isAuthenticated: session.isAuthenticated,
        address: session.address,
        siweMessage: session.siweMessage,
      },
    });
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json({ ok: false });
  }
}
