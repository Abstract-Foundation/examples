import { abstractTestnet, abstract } from "viem/chains";

/**
 * This exports the chain configuration to be used in the application.
 */
export const chain =
  process.env.NODE_ENV === "production" ? abstractTestnet : abstractTestnet;
