import { cookieStorage, createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { abstract } from "@reown/appkit/networks";
import { createClient, http } from "viem";
import { eip712WalletActions } from "viem/zksync";

// Set the chain (Abstract Testnet or Abstract)
export const CHAIN = abstract;

// Get projectId from https://cloud.reown.com
export const projectId = "288ac73bf011e4bb399948d2a08a0568";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const networks = [CHAIN];

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  client({ chain }) {
    return createClient({
      chain,
      transport: http(),
    }).extend(eip712WalletActions());
  },
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
