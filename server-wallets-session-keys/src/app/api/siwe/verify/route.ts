import { NextRequest, NextResponse } from "next/server";
import { SiweMessage } from "siwe";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData } from "../nonce/route";
import { createPublicClient, http } from "viem";
import { chain } from "@/const/chain";
import { ironOptions } from "@/types/ironOptions";

export async function POST(request: NextRequest) {
  try {
    const { message, signature } = await request.json();

    // The "session" here is not related to our session keys.
    // This is just related to auth / sign in with Ethereum.
    const session = await getIronSession<SessionData>(
      await cookies(),
      ironOptions
    );

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    try {
      // Create and verify the SIWE message
      const valid = await publicClient.verifySiweMessage({
        message,
        signature,
        nonce: session.nonce,
      });

      // If verification is successful, update the auth state
      if (valid) {
        const siweMessage = new SiweMessage(message);
        session.isAuthenticated = true;
        session.address = siweMessage.address as `0x${string}`;
        session.siweMessage = siweMessage;
        await session.save();
      }

      if (!valid) {
        return NextResponse.json(
          { ok: false, message: "Invalid signature." },
          { status: 422 }
        );
      }
    } catch (error) {
      console.error("Error verifying SIWE message:", error);
      return NextResponse.json(
        { ok: false, message: "Error verifying SIWE message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Return failure response without exposing error details
    console.error("Error verifying SIWE message:", error);
    return NextResponse.json({ ok: false });
  }
}
