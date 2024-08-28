import { useState, useEffect } from "react";
import useWalletClient from "./useWalletClient";
import { Hex } from "viem";

export function useAddress() {
  const [address, setAddress] = useState<Hex | null>(null);
  const walletClient = useWalletClient();

  useEffect(() => {
    const fetchAddress = async () => {
      if (walletClient) {
        try {
          const addresses = await walletClient.getAddresses();
          if (addresses && addresses.length > 0) {
            setAddress(addresses[0]);
            console.log("Address", addresses[0]);
          }
        } catch (error) {
          console.error("Failed to fetch address:", error);
        }
      }
    };

    fetchAddress();

    // @ts-ignore Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0] as Hex);
          console.log("Address changed", accounts[0]);
        } else {
          setAddress(null);
        }
      };

      // @ts-ignore
      window.ethereum.on("accountsChanged", handleAccountsChanged);

      // Cleanup the event listener on component unmount
      return () => {
        // @ts-ignore
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, [walletClient]);

  return address;
}
