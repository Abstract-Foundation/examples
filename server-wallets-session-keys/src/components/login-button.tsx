"use client";

import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { Button } from "@/components/ui/button";
import { useAccount, useSignMessage } from "wagmi";
import { useEffect } from "react";
import { createSiweMessage } from "viem/siwe";
import { chain } from "@/const/chain";
import { toast } from "sonner";

interface LoginButtonProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

/**
 * A button that allows the user to login with their Abstract Wallet.
 * First, users connect their wallet and then SIWE to authenticate.
 * Docs: https://docs.abs.xyz/abstract-global-wallet/agw-react/hooks/useLoginWithAbstract
 */
export function LoginButton({
  isAuthenticated,
  setIsAuthenticated,
}: LoginButtonProps) {
  const { login } = useLoginWithAbstract();
  const { isConnected, status, address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const isLoading = status === "connecting" || status === "reconnecting";

  useEffect(() => {
    const checkAuthentication = async () => {
      const response = await fetch("/api/siwe/get-user");
      const data = await response.json();
      if (data.ok && data.user && data.user.isAuthenticated) {
        setIsAuthenticated(true);
      }
    };

    if (isConnected) {
      checkAuthentication();
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <Button
        onClick={login}
        disabled={isLoading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer transition-colors duration-200"
      >
        {isLoading ? "Connecting..." : "Connect with Abstract Wallet"}
      </Button>
    );
  }

  const handleSiweLogin = async () => {
    try {
      if (!address) {
        toast.error("No address found");
        return;
      }

      // Get nonce from server
      const nonceResponse = await fetch("/api/siwe/nonce");
      const nonce = await nonceResponse.text();

      // Create SIWE message
      const message = createSiweMessage({
        address: address,
        chainId: chain.id,
        domain: window.location.host,
        nonce: nonce,
        uri: window.location.origin,
        version: "1",
      });

      // Sign the message
      const signature = await signMessageAsync({
        message,
      });

      // Verify the signature
      const verifyRes = await fetch("/api/siwe/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, signature }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.ok) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("SIWE authentication error:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <Button
        onClick={handleSiweLogin}
        className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer transition-colors duration-200"
      >
        Sign In with Ethereum
      </Button>
    );
  }

  return null;
}
