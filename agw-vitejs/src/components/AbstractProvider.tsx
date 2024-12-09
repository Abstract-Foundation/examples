import { AbstractWalletProvider } from "@abstract-foundation/agw-react";

export function AbstractProvider(props: React.PropsWithChildren): JSX.Element {
  return (
    <AbstractWalletProvider config={{ testnet: true }}>
      {props.children}
    </AbstractWalletProvider>
  );
}
