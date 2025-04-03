import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { abstractTestnet } from "viem/chains";

export async function POST(request: NextRequest) {
    try {
        const { message, signature, expectedAddress } = await request.json();

        if (!message || !signature || !expectedAddress) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create a public client to verify the message
        const publicClient = createPublicClient({
            chain: abstractTestnet,
            transport: http(),
        });

        // Verify the message
        const isValid = await publicClient.verifyMessage({
            address: expectedAddress,
            message,
            signature,
        });

        return NextResponse.json({ isValid });
    } catch (error) {
        console.error("Error verifying message:", error);
        return NextResponse.json(
            { error: "Failed to verify message" },
            { status: 500 }
        );
    }
} 