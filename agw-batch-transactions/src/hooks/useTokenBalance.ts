import { tokenAddress } from "@/app/constants";
import { erc20Abi } from "viem";
import { useAccount, useReadContract, useWatchContractEvent } from "wagmi";
import { useEffect, useState } from "react";

interface TransferEvent {
    args: {
        from: `0x${string}`;
        to: `0x${string}`;
        value: bigint;
    };
}

export const useTokenBalance = () => {
    const { address } = useAccount();
    const [balance, setBalance] = useState<bigint | undefined>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    
    const { data: initialBalance } = useReadContract({ 
        abi: erc20Abi, 
        address: tokenAddress, 
        functionName: "balanceOf", 
        args: [address!], 
        query: {
            enabled: address !== undefined,
        }
    });

    // Update balance when initial balance changes
    useEffect(() => {
        if (initialBalance) {
            setBalance(initialBalance);
            setIsLoading(false);
        }
    }, [initialBalance]);

    // Watch for Transfer events where the user is either sender or receiver
    useWatchContractEvent({
        address: tokenAddress,
        abi: erc20Abi,
        eventName: "Transfer",
        args: {
            from: address,
        },
        onLogs: (logs) => {
            console.log("Transfer event from", logs);
            const event = logs[0] as TransferEvent;
            if (!event?.args?.value || !balance) return;
            
            setBalance(balance - event.args.value);
        },
    });

    useWatchContractEvent({
        address: tokenAddress,
        abi: erc20Abi,
        eventName: "Transfer",
        args: {
            to: address,
        },
        onLogs: (logs) => {
            console.log("Transfer event to", logs);
            const event = logs[0] as TransferEvent;
            if (!event?.args?.value || !balance) return;
            
            setBalance(balance + event.args.value);
        },
    });

    return {
        data: balance,
        isLoading,
        error,
        isError: !!error,
    };
};

