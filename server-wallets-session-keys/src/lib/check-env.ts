/**
 * This is just for helping get you started running the repo locally.
 * Checks if required environment variables are set.
 * If any are missing, logs instructions on how to set them before throwing an error.
 */
export function checkRequiredEnvVars(
  envVarsToCheck: string[] = [
    "PRIVY_APP_ID",
    "PRIVY_APP_SECRET",
    "PRIVY_SERVER_WALLET_ID",
    "PRIVY_SERVER_WALLET_ADDRESS",
  ]
): void {
  const missingEnvVars = envVarsToCheck.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    console.error(`
❌ Missing required environment variables!

Please add these variables to your .env file:

${missingEnvVars.map((envVar) => `- ${envVar}`).join("\n")}

You can get these from the Privy Dashboard.
Check the README.md file for more information.`);

    throw new Error("Missing required environment variables");
  }
}
