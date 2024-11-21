"use client";

import { AbstractPrivyProvider } from "@abstract-foundation/agw-react/privy";

export default function AbstractWalletWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AbstractPrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}>
      {children}
    </AbstractPrivyProvider>
  );
}
