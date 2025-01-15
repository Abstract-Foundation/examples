import { useState } from "react";
import { useAbstractClient } from "@abstract-foundation/agw-react";
import { parseAbi } from "viem";
import { abstractTestnet } from "viem/chains";
import { getGeneralPaymasterInput } from "viem/zksync";
import Link from "next/link";
import { Account } from "viem";
import { SessionConfig } from "@abstract-foundation/agw-client/sessions";

type MintNftProps = {
    sessionSigner: Account;
    session: SessionConfig;
};

export function MintNft({ sessionSigner, session }: MintNftProps) {
    const { data: agwClient } = useAbstractClient();
    const [txHashes, setTxHashes] = useState<string[]>([]);
    const [isMinting, setIsMinting] = useState(false);

    async function handleMint() {
        if (!agwClient || !sessionSigner || !session) return;

        try {
            setIsMinting(true);
            const sessionClient = agwClient.toSessionClient(sessionSigner, session);

            const hash = await sessionClient?.writeContract({
                account: sessionClient.account,
                chain: abstractTestnet,
                abi: parseAbi(["function mint(address,uint256) external"]),
                address: "0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA",
                functionName: "mint",
                args: [sessionClient.account.address, BigInt(1)],
                paymaster: "0x5407B5040dec3D339A9247f3654E59EEccbb6391",
                paymasterInput: getGeneralPaymasterInput({
                    innerInput: "0x",
                }),
            });

            setTxHashes((prev) => [...prev, hash]);
        } catch (error) {
            console.error("Failed to mint:", error);
        } finally {
            setIsMinting(false);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <button
                className="!h-11 min-h-[44px] rounded-full border border-solid transition-colors flex items-center justify-center text-white gap-2 text-sm px-5 font-[family-name:var(--font-roobert)] w-full sm:flex-1 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 border-transparent"
                onClick={handleMint}
                disabled={isMinting}
            >
                {isMinting ? "Minting..." : "Mint NFT"}
            </button>

            {txHashes.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold">Transaction History</h3>
                    {txHashes.map((hash, index) => (
                        <Link
                            key={index}
                            href={`https://sepolia.abscan.org/tx/${hash}`}
                            target="_blank"
                            className="text-sm text-blue-500 hover:text-blue-600"
                        >
                            View Transaction {index + 1} on Abscan ↗
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
} 