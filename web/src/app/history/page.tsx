import Link from "next/link";
import FundDirectory from "@/components/FundDirectory";

export default function HistoryPage() {
  return (
    <div className="space-y-10">
      <div className="max-w-2xl">
        <Link href="/" className="text-xs font-mono text-muted hover:text-foreground">← Back home</Link>
        <p className="text-xs uppercase tracking-widest text-muted font-mono mt-8 mb-3">On-chain history</p>
        <h1 className="font-serif text-5xl tracking-tight mb-4">All CoFunds</h1>
        <p className="text-lg text-muted">Every fund created by this Monad CoFund contract, read directly from the chain.</p>
      </div>
      <FundDirectory />
    </div>
  );
}
