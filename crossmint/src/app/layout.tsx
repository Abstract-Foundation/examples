import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";
import NextAbstractWalletProvider from "@/components/NextAbstractWalletProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crossmint + Abstract Global Wallet",
  description: "Purchase NFTs with credit cards using Crossmint and Abstract Global Wallet",
};

// Abstract Fonts
const avenueMono = localFont({
  src: "../fonts/Avenue Mono.ttf",
  variable: "--font-avenue-mono",
  weight: "100, 900",
});

const roobert = localFont({
  src: [
    { path: "../fonts/Roobert-Light.ttf", weight: "300", style: "normal" },
    { path: "../fonts/Roobert-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/Roobert-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/Roobert-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/Roobert-Bold.ttf", weight: "700", style: "normal" },
    { path: "../fonts/Roobert-Heavy.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-roobert",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <NextAbstractWalletProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${avenueMono.variable} ${roobert.variable} antialiased`}
        >
          {children}
        </body>
      </NextAbstractWalletProvider>
    </html>
  );
}
