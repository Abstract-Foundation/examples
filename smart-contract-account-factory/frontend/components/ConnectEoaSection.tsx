"use client";

import React from "react";
import { Button } from "./ui/button";
import useWalletClient from "@/lib/useWalletClient";
import { useAddress } from "@/lib/useAddress";

export default function ConnectEoaSection() {
  const walletClient = useWalletClient();
  const address = useAddress();

  return (
    <div className="flex flex-col items-center justify-center w-full h-full my-2">
      {!address ? (
        <Button
          className="w-full mt-2"
          onClick={async () => {
            try {
              const accounts = await walletClient?.request({
                method: "eth_requestAccounts",
              });

              if (!accounts || !accounts.length) {
                throw new Error(
                  "No accounts found. Please use a wallet extension for this demo."
                );
              }
            } catch (e) {
              alert("Error: " + e);
            }
          }}
        >
          Connect EOA Wallet
        </Button>
      ) : (
        <p className="mt-2 text-green-500">
          Connected:
          <strong>
            {address.slice(0, 6)}...{address.slice(-4)}
          </strong>
        </p>
      )}
    </div>
  );
}
