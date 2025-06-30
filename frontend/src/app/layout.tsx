import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Web3Provider from "../providers/Web3";
import ThemeProvider from "../providers/Theme";
import { Toaster } from "react-hot-toast";
import SiteNavigation from "@/components/SiteNavigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Attention Futures | Trade Social Media Attention",
  description: "Leveraged trading platform powered by real-time social media attention scores via Chainlink oracles. Cross-chain synchronized between Ethereum and Avalanche.",
  keywords: ["DeFi", "Chainlink", "Trading", "Social Media", "Oracles", "Cross-chain", "CCIP", "Attention", "Derivatives"],
  openGraph: {
    title: "Attention Futures",
    description: "Trade derivatives based on social media attention scores",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head />
      <body className={`${inter.variable} bg-axBlack text-white antialiased`}>
        <ThemeProvider>
        <Web3Provider>
          <SiteNavigation />
          <main className="pt-16 w-full">{children}</main>
          <Toaster position="top-right" />
        </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
