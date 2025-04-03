import React, { useState, useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";

export function SignMessage() {
    const { address } = useAccount();
    const [message, setMessage] = useState("Hello, Abstract!");
    const [verificationResult, setVerificationResult] = useState<{
        isValid?: boolean;
        error?: string;
    } | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const {
        signMessage,
        data: signature,
        isPending,
        reset,
    } = useSignMessage();

    const hasSigned = !!signature;

    // Auto-verify when signature is available
    useEffect(() => {
        if (signature && address) {
            verifySignature();
        }
    }, [signature, address]);

    const handleSignMessage = () => {
        if (!address) return;
        reset();
        setVerificationResult(null);
        signMessage({ message });
    };

    const verifySignature = async () => {
        if (!signature || !address) return;

        setIsVerifying(true);
        setVerificationResult(null);

        try {
            const response = await fetch("/api/verify-message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message,
                    signature,
                    expectedAddress: address,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to verify signature");
            }

            setVerificationResult({ isValid: data.isValid });
        } catch (error) {
            setVerificationResult({
                error: error instanceof Error ? error.message : "Verification failed",
            });
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="flex flex-col w-full gap-4">
            <div className="w-full">
                <label
                    htmlFor="message-input"
                    className="block text-sm font-medium font-[family-name:var(--font-roobert)] text-gray-200 mb-2"
                >
                    Enter message to sign with EIP-1271
                </label>
                <input
                    id="message-input"
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter a message to sign"
                    className="rounded-md bg-white/10 border border-white/20 transition-colors text-white w-full px-3 py-2 font-[family-name:var(--font-roobert)] focus:outline-none focus:ring-2 focus:ring-green-400"
                    disabled={isPending || hasSigned}
                />
            </div>

            <button
                className={`rounded-full border border-solid transition-colors flex items-center justify-center text-white gap-2 text-sm h-10 px-5 font-[family-name:var(--font-roobert)] w-full
          ${isPending || (hasSigned && isVerifying)
                        ? "bg-gray-500 cursor-not-allowed opacity-50"
                        : hasSigned
                            ? verificationResult?.isValid
                                ? "bg-gradient-to-r from-green-500 to-green-700 border-transparent"
                                : "bg-gradient-to-r from-red-500 to-red-700 border-transparent"
                            : "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 hover:cursor-pointer border-transparent"
                    }`}
                onClick={handleSignMessage}
                disabled={!address || isPending || (hasSigned && isVerifying)}
            >
                {hasSigned ? (
                    <>
                        {isVerifying ? (
                            <>
                                <svg
                                    className="w-4 h-4 animate-spin"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                <span className="w-full text-center">Verifying Signature...</span>
                            </>
                        ) : (
                            <>
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
                                        d={verificationResult?.isValid
                                            ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"}
                                    />
                                </svg>
                                <span className="w-full text-center">
                                    {verificationResult?.isValid
                                        ? "Signature Verified"
                                        : "Verification Failed"}
                                </span>
                            </>
                        )}
                    </>
                ) : (
                    <>
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
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                        </svg>
                        <span className="w-full text-center">Sign Message</span>
                    </>
                )}
            </button>

            {hasSigned && (
                <div className="mt-2 p-4 bg-white/5 border border-white/10 rounded-lg text-left w-full">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium font-[family-name:var(--font-roobert)]">
                            Signature:
                        </p>
                        <p className="text-xs font-mono break-all text-green-300">{signature}</p>

                        {verificationResult && !isVerifying && (
                            <div className="mt-2 p-2 rounded-md bg-white/5">
                                <p className="text-xs font-medium font-[family-name:var(--font-roobert)] flex items-center">
                                    Status:
                                    <span className={`ml-2 ${verificationResult.isValid ? "text-green-400" : "text-red-400"}`}>
                                        {verificationResult.isValid ? "Valid ✅" : "Invalid ❌"}
                                    </span>
                                </p>
                                {verificationResult.error && (
                                    <p className="text-xs text-red-300 mt-1">{verificationResult.error}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 