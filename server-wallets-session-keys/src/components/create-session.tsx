"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { useCreateSession } from "@abstract-foundation/agw-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSessionConfig } from "@/lib/session-config";
import { saveSessionConfig } from "@/lib/session-storage";

interface CreateSessionProps {
  onSessionCreated: () => void;
}

/**
 * Shows the user the create session button and handles the creation of a new session key.
 * The session key is stored inside local storage of the browser.
 * Docs: https://docs.abs.xyz/abstract-global-wallet/agw-react/session-keys
 */
export function CreateSession({ onSessionCreated }: CreateSessionProps) {
  // Get the user's wallet address and connection status
  const { address, isConnected } = useAccount();

  // Create a new session key. Docs: https://docs.abs.xyz/abstract-global-wallet/agw-react/hooks/useCreateSession
  const { createSessionAsync, isPending, isError, error } = useCreateSession();

  // State to store the server wallet address
  const [serverWalletAddress, setServerWalletAddress] = useState<
    `0x${string}` | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the server wallet address by calling the /api/server-wallet/get route
  // We do this so we can create the session config that uses the server wallet address as the signer.
  useEffect(() => {
    async function fetchServerWalletAddress() {
      try {
        const response = await fetch("/api/server-wallet/get");
        const data = await response.json();

        if (data.address) {
          setServerWalletAddress(data.address as `0x${string}`);
        } else {
          console.error("Failed to fetch server wallet address:", data.error);
          toast("Failed to fetch server wallet address");
        }
      } catch (error) {
        console.error("Error fetching server wallet address:", error);
        toast("Error fetching server wallet address");
      } finally {
        setIsLoading(false);
      }
    }

    fetchServerWalletAddress();
  }, []);

  // if the user is not connected, don't show the component
  if (!isConnected) {
    return null;
  }

  // loading state
  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Session Key</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">Loading server wallet...</p>
        </CardContent>
      </Card>
    );
  }

  // error state
  if (!serverWalletAddress) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Session Key</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-red-500">
            Failed to load server wallet address
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleCreateSession = async () => {
    if (!address) return;

    try {
      // Create the session config and save it to local storage
      const sessionConfig = createSessionConfig(serverWalletAddress);
      saveSessionConfig(sessionConfig);

      // Create the session key with the config (that includes the server wallet address as the signer)
      const result = await createSessionAsync({
        session: sessionConfig,
      });

      if (result.session) {
        toast("Session created successfully");
        onSessionCreated();
      } else {
        toast("Failed to store session information");
      }
    } catch (err) {
      console.error("Error creating session:", err);
      toast("Failed to create session");
    }
  };

  return (
    <Card className="w-full max-w-md gap-3">
      <CardHeader>
        <CardTitle>Create Session Key</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          Create a new session that allows the Privy Server Wallet to execute
          NFT mint transactions on behalf of your AGW.
        </p>
        <Button
          onClick={handleCreateSession}
          disabled={isPending}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white hover:cursor-pointer"
        >
          {isPending ? "Creating..." : "Create Session Key"}
        </Button>
        {isError && (
          <p className="mt-2 text-sm text-red-500">
            Error: {error?.message || "Failed to create session"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
