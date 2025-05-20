"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { getStoredSession } from "@/lib/getStoredSession";
import { useAbstractClient } from "@abstract-foundation/agw-react";
import { QUERY_KEYS } from "@/config/query-keys";

/**
 * Hook to retrieve and validate the stored Abstract session
 * @returns The session data with loading and error states
 */
export function useAbstractSession() {
  const { address } = useAccount();
  const { data: abstractClient } = useAbstractClient();
  const areDependenciesLoading = !address || !abstractClient;

  const query = useQuery({
    queryKey: [QUERY_KEYS.session, address],
    queryFn: async () => {
      if (!address || !abstractClient) return null;

      const sessionData = await getStoredSession(abstractClient, address);

      return sessionData;
    },
    enabled: !!address && !!abstractClient,
    // Don't automatically refresh this query
    staleTime: Infinity,
  });

  // Override the loading state to consider dependencies loading time
  return {
    ...query,
    isLoading: query.isLoading || areDependenciesLoading,
  };
}
