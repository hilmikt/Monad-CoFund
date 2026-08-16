import Link from "next/link";
import { UsersThree, Scales, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";

export default function Home() {
  return (
    <div className="flex flex-col gap-24">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
        <h1 className="text-5xl md:text-7xl font-serif tracking-tight mb-6">
          Monad CoFund
        </h1>
        <p className="text-xl md:text-2xl text-muted font-light mb-10 leading-relaxed">
          Pool together. Decide together. Spend together. <br className="hidden md:block" />
          A shared MON treasury where groups can pool funds, approve expenses, and let smart-contract rules handle the money.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/create"
            className="w-full sm:w-auto px-8 py-4 bg-foreground text-background font-medium rounded-button hover:bg-[#333] transition-all shadow-subtle hover:scale-[0.98] active:scale-95"
          >
            Create a CoFund
          </Link>
          <Link 
            href="/fund/1"
            className="w-full sm:w-auto px-8 py-4 bg-surface border border-border font-medium rounded-button hover:bg-surface-secondary transition-all shadow-subtle hover:scale-[0.98] active:scale-95"
          >
            View Demo Pool
          </Link>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 ease-out fill-mode-both">
        <div className="bg-surface p-8 rounded-card border border-border shadow-subtle">
          <h3 className="text-xs uppercase tracking-widest text-muted mb-4 font-mono font-medium">The Problem</h3>
          <p className="text-lg">
            Don&apos;t let one person become the group&apos;s treasurer. Manual tracking, venmo requests, and chasing people for their share is broken.
          </p>
        </div>
        <div className="bg-surface-secondary p-8 rounded-card border border-border shadow-subtle">
          <h3 className="text-xs uppercase tracking-widest text-muted mb-4 font-mono font-medium">The Solution</h3>
          <p className="text-lg">
            Pool funds into a shared treasury governed by rules. No single point of failure. Total transparency.
          </p>
        </div>
      </section>

      {/* The Flow */}
      <section className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 ease-out fill-mode-both">
        <div className="grid sm:grid-cols-3 gap-8 text-center relative">
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-light text-blue-dark rounded-full flex items-center justify-center mb-6">
              <UsersThree size={32} weight="fill" />
            </div>
            <h3 className="font-serif text-2xl mb-2">1. Pool</h3>
            <p className="text-muted text-sm">Everyone deposits MON into the shared treasury.</p>
          </div>

          <div className="flex flex-col items-center relative z-10">
            <div className="w-16 h-16 bg-yellow-light text-yellow-dark rounded-full flex items-center justify-center mb-6">
              <Scales size={32} weight="fill" />
            </div>
            <h3 className="font-serif text-2xl mb-2">2. Decide</h3>
            <p className="text-muted text-sm">Propose expenses and vote to approve them.</p>
          </div>

          <div className="flex flex-col items-center relative z-10">
            <div className="w-16 h-16 bg-green-light text-green-dark rounded-full flex items-center justify-center mb-6">
              <PaperPlaneTilt size={32} weight="fill" />
            </div>
            <h3 className="font-serif text-2xl mb-2">3. Spend</h3>
            <p className="text-muted text-sm">Execute payments trustlessly via smart contracts.</p>
          </div>

        </div>
      </section>
    </div>
  );
}
