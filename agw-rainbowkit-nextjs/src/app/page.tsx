"use client";

import Image from "next/image";
import {
  useLoginWithAbstract,
  useWriteContractSponsored,
} from "@abstract-foundation/agw-react";
import {
  useAccount,
  useSignMessage,
  useSignTypedData,
  useWaitForTransactionReceipt,
  useWriteContract,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";
import { getGeneralPaymasterInput } from "viem/zksync";
import {
  maxUint256,
  parseAbi,
  parseEther,
  parseUnits,
  zeroAddress,
} from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  const { logout } = useLoginWithAbstract();
  const { address, status, chainId } = useAccount();
  const { signMessage } = useSignMessage();
  const { signTypedData } = useSignTypedData();
  const { writeContract } = useWriteContract();
  const { sendTransaction } = useSendTransaction();
  const { switchChain } = useSwitchChain();
  const { writeContractSponsored, data: transactionHash } =
    useWriteContractSponsored();
  const { data: transactionReceipt } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  // Test addresses and contracts
  const testRecipient = "0xfE8f62b2ec3f6594499C94D02c7bE15394Ef53EE";
  const testToken = "0x3439153EB7AF838Ad19d56E1571FBD09333C2809";
  const testNFT = "0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA";
  const testSpender = "0x000000000000000000000000000000000000dEaD";

  return (
    <div className="relative grid grid-rows-[1fr_auto] min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-avenue-mono)] bg-black overflow-hidden">
      {/* Grids and aurora gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f0f_1px,transparent_1px),linear-gradient(to_bottom,#0f0f0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      <div className="absolute top-0 left-0 right-0 h-[70vh] bg-gradient-to-b from-[#00ff00] to-transparent opacity-15 blur-[100px]"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-[#00ff00] to-transparent opacity-10 blur-3xl"></div>

      {/* Main content */}
      <main className="relative flex flex-col items-center justify-center z-10 text-white text-center">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-4">
            <Image
              src="/abstract.svg"
              alt="Abstract logo"
              width={240}
              height={32}
              quality={100}
              priority
            />
            <span>🤝</span>
            <Image
              src="/rainbow.svg"
              alt="Rainbow logo"
              width={32}
              height={32}
              quality={100}
              priority
            />
          </div>
          <p className="text-md font-[family-name:var(--font-roobert)]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              src/app/page.tsx
            </code>
            .
          </p>

          <div className="flex justify-center w-full max-w-6xl">
            {status === "connected" ? (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 shadow-lg backdrop-blur-sm w-full max-h-[80vh] overflow-y-auto">
                <div className="flex flex-col gap-6">
                  {/* Header */}
                  <div className="text-center border-b border-white/10 pb-4">
                    <p className="text-lg font-medium font-[family-name:var(--font-roobert)] mb-2">
                      Cross-App Transaction Testing
                    </p>
                    <p className="text-xs text-gray-400 font-mono mb-3">
                      {address}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <a
                        href={`https://explorer.testnet.abs.xyz/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-400 hover:text-green-300 transition-colors font-[family-name:var(--font-roobert)]"
                      >
                        View on Explorer
                      </a>
                      <span className="text-gray-600">|</span>
                      <button
                        className="text-xs text-red-400 hover:text-red-300 transition-colors font-[family-name:var(--font-roobert)] bg-transparent border-none cursor-pointer p-0"
                        onClick={logout}
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>

                  {/* Transfer Transactions */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-green-400 font-[family-name:var(--font-roobert)]">
                      Transfer Transactions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        className="rounded-lg border border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-xs h-10 px-4 font-[family-name:var(--font-roobert)]"
                        onClick={() => {
                          sendTransaction({
                            to: testRecipient as `0x${string}`,
                            value: parseEther("0.001"),
                          });
                        }}
                      >
                        💸 ETH Transfer (0.001 ETH)
                      </button>
                      <button
                        className="rounded-lg border border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-xs h-10 px-4 font-[family-name:var(--font-roobert)]"
                        onClick={() => {
                          writeContract({
                            abi: parseAbi([
                              "function transfer(address,uint256) external returns (bool)",
                            ]),
                            address: testToken as `0x${string}`,
                            functionName: "transfer",
                            args: [
                              testRecipient as `0x${string}`,
                              parseUnits("100", 18),
                            ],
                          });
                        }}
                      >
                        🪙 Token Transfer (100 tokens)
                      </button>
                    </div>
                  </div>

                  {/* Token Approvals */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-yellow-400 font-[family-name:var(--font-roobert)]">
                      Token Approvals
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        className="rounded-lg border border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-xs h-10 px-4 font-[family-name:var(--font-roobert)]"
                        onClick={() => {
                          writeContract({
                            abi: parseAbi([
                              "function approve(address,uint256) external returns (bool)",
                            ]),
                            address: testToken as `0x${string}`,
                            functionName: "approve",
                            args: [testSpender as `0x${string}`, maxUint256],
                          });
                        }}
                      >
                        ✅ Infinite ERC-20 Approval
                      </button>
                      <button
                        className="rounded-lg border border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-xs h-10 px-4 font-[family-name:var(--font-roobert)]"
                        onClick={() => {
                          writeContract({
                            abi: parseAbi([
                              "function approve(address,uint256) external returns (bool)",
                            ]),
                            address: testToken as `0x${string}`,
                            functionName: "approve",
                            args: [
                              testSpender as `0x${string}`,
                              BigInt(1000000),
                            ],
                          });
                        }}
                      >
                        ✅ Limited ERC-20 Approval (1M)
                      </button>
                      <button
                        className="rounded-lg border border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-xs h-10 px-4 font-[family-name:var(--font-roobert)]"
                        onClick={() => {
                          writeContract({
                            abi: parseAbi([
                              "function approve(address,uint256) external returns (bool)",
                            ]),
                            address: testToken as `0x${string}`,
                            functionName: "approve",
                            args: [testSpender as `0x${string}`, BigInt(0)],
                          });
                        }}
                      >
                        ❌ Revoke ERC-20 Approval
                      </button>
                      <button
                        className="rounded-lg border border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-xs h-10 px-4 font-[family-name:var(--font-roobert)]"
                        onClick={() => {
                          writeContract({
                            abi: parseAbi([
                              "function setApprovalForAll(address,bool) external",
                            ]),
                            address: testNFT as `0x${string}`,
                            functionName: "setApprovalForAll",
                            args: [testSpender as `0x${string}`, true],
                          });
                        }}
                      >
                        ✅ NFT Approval (setApprovalForAll)
                      </button>
                    </div>
                  </div>

                  {/* NFT Transactions */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-purple-400 font-[family-name:var(--font-roobert)]">
                      NFT Transactions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        className="rounded-lg border border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-xs h-10 px-4 font-[family-name:var(--font-roobert)]"
                        onClick={() => {
                          writeContract({
                            abi: parseAbi([
                              "function safeTransferFrom(address,address,uint256) external",
                            ]),
                            address: testNFT as `0x${string}`,
                            functionName: "safeTransferFrom",
                            args: [
                              address!,
                              testRecipient as `0x${string}`,
                              BigInt(1),
                            ],
                          });
                        }}
                      >
                        🖼️ NFT Transfer (Token ID: 1)
                      </button>
                      <button
                        className="rounded-lg border border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-xs h-10 px-4 font-[family-name:var(--font-roobert)]"
                        onClick={() => {
                          writeContract({
                            abi: parseAbi([
                              "function safeBatchTransferFrom(address,address,uint256[],uint256[],bytes) external",
                            ]),
                            address: testNFT as `0x${string}`,
                            functionName: "safeBatchTransferFrom",
                            args: [
                              address!,
                              testRecipient as `0x${string}`,
                              [BigInt(1), BigInt(2)],
                              [BigInt(1), BigInt(1)],
                              "0x",
                            ],
                          });
                        }}
                      >
                        🖼️ Batch NFT Transfer
                      </button>
                    </div>
                  </div>

                  {/* Swap Transactions */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-blue-400 font-[family-name:var(--font-roobert)]">
                      Swap Transactions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        className="rounded-lg border border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-xs h-10 px-4 font-[family-name:var(--font-roobert)]"
                        onClick={() => {
                          // Example swap: approve token then swap
                          writeContract({
                            abi: parseAbi([
                              "function swapExactTokensForTokens(uint256,uint256,address[],address,uint256) external returns (uint256[])",
                            ]),
                            address:
                              "0x0000000000000000000000000000000000000000" as `0x${string}`, // This will fail, simulating a swap
                            functionName: "swapExactTokensForTokens",
                            args: [
                              parseUnits("100", 18),
                              BigInt(0),
                              [testToken, zeroAddress] as `0x${string}`[],
                              address!,
                              BigInt(Math.floor(Date.now() / 1000) + 3600),
                            ],
                          });
                        }}
                      >
                        🔄 Token Swap (DEX Router)
                      </button>
                    </div>
                  </div>

                  {/* Message Signing */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-cyan-400 font-[family-name:var(--font-roobert)]">
                      Message Signing
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        className="rounded-lg border border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-xs h-10 px-4 font-[family-name:var(--font-roobert)]"
                        onClick={() => {
                          signMessage({
                            message: "Hello, world! This is a test message.",
                          });
                        }}
                      >
                        ✍️ Sign Message
                      </button>
                      <button
                        className="rounded-lg border border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-xs h-10 px-4 font-[family-name:var(--font-roobert)]"
                        onClick={() => {
                          signTypedData({
                            domain: {
                              name: "Abstract",
                              version: "1",
                              chainId: chainId || 11155111,
                            },
                            types: {
                              Message: [
                                {
                                  name: "message",
                                  type: "string",
                                },
                                {
                                  name: "nonce",
                                  type: "uint256",
                                },
                              ],
                            },
                            primaryType: "Message",
                            message: {
                              message: "Hello, world!",
                              nonce: BigInt(1),
                            },
                          });
                        }}
                      >
                        ✍️ Sign Typed Data (EIP-712)
                      </button>
                    </div>
                  </div>

                  {/* Info Requests */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-pink-400 font-[family-name:var(--font-roobert)]">
                      Info Requests (abs.xyz)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        className="rounded-lg border border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-xs h-10 px-4 font-[family-name:var(--font-roobert)]"
                        onClick={() => {
                          signTypedData({
                            domain: {
                              name: "abs.xyz",
                              version: "1",
                            },
                            types: {
                              RequestData: [
                                {
                                  name: "discord",
                                  type: "bool",
                                },
                                {
                                  name: "email",
                                  type: "bool",
                                },
                                {
                                  name: "twitter",
                                  type: "bool",
                                },
                              ],
                            },
                            primaryType: "RequestData",
                            message: {
                              discord: true,
                              email: true,
                              twitter: true,
                            },
                          });
                        }}
                      >
                        📧 Request All Socials
                      </button>
                      <button
                        className="rounded-lg border border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-xs h-10 px-4 font-[family-name:var(--font-roobert)]"
                        onClick={() => {
                          signTypedData({
                            domain: {
                              name: "abs.xyz",
                              version: "1",
                            },
                            types: {
                              RequestData: [
                                {
                                  name: "discord",
                                  type: "bool",
                                },
                                {
                                  name: "email",
                                  type: "bool",
                                },
                                {
                                  name: "twitter",
                                  type: "bool",
                                },
                              ],
                            },
                            primaryType: "RequestData",
                            message: {
                              discord: false,
                              email: true,
                              twitter: false,
                            },
                          });
                        }}
                      >
                        📧 Request Email Only
                      </button>
                    </div>
                  </div>

                  {/* Contract Interactions */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-orange-400 font-[family-name:var(--font-roobert)]">
                      Contract Interactions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        className={`rounded-lg border border-solid transition-colors flex items-center justify-center text-white gap-2 text-xs h-10 px-4 font-[family-name:var(--font-roobert)]
                          ${
                            !writeContractSponsored
                              ? "bg-gray-500 cursor-not-allowed opacity-50 border-white/20"
                              : "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 border-transparent"
                          }`}
                        onClick={() =>
                          writeContractSponsored({
                            abi: parseAbi([
                              "function mint(address,uint256) external",
                            ]),
                            address: testNFT as `0x${string}`,
                            functionName: "mint",
                            args: [address!, BigInt(1)],
                            paymaster:
                              "0x5407B5040dec3D339A9247f3654E59EEccbb6391",
                            paymasterInput: getGeneralPaymasterInput({
                              innerInput: "0x",
                            }),
                          })
                        }
                        disabled={!writeContractSponsored}
                      >
                        ⚡ Sponsored Contract Call
                      </button>
                      <button
                        className="rounded-lg border border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-xs h-10 px-4 font-[family-name:var(--font-roobert)]"
                        onClick={() => {
                          writeContract({
                            abi: parseAbi([
                              "function transfer(address,uint256) external returns (bool)",
                            ]),
                            address: testToken as `0x${string}`,
                            functionName: "transfer",
                            args: [
                              testRecipient as `0x${string}`,
                              parseUnits("50", 18),
                            ],
                          });
                        }}
                      >
                        🔧 Generic Contract Call
                      </button>
                    </div>
                  </div>

                  {/* Network & Error Cases */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-red-400 font-[family-name:var(--font-roobert)]">
                      Network & Error Cases
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        className="rounded-lg border border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-xs h-10 px-4 font-[family-name:var(--font-roobert)]"
                        onClick={() => {
                          // Try to switch to a different chain (this will likely fail or prompt)
                          if (switchChain) {
                            switchChain({ chainId: 1 }); // Ethereum mainnet
                          }
                        }}
                      >
                        🔀 Network Switch Request
                      </button>
                      <button
                        className="rounded-lg border border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-xs h-10 px-4 font-[family-name:var(--font-roobert)]"
                        onClick={() => {
                          // Intentionally bad transaction that will fail simulation
                          writeContract({
                            abi: parseAbi([
                              "function transfer(address,uint256) external returns (bool)",
                            ]),
                            address: zeroAddress, // Invalid address
                            functionName: "transfer",
                            args: [
                              testRecipient as `0x${string}`,
                              parseUnits("100", 18),
                            ],
                          });
                        }}
                      >
                        ⚠️ Simulation Failed (Invalid Address)
                      </button>
                      <button
                        className="rounded-lg border border-white/20 transition-colors flex items-center justify-center bg-white/10 text-white gap-2 hover:bg-white/20 text-xs h-10 px-4 font-[family-name:var(--font-roobert)]"
                        onClick={() => {
                          // Transaction that will fail due to insufficient balance
                          sendTransaction({
                            to: testRecipient as `0x${string}`,
                            value: parseEther("1000000"), // Way too much ETH
                          });
                        }}
                      >
                        ❌ Failed Transaction (Insufficient Balance)
                      </button>
                    </div>
                  </div>

                  {/* Transaction Status */}
                  {!!transactionReceipt && (
                    <div className="border-t border-white/10 pt-4">
                      <a
                        href={`https://explorer.testnet.abs.xyz/tx/${transactionReceipt?.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center"
                      >
                        <p className="text-sm font-medium font-[family-name:var(--font-roobert)] mb-1">
                          Last Transaction Status:{" "}
                          {transactionReceipt?.status === "success"
                            ? "✅ Success"
                            : "❌ Failed"}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {transactionReceipt?.transactionHash?.slice(0, 10)}...
                          {transactionReceipt?.transactionHash?.slice(-8)}
                        </p>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : status === "reconnecting" || status === "connecting" ? (
              <div className="animate-spin">
                <Image src="/abs.svg" alt="Loading" width={24} height={24} />
              </div>
            ) : (
              <ConnectButton />
            )}
          </div>
        </div>
      </main>

      {/* Cards section */}
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
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122-2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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
