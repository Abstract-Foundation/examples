import { counterAddress, counterAbi } from "@/app/constants";
import { useReadContracts, useWatchContractEvent } from "wagmi";
import { useEffect, useState } from "react";

interface CounterStats {
  price: bigint;
  number: bigint;
  lastIncrementer: `0x${string}`;
}

interface IncrementedEvent {
  args: {
    incrementer: `0x${string}`;
    newNumber: bigint;
  };
}

export function useCounterStats() {
  const [stats, setStats] = useState<CounterStats | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { data, isLoading: isInitialLoading, error: initialError } = useReadContracts({
    contracts: [
      {
        address: counterAddress,
        abi: counterAbi,
        functionName: "price",
      },
      {
        address: counterAddress,
        abi: counterAbi,
        functionName: "number",
      },
      {
        address: counterAddress,
        abi: counterAbi,
        functionName: "lastIncrementer",
      },
    ],
    allowFailure: false,
  });

  // Update stats when initial data changes
  useEffect(() => {
    if (data) {
      setStats({
        price: data[0],
        number: data[1],
        lastIncrementer: data[2],
      });
      setIsLoading(false);
    }
  }, [data]);

  // Update error state
  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);

  // Watch for Incremented events
  useWatchContractEvent({
    address: counterAddress,
    abi: counterAbi,
    eventName: "Incremented",
    onLogs: (logs) => {
      console.log("Incremented", logs);
      if (!stats) return;

      const event = logs[0] as IncrementedEvent;
      if (!event?.args?.newNumber || !event?.args?.incrementer) return;

      setStats({
        ...stats,
        number: event.args.newNumber,
        lastIncrementer: event.args.incrementer,
      });
    },
  });

  return {
    data: stats,
    isLoading: isLoading || isInitialLoading,
    error,
    isError: !!error,
  };
}