import type { Metadata } from "next";
import localFont from "next/font/local";
import NextAbstractWalletProvider from "../components/NextAbstractWalletProvider";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

// Default Fonts from Next.js
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Abstract Fonts
const avenueMono = localFont({
  src: "./fonts/Avenue Mono.ttf",
  variable: "--font-avenue-mono",
  weight: "100, 900",
});
const roobert = localFont({
  src: [
    { path: "./fonts/Roobert-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/Roobert-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Roobert-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Roobert-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/Roobert-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/Roobert-Heavy.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-roobert",
});

export const metadata: Metadata = {
  title: "Abstract Global Wallet + Reown",
  description: "Integrate Abstract Global Wallet with Reown",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${avenueMono.variable} ${roobert.variable} antialiased`}
      >
        <NextAbstractWalletProvider>{children}</NextAbstractWalletProvider>
      </body>
    </html>
  );
}
