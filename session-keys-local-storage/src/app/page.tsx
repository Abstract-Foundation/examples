"use client";

import { useState, useEffect } from "react";
import { useAbstractSession } from "@/hooks/useAbstractSession";
import { useAccount } from "wagmi";
import styles from "./page.module.css";
import LoginWithAGW from "@/components/LoginWithAGW";
import chain from "@/config/chain";

/**
 * Home Component
 *
 * This is a demo application that showcases how to use Abstract Global Wallet session keys
 * with local storage encryption. It demonstrates:
 *
 * 1. Creating and storing session keys
 * 2. Retrieving session keys from encrypted local storage
 * 3. Validating session keys against the blockchain
 * 4. Clearing stored session keys from local storage
 *
 * The demo provides a simple UI to interact with these functions and displays session data
 * when available.
 */
export default function Home() {
  const { address, isConnected } = useAccount();
  const { getStoredSession, createAndStoreSession, clearStoredSession } =
    useAbstractSession(chain);

  const [sessionData, setSessionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  // Check for an existing session when the component mounts or wallet connects
  useEffect(() => {
    if (isConnected) {
      checkForExistingSession();
    } else {
      setSessionData(null);
      setStatusMessage(
        "Please connect your Abstract Global Wallet to use session keys"
      );
    }
  }, [isConnected]);

  /**
   * Checks if there's an existing session stored in local storage
   */
  const checkForExistingSession = async () => {
    setIsLoading(true);
    setStatusMessage("Checking for existing session...");

    try {
      const session = await getStoredSession();
      if (session) {
        setSessionData(session);
        setStatusMessage("Found existing valid session");
      } else {
        setSessionData(null);
        setStatusMessage("No valid session found");
      }
    } catch (error) {
      console.error("Error checking for session:", error);
      setStatusMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Creates a new session and stores it in encrypted local storage
   */
  const handleCreateSession = async () => {
    setIsLoading(true);
    setStatusMessage("Creating new session...");

    try {
      const session = await createAndStoreSession();
      if (session) {
        setSessionData(session);
        setStatusMessage("New session created and stored successfully");
      } else {
        setStatusMessage("Failed to create session");
      }
    } catch (error) {
      console.error("Error creating session:", error);
      setStatusMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clears the stored session from local storage
   */
  const handleClearSession = () => {
    try {
      clearStoredSession();
      setSessionData(null);
      setStatusMessage("Session cleared from local storage");
    } catch (error) {
      console.error("Error clearing session:", error);
      setStatusMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  /**
   * Creates a nicely formatted display of the session data
   */
  const renderSessionData = () => {
    if (!sessionData) return null;

    return (
      <div className={styles.sessionData}>
        <h3>Current Session Data</h3>
        <div className={styles.dataCard}>
          <div className={styles.dataField}>
            <span className={styles.fieldLabel}>Session Signer:</span>
            <span className={styles.fieldValue}>
              {sessionData.session.signer}
            </span>
          </div>
          <div className={styles.dataField}>
            <span className={styles.fieldLabel}>Expires At:</span>
            <span className={styles.fieldValue}>
              {new Date(
                Number(sessionData.session.expiresAt) * 1000
              ).toLocaleString()}
            </span>
          </div>
          <div className={styles.dataField}>
            <span className={styles.fieldLabel}>Private Key:</span>
            <span className={styles.fieldValue}>
              {sessionData.privateKey.slice(0, 6)}...
              {sessionData.privateKey.slice(-4)} (Securely encrypted in storage)
            </span>
          </div>
          <div className={styles.dataField}>
            <span className={styles.fieldLabel}>Call Policies:</span>
            <span className={styles.fieldValue}>
              {sessionData.session.callPolicies.length} policies defined
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Abstract Session Keys Demo</h1>
        <p className={styles.description}>
          This demo showcases how to securely manage Abstract Global Wallet
          session keys in local storage
        </p>

        {isConnected ? (
          <>
            <div className={styles.walletInfo}>
              <p>
                Connected Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.button}
                onClick={checkForExistingSession}
                disabled={isLoading}
              >
                Check for Existing Session
              </button>

              <button
                className={styles.button}
                onClick={handleCreateSession}
                disabled={isLoading}
              >
                Create New Session
              </button>

              <button
                className={styles.button}
                onClick={handleClearSession}
                disabled={isLoading || !sessionData}
              >
                Clear Session
              </button>
            </div>

            <div className={styles.statusContainer}>
              <p className={styles.status}>
                {isLoading ? "Loading..." : statusMessage}
              </p>
            </div>

            {renderSessionData()}

            <div className={styles.explainer}>
              <h2>How It Works</h2>
              <ol>
                <li>
                  <strong>Check for Existing Session:</strong> Retrieves and
                  validates any stored session from encrypted local storage.
                </li>
                <li>
                  <strong>Create New Session:</strong> Generates a new session
                  key, sets up permissions, and stores it securely in local
                  storage.
                </li>
                <li>
                  <strong>Clear Session:</strong> Removes the encrypted session
                  data from local storage.
                </li>
              </ol>
            </div>
          </>
        ) : (
          <div className={styles.connectPrompt}>
            <p>Please connect your Abstract Global Wallet to use this demo</p>
            <div className={styles.loginButtonContainer}>
              <LoginWithAGW />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
