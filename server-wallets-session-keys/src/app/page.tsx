"use client";

import { useEffect, useState } from "react";
import { LoginButton } from "@/components/login-button";
import { CreateSession } from "@/components/create-session";
import { SendTransaction } from "@/components/send-transaction";
import { hasValidSession } from "@/lib/session-storage";

export default function Home() {
  const [hasSession, setHasSession] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Listen for changes in the session key value in localStorage
  useEffect(() => {
    const checkSession = () => {
      setHasSession(hasValidSession());
    };
    checkSession();

    // Listen for storage events (in case session is created in another tab)
    window.addEventListener("storage", checkSession);

    return () => {
      window.removeEventListener("storage", checkSession);
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Abstract Global Wallet with Session Keys
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Use Privy Server Wallets as a signer for Abstract Global Wallet
            session keys.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <LoginButton
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
          />

          <div className="w-full max-w-md">
            {isAuthenticated &&
              (hasSession ? (
                <SendTransaction onSessionReset={() => setHasSession(false)} />
              ) : (
                <CreateSession onSessionCreated={() => setHasSession(true)} />
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
