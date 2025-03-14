import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextAbstractWalletProvider from "@/components/NextAbstractWalletProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Abstract Session Keys Demo",
  description:
    "Securely manage blockchain session keys with Abstract Global Wallet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <NextAbstractWalletProvider>
        <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
          {children}
        </body>
      </NextAbstractWalletProvider>
    </html>
  );
}
