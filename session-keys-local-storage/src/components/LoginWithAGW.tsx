"use client";

import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { useAccount } from "wagmi";
import styles from "./LoginWithAGW.module.css";

/**
 * LoginWithAGW Component
 *
 * This component renders a login button for Abstract Global Wallet,
 * following the integration pattern from the Abstract documentation.
 *
 * @see https://docs.abs.xyz/abstract-global-wallet/agw-react/native-integration#3-login-with-agw
 */
export default function LoginWithAGW() {
  const { login, logout } = useLoginWithAbstract();
  const { address, status } = useAccount();

  if (status === "connected" && address) {
    return (
      <div className={styles.connectedCard}>
        <div className={styles.connectedContent}>
          <div className={styles.textCenter}>
            <p className={styles.walletLabel}>
              Connected to Abstract Global Wallet
            </p>
            <p className={styles.address}>{address}</p>
            <p className={styles.explorerLink}>
              <a
                href={`https://explorer.testnet.abs.xyz/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                View on Explorer
              </a>
            </p>
          </div>
          <button className={styles.disconnectButton} onClick={logout}>
            <svg
              className={styles.icon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <button className={styles.connectButton} onClick={login}>
      <svg
        className={styles.icon}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Connect with Abstract
    </button>
  );
}
