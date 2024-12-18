"use client";

import Image from "next/image";
import {
  useAbstractClient,
  useLoginWithAbstract,
} from "@abstract-foundation/agw-react";
import {
  useAccount,
} from "wagmi";
import { getGeneralPaymasterInput } from "viem/zksync";
import { toFunctionSelector, parseEther } from "viem";
import { parseAbi, type Account } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import {
  LimitType,
  LimitZero,
  SessionConfig,
} from "@abstract-foundation/agw-client/sessions";
import { abstractTestnet } from "wagmi/chains";
import { useState, useMemo, useCallback, useEffect } from "react";
import { replaceBigInts } from "@/utils/replaceBigInts";
import { Hash } from "crypto";

export default function Home() {
  const { login, logout } = useLoginWithAbstract();
  const { address, status } = useAccount();
  const { data: client } = useAbstractClient();

  const [transactionHashes, setTransactionHashes] = useState<Hash[]>([]);

  const [session, setSessionState] = useState<SessionConfig | undefined>();

  const addTransactionHash = (hash: Hash) => {
    setTransactionHashes((existing) => {
      return [...existing, hash];
    });
  };

  const accountKey = useMemo(() => {
    let key = localStorage.getItem("agw.sessions.accountKey");
    if (!key) {
      key = generatePrivateKey();
      localStorage.setItem("agw.sessions.accountKey", key);
    }
    return key;
  }, []);

  const sessionSigner = useMemo(() => {
    if (accountKey) {
      return privateKeyToAccount(accountKey as `0x${string}`);
    }
    return undefined;
  }, [accountKey]);

  const setSession = useCallback((session: SessionConfig | undefined) => {
    if (session) {
      localStorage.setItem(
        `agw.sessions.session.${address}`,
        JSON.stringify(replaceBigInts(session, (value) => value.toString()))
      );
    } else {
      localStorage.removeItem(`agw.sessions.session.${address}`);
    }
    setSessionState(session);
  }, [address, setSessionState]);

  useEffect(() => {
    const storedSession = localStorage.getItem(`agw.sessions.session.${address}`);
    if (storedSession) {
      setSessionState(JSON.parse(storedSession));
    } else {
      setSessionState(undefined);
    }
  }, [address]);

  return (
    <div className="relative grid grid-rows-[1fr_auto] min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-avenue-mono)] bg-black overflow-hidden">
      {/* Grids and aurora gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f0f_1px,transparent_1px),linear-gradient(to_bottom,#0f0f0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      <div className="absolute top-0 left-0 right-0 h-[70vh] bg-gradient-to-b from-[#00ff00] to-transparent opacity-15 blur-[100px]"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-[#00ff00] to-transparent opacity-10 blur-3xl"></div>

      {/* Main content */}
      <main className="relative flex flex-col items-center justify-center z-10 text-white text-center">
        <div className="flex flex-col items-center gap-8">
          <Image
            src="/abstract.svg"
            alt="Abstract logo"
            width={240}
            height={32}
            quality={100}
            priority
          />
          <p className="text-md font-[family-name:var(--font-roobert)]">
            Get started by editing{" "}
            <code className="bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              src/app/page.tsx
            </code>
            .
          </p>

          <div className="flex justify-center w-full">
            {status === "connected" ? (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 shadow-lg backdrop-blur-sm w-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm sm:text-base font-medium font-[family-name:var(--font-roobert)] mb-1">
                      Connected to Abstract Global Wallet
                    </p>
                    <p className="text-xs text-gray-400 font-mono break-all">
                      {address}
                    </p>
                    <p className="text-sm sm:text-base font-medium font-[family-name:var(--font-roobert)] mb-1">
                      <a
                        href={`https://explorer.testnet.abs.xyz/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Explorer
                      </a>
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <button
                      className="rounded-full border border-solid border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-sm h-10 px-5 font-[family-name:var(--font-roobert)] w-full sm:flex-1"
                      onClick={logout}
                    >
                      <svg
                        className="w-4 h-4"
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
                    {session === undefined ? (
                      <button
                        className={`w-full rounded-full border border-solid transition-colors flex items-center justify-center text-white gap-2 text-sm h-10 px-5 font-[family-name:var(--font-roobert)] sm:flex-2
                        bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 border-transparent`}
                        onClick={async () => {
                          if (!client || !sessionSigner) return;

                          const { session: newSession } =
                            await client.createSession({
                              session: {
                                signer:  sessionSigner.address,
                                
                                  expiresAt: BigInt(
                                    Math.floor(Date.now() / 1000) + 60 * 60 * 24
                                  ),
                                  feeLimit: {
                                    limitType: LimitType.Lifetime,
                                    limit: parseEther("1"),
                                    period: BigInt(0),
                                  },
                                  callPolicies: [
                                    {
                                      target:
                                        "0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA",
                                      selector: toFunctionSelector(
                                        "mint(address,uint256)"
                                      ),
                                      valueLimit: LimitZero,
                                      maxValuePerUse: BigInt(0),
                                      constraints: [],
                                    },
                                  ],
                                  transferPolicies: [],
                                },
                              
                            });

                          setSession(newSession);
                        }}
                      >
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <span className="w-full text-center">
                          Create Session
                        </span>
                      </button>
                    ) : (
                      <button
                        className={`rounded-full border border-solid transition-colors flex items-center justify-center text-white gap-2 text-sm h-10 px-5 font-[family-name:var(--font-roobert)] w-full sm:flex-1
                        bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 border-transparent`}
                        onClick={async () => {
                          if (!client || !sessionSigner) return;

                          const sessionClient = client.toSessionClient(
                            sessionSigner as Account,
                            session
                          );

                          try {
                            const tx = await sessionClient?.writeContract({
                              account: sessionClient.account,
                              chain: abstractTestnet,
                              abi: parseAbi([
                                "function mint(address,uint256) external",
                              ]),
                              address:
                                "0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA",
                              functionName: "mint",
                              args: [address, BigInt(1)],
                              paymaster:
                                "0x5407B5040dec3D339A9247f3654E59EEccbb6391",
                              paymasterInput: getGeneralPaymasterInput({
                                innerInput: "0x",
                              }),
                            });
                            addTransactionHash(tx);
                            console.log("transaction", tx);
                          } catch (e) {
                            console.error("error", e);
                          }
                        }}
                      >
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <span className="w-full text-center">Mint NFT</span>
                      </button>
                    )}
                  </div>
                  {transactionHashes.length > 0 &&
                    transactionHashes.map((hash) => (
                      <div key={hash}>
                        <a
                          href={`https://explorer.testnet.abs.xyz/tx/${hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <p className="text-xs text-gray-400 font-mono">
                            {hash.slice(0, 8)}
                            ...
                            {hash.slice(-6)}
                          </p>
                        </a>
                      </div>
                    ))}
                </div>
              </div>
            ) : status === "reconnecting" || status === "connecting" ? (
              <div
                id="loading-spinner-container"
                className="flex items-center justify-center w-10 h-10"
              >
                <div id="loading-spinner" className="animate-spin">
                  <Image src="/abs.svg" alt="Loading" width={24} height={24} />
                </div>
              </div>
            ) : (
              <button
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] hover:text-white dark:hover:bg-[#e0e0e0] dark:hover:text-black text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 font-[family-name:var(--font-roobert)]"
                onClick={login}
              >
                <Image
                  className="dark:invert"
                  src="/abs.svg"
                  alt="Abstract logomark"
                  width={20}
                  height={20}
                  style={{ filter: "brightness(0)" }}
                />
                Sign in with Abstract
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Updated cards section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mx-auto mt-8 font-[family-name:var(--font-roobert)]">
        <a
          href="https://docs.abs.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all h-full text-center backdrop-blur-sm"
        >
          <svg
            className="w-6 h-6 mb-2 opacity-70"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2 opacity-90">
            Documentation
          </h3>
          <p className="text-sm opacity-70">Explore our developer docs.</p>
        </a>

        <a
          href="https://github.com/Abstract-Foundation/examples"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all h-full text-center backdrop-blur-sm"
        >
          <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.42 22 12c0-5.523-4.477-10-10-10z"
            />
          </svg>
          <h3 className="text-lg font-semibold mb-2 opacity-90">
            GitHub Examples
          </h3>
          <p className="text-sm opacity-70">
            View our example repos on GitHub.
          </p>
        </a>

        <a
          href="https://youtube.com/@AbstractBlockchain"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all h-full text-center backdrop-blur-sm"
        >
          <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2 opacity-90">
            YouTube Channel
          </h3>
          <p className="text-sm opacity-70">
            Watch our video tutorials on YouTube.
          </p>
        </a>
      </div>
    </div>
  );
}
