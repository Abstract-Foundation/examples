import { useState, useEffect } from "react";
import { createWalletClient, custom } from "viem";
import { abstractTestnet } from "viem/chains";
import { eip712WalletActions } from "viem/zksync";

export function createViemClient(window: Window) {
  // @ts-ignore
  if (!window.ethereum) {
    return null;
  }

  return createWalletClient({
    chain: abstractTestnet,
    // @ts-ignore
    transport: custom(window.ethereum!),
  }).extend(eip712WalletActions());
}

export default function useWalletClient() {
  const [walletClient, setWalletClient] = useState<ReturnType<
    typeof createViemClient
  > | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const client = createViemClient(window);
      if (client) {
        setWalletClient(client);
      }
    }
  }, []);

  return walletClient;
}
