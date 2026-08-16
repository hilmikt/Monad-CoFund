import Link from "next/link";
import { UsersThree, Folders, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import FundDirectory from "@/components/FundDirectory";

export default function Home() {
  return (
    <div className="flex flex-col gap-28 md:gap-40">
      {/* Hero Section */}
      <section className="entry grid items-end gap-12 md:grid-cols-[1.25fr_0.75fr] md:gap-20">
        <div>
          <div className="mb-8 inline-flex rounded-full border border-black/10 bg-surface px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-muted font-mono">Shared treasury / Monad testnet</div>
          <h1 className="max-w-4xl text-[clamp(4rem,10vw,9.5rem)] leading-[0.82] font-serif tracking-[-0.07em]">Money,<br /><em className="not-italic text-muted">together.</em></h1>
          <p className="mt-10 max-w-xl text-lg leading-relaxed text-muted md:text-xl">A programmable group treasury for people who want to pool, budget, and spend by rules everyone can see.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/create" className="group flex items-center justify-between gap-5 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background spring hover:-translate-y-1 active:scale-[0.98]">
              Create a CoFund <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 spring group-hover:translate-x-1">↗</span>
            </Link>
            <Link href="/history" className="flex items-center justify-center rounded-full border border-black/15 bg-surface px-6 py-3 text-sm font-medium spring hover:-translate-y-1 active:scale-[0.98]">Browse funds</Link>
          </div>
        </div>
        <div className="bezel entry [animation-delay:180ms]">
          <div className="bezel-core min-h-[300px] p-7 flex flex-col justify-between md:min-h-[360px]">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-mono text-muted"><span>Protocol note</span><span>01 / 03</span></div>
            <div className="my-8 rounded-[22px] bg-foreground p-5 text-background">
              <div className="mb-5 flex items-center justify-between text-[9px] uppercase tracking-[0.18em] font-mono text-background/55">
                <span>Rules / consensus / settlement</span><span>Live</span>
              </div>
              <div className="relative flex items-center justify-between gap-2">
                <div className="h-2 w-2 rounded-full bg-background" />
                <div className="h-px flex-1 bg-background/35" />
                <div className="h-3 w-3 rounded-full border border-background bg-foreground" />
                <div className="h-px flex-1 bg-background/35" />
                <div className="h-2 w-2 rounded-full bg-background" />
              </div>
            </div>
            <div><div className="mb-5 h-px bg-black/10" /><p className="font-serif text-4xl leading-none tracking-tight">No custodian.<br />No guesswork.</p><p className="mt-5 text-sm leading-relaxed text-muted">Categories constrain spending. Members approve the route. Monad records the result.</p></div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto w-full entry [animation-delay:260ms]">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted font-mono mb-3">01 — Live on Monad</p>
            <h2 className="font-serif text-4xl tracking-tight">The latest rooms</h2>
          </div>
          <Link href="/history" className="text-xs font-mono underline underline-offset-4 text-muted hover:text-foreground">
            View all funds
          </Link>
        </div>
        <FundDirectory limit={3} />
      </section>

      {/* Thesis Section */}
      <section className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto entry [animation-delay:340ms]">
        <div className="bezel"><div className="bezel-core min-h-64 p-8 md:p-10">
          <h3 className="text-xs uppercase tracking-widest text-muted mb-4 font-mono font-medium">Core Thesis</h3>
          <p className="text-3xl font-serif leading-tight">
            A group should not need to trust one person with everyone&apos;s money. They can trust the rules.
          </p>
        </div></div>
        <div className="bezel"><div className="bezel-core min-h-64 bg-surface text-foreground p-8 md:p-10">
          <h3 className="text-xs uppercase tracking-widest text-muted mb-4 font-mono font-medium">Programmable Treasury</h3>
          <p className="text-3xl font-serif leading-tight">
            Monad CoFund is a non-custodial group treasury with budget categories and collective approval thresholds.
          </p>
        </div></div>
      </section>

      {/* The Flow */}
      <section className="max-w-6xl mx-auto w-full entry [animation-delay:420ms]">
        <div className="grid sm:grid-cols-3 gap-6 relative">
          
          <div className="bezel"><div className="bezel-core flex min-h-56 flex-col items-start p-7">
            <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center mb-8">
              <UsersThree size={32} weight="light" />
            </div>
            <h3 className="font-serif text-3xl mb-2">01 / Pool</h3>
            <p className="text-muted text-sm">Members contribute MON into the shared treasury.</p>
          </div></div>

          <div className="bezel"><div className="bezel-core flex min-h-56 flex-col items-start p-7">
            <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center mb-8">
              <Folders size={32} weight="light" />
            </div>
            <h3 className="font-serif text-3xl mb-2">02 / Budget</h3>
            <p className="text-muted text-sm">Divide funds into predefined spending categories.</p>
          </div></div>

          <div className="bezel"><div className="bezel-core flex min-h-56 flex-col items-start p-7">
            <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center mb-8">
              <PaperPlaneTilt size={32} weight="light" />
            </div>
            <h3 className="font-serif text-3xl mb-2">03 / Spend</h3>
            <p className="text-muted text-sm">Approve proposals and execute payments trustlessly.</p>
          </div></div>

        </div>
      </section>
    </div>
  );
}
