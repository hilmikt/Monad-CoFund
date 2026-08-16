import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Web3Providers from "@/components/Web3Providers";
import WalletButton from "@/components/WalletButton";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monad CoFund",
  description: "Pool together. Decide together. Spend together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Web3Providers>
          <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
              <Link href="/" className="font-serif text-lg tracking-tight hover:opacity-80 transition-opacity">
                Monad CoFund
              </Link>
              <WalletButton />
            </div>
          </header>
          <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 md:py-24">
            {children}
          </main>
        </Web3Providers>
      </body>
    </html>
  );
}
