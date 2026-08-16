import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Web3Provider from "@/components/Web3Providers";
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
        <Web3Provider>
          <header className="sticky top-0 z-50 px-4 pt-5 md:px-8">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-black/10 bg-[#fafaf8]/90 px-4 pl-5 shadow-[0_18px_50px_rgba(10,10,10,0.08)] backdrop-blur-xl md:px-5">
              <Link href="/" className="group flex items-center gap-3 font-serif text-lg tracking-tight spring hover:-translate-y-0.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-sans font-bold">M</span>
                <span>Monad CoFund</span>
              </Link>
              <nav className="hidden items-center gap-6 text-xs font-mono uppercase tracking-[0.16em] text-muted md:flex">
                <Link href="/history" className="spring hover:text-foreground hover:-translate-y-0.5">History</Link>
                <Link href="/create" className="spring hover:text-foreground hover:-translate-y-0.5">Create</Link>
              </nav>
              <WalletButton />
            </div>
          </header>
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-12 md:px-8 md:py-28">
            {children}
          </main>
        </Web3Provider>
      </body>
    </html>
  );
}
