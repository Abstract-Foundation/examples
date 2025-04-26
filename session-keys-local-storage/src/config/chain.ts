import { abstractTestnet, abstract } from "viem/chains";

/**
 * This exports the chain configuration to be used in the application.
 * Uses Abstract testnet in development and the mainnet in production.
 * In this simple example, we use the testnet in both environments.
 */
const chain = process.env.NODE_ENV === "production" ? abstract : abstractTestnet;

export type SupportedChain = typeof chain;

export default chain;
