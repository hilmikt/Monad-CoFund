import Link from "next/link";
import { UsersThree, Folders, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import FundDirectory from "@/components/FundDirectory";

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
          Create a shared treasury for your group, define where the money can be spent, and let transparent rules handle the rest.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/create"
            className="w-full sm:w-auto px-8 py-4 bg-foreground text-background font-medium rounded-button hover:bg-[#333] transition-all shadow-subtle hover:scale-[0.98] active:scale-95"
          >
            Create a CoFund
          </Link>
          <Link
            href="/history"
            className="w-full sm:w-auto px-8 py-4 bg-surface border border-border font-medium rounded-button hover:bg-surface-secondary transition-all shadow-subtle hover:scale-[0.98] active:scale-95"
          >
            Explore CoFunds
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto w-full">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted font-mono mb-2">Live on Monad</p>
            <h2 className="font-serif text-3xl tracking-tight">Recently created funds</h2>
          </div>
          <Link href="/history" className="text-xs font-mono underline underline-offset-4 text-muted hover:text-foreground">
            View all funds
          </Link>
        </div>
        <FundDirectory limit={3} />
      </section>

      {/* Thesis Section */}
      <section className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 ease-out fill-mode-both">
        <div className="bg-surface p-8 rounded-card border border-border shadow-subtle">
          <h3 className="text-xs uppercase tracking-widest text-muted mb-4 font-mono font-medium">Core Thesis</h3>
          <p className="text-lg">
            A group should not need to trust one person with everyone&apos;s money. They can trust the rules.
          </p>
        </div>
        <div className="bg-surface-secondary p-8 rounded-card border border-border shadow-subtle">
          <h3 className="text-xs uppercase tracking-widest text-muted mb-4 font-mono font-medium">Programmable Treasury</h3>
          <p className="text-lg">
            Monad CoFund is a non-custodial group treasury with budget categories and collective approval thresholds.
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
            <p className="text-muted text-sm">Members contribute MON into the shared treasury.</p>
          </div>

          <div className="flex flex-col items-center relative z-10">
            <div className="w-16 h-16 bg-yellow-light text-yellow-dark rounded-full flex items-center justify-center mb-6">
              <Folders size={32} weight="fill" />
            </div>
            <h3 className="font-serif text-2xl mb-2">2. Budget</h3>
            <p className="text-muted text-sm">Divide funds into predefined spending categories.</p>
          </div>

          <div className="flex flex-col items-center relative z-10">
            <div className="w-16 h-16 bg-green-light text-green-dark rounded-full flex items-center justify-center mb-6">
              <PaperPlaneTilt size={32} weight="fill" />
            </div>
            <h3 className="font-serif text-2xl mb-2">3. Spend</h3>
            <p className="text-muted text-sm">Approve proposals and execute payments trustlessly.</p>
          </div>

        </div>
      </section>
    </div>
  );
}
