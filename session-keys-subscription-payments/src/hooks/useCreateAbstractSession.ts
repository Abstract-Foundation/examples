"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useAbstractClient } from "@abstract-foundation/agw-react";
import { createAndStoreSession } from "@/lib/createAndStoreSession";
import { QUERY_KEYS } from "@/config/query-keys";

/**
 * Hook to create and store Abstract sessions
 * @returns Mutation functions and state for creating sessions
 */
export function useCreateAbstractSession() {
  const { data: abstractClient } = useAbstractClient();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("No wallet address found");
      if (!abstractClient) throw new Error("No Abstract client found");

      return createAndStoreSession(abstractClient, address);
    },
    onSuccess: (data) => {
      // Invalidate the session query to force a refetch
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.session, address],
      });

      return data;
    },
  });

  return createSessionMutation;
}
