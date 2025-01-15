import { useState } from "react";
import { useCreateSession } from "@abstract-foundation/agw-react";
import { LimitType, SessionConfig } from "@abstract-foundation/agw-client/sessions";
import { parseEther, toFunctionSelector, Account } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { getGeneralPaymasterInput } from "viem/zksync";

type CreateSessionProps = {
    onSessionCreated: (data: { session: SessionConfig; sessionSigner: Account }) => void;
};

export function CreateSession({ onSessionCreated }: CreateSessionProps) {
    const { createSessionAsync } = useCreateSession();
    const [isCreating, setIsCreating] = useState(false);

    async function handleCreateSession() {
        try {
            setIsCreating(true);
            const sessionSigner = privateKeyToAccount(generatePrivateKey());

            const { session } = await createSessionAsync({
                session: {
                    signer: sessionSigner.address,
                    expiresAt: BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24),
                    feeLimit: {
                        limitType: LimitType.Lifetime,
                        limit: parseEther("1"),
                        period: BigInt(0),
                    },
                    callPolicies: [
                        {
                            target: "0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA",
                            selector: toFunctionSelector("mint(address,uint256)"),
                            valueLimit: {
                                limitType: LimitType.Unlimited,
                                limit: BigInt(0),
                                period: BigInt(0),
                            },
                            maxValuePerUse: BigInt(0),
                            constraints: [],
                        }
                    ],
                    transferPolicies: [],
                },
                paymaster: "0x5407B5040dec3D339A9247f3654E59EEccbb6391",
                paymasterInput: getGeneralPaymasterInput({
                    innerInput: "0x",
                }),
            });

            onSessionCreated({ session, sessionSigner });
        } catch (error) {
            console.error("Failed to create session:", error);
        } finally {
            setIsCreating(false);
        }
    }

    return (
        <button
            className="rounded-full border border-solid transition-colors flex items-center justify-center text-white gap-2 text-sm h-10 px-5 font-[family-name:var(--font-roobert)] w-full sm:flex-1 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 border-transparent"
            onClick={handleCreateSession}
            disabled={isCreating}
        >
            {isCreating ? "Creating Session..." : "Create Session"}
        </button>
    );
} 