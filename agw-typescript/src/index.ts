import { createAbstractClient } from "@abstract-foundation/agw-client";
import { http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { abstractTestnet } from "viem/chains";
import { getGeneralPaymasterInput } from "viem/zksync";

/** Example of using the AGW wallet to send a transaction
 *  Note the transaction is signed by the EOA, but sent from the AGW smart contract wallet. */
(async () => {
    // As an example, we are creating a new dummy account here for the signer.
    const randomPrivateKey = generatePrivateKey(); // Make a random private key
    const account = privateKeyToAccount(randomPrivateKey); // Use that to create a signer

    console.log("Account address:", account.address);

    // Create a viem client where:
    // - Transactions are signed by a given signer / EOA.
    // - Transactions are sent from the AGW smart contract wallet.
    const agwClient = await createAbstractClient({
        chain: abstractTestnet,
        signer: account, // This will be the "owner" (the initial approved signer) of the AGW smart contract wallet.
        transport: http(`https://api.testnet.abs.xyz`),
    });

    // This transaction does the following:
    // 1. Deploys the AGW smart contract (if not already deployed), from the EOA created above.
    //   - Gas sponsored by a paymaster.
    //   - The EOA is set as the "owner" (initial approved signer) of the AGW smart contract wallet.
    // 2. Uses the newly deployed smart contract to send an example transaction (the tx.from is the AGW smart contract wallet).
    //   - Note: The first transaction occurs inside the deployment initializer inside an internal transaction.
    const hash = await agwClient.sendTransaction({
        to: "0x273B3527BF5b607dE86F504fED49e1582dD2a1C6",
        data: "0x69",
        // (Optional) Paymaster to abstract gas fees
        paymaster: "0x5407B5040dec3D339A9247f3654E59EEccbb6391",
        paymasterInput: getGeneralPaymasterInput({
            innerInput: "0x",
        }),
    });

    console.log("Transaction sent:", `https://explorer.testnet.abs.xyz/tx/${hash}`);
})();
