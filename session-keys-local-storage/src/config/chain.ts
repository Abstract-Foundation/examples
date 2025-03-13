import { abstractTestnet, abstract } from "viem/chains";

/**
 * This exports the chain configuration to be used in the application.
 * Uses Abstract testnet in development and the mainnet in production.
 */
const chain =
  process.env.NODE_ENV === "development" ? abstractTestnet : abstract;

export type SupportedChain = typeof chain;

export default chain;
