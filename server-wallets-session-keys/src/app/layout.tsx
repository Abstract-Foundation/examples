import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextAbstractWalletProvider } from "@/components/agw-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AGW Session Keys + Privy Server Wallets",
  description:
    "A demo application integrating Abstract Global Wallet with session keys and Privy server wallets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAbstractWalletProvider>
          {children}
          <Toaster position="top-right" />
        </NextAbstractWalletProvider>
      </body>
    </html>
  );
}
