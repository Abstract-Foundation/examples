"use client";

import dynamic from "next/dynamic";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const DynamicWalletProvider = dynamic(() => import("./DynamicWalletProvider"), {
  ssr: false,
});

const client = new QueryClient();

export default function NextAbstractWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={client}>
      <DynamicWalletProvider>{children}</DynamicWalletProvider>
    </QueryClientProvider>
  );
}
