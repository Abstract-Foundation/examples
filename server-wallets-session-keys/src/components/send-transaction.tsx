"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  clearSessionConfig,
  getSessionConfig,
  serializeWithBigInt,
} from "@/lib/session-storage";
import { toast } from "sonner";
import Link from "next/link";
import { chain } from "@/const/chain";
import { Separator } from "./ui/separator";

interface SendTransactionProps {
  onSessionReset: () => void;
}

/**
 * Component to allow the user to send a transaction using the session key.
 * We call the /api/server-wallet/submit-tx route to send the transaction
 * and provide the agw address + session config.
 */
export function SendTransaction({ onSessionReset }: SendTransactionProps) {
  // Get the user's wallet address and connection status
  const { address, isConnected } = useAccount();

  // State to store the transaction hash and loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hash, setHash] = useState<string | null>(null);

  // If the user is not connected, don't show the component
  if (!isConnected || !address) {
    return null;
  }

  /**
   * Send a transaction using the session key with the Privy server wallet as the signer.
   */
  async function handleSendTransaction() {
    setIsSubmitting(true);
    try {
      // Get the session config from local storage
      const sessionConfig = getSessionConfig();

      if (!sessionConfig) {
        toast.error("No valid session found");
        onSessionReset();
        return;
      }

      // Call the /api/server-wallet/submit-tx route to send the transaction
      // Provide the agw address + session config in the body
      const response = await fetch("/api/server-wallet/submit-tx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionConfig: serializeWithBigInt(sessionConfig),
        }),
      });

      // Get the response from the server
      const data = await response.json();

      // If the transaction is successful, set the transaction hash and show a success toast
      if (data.hash) {
        setHash(data.hash);
        toast("Transaction sent successfully!");
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error sending transaction:", error);
      toast.error("Failed to send transaction");
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Reset the session key and show a success toast
   */
  function handleResetSession() {
    clearSessionConfig();
    onSessionReset();
    toast("Session reset successfully");
  }

  return (
    <Card className="w-full max-w-md gap-3">
      <CardHeader>
        <CardTitle>Send Transaction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleSendTransaction}
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mb-0 cursor-pointer"
        >
          {isSubmitting ? "Sending..." : "Mint NFT using Session Key"}
        </Button>
        <p className="text-xs text-gray-500 mt-2 mb-0">
          This transaction will be sent using the session key you created.
        </p>

        {hash && (
          <Link
            href={chain.blockExplorers.default.url + "/tx/" + hash}
            target="_blank"
            className="text-xs text-blue-500 underline"
          >
            View transaction on {chain.blockExplorers.default.name} ↗
          </Link>
        )}

        <Separator className="my-4" />

        <Button
          onClick={handleResetSession}
          variant="outline"
          className="w-full  cursor-pointer"
        >
          Reset Session
        </Button>

        <p className="text-xs text-gray-500 ">
          This transaction will be sent using the session key you created.
        </p>
      </CardContent>
    </Card>
  );
}
