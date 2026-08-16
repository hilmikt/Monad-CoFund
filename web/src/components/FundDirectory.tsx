"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Vault } from "@phosphor-icons/react";
import { getFundSummaries } from "@/lib/contractActions";
import { Fund } from "@/lib/types";
import { formatMON } from "@/lib/format";

export default function FundDirectory({ limit }: { limit?: number }) {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getFundSummaries()
      .then((data) => {
        if (active) setFunds(limit ? data.slice(-limit).reverse() : data.reverse());
      })
      .catch((readError) => {
        console.error("Fund directory read failed:", readError);
        if (active) setError(`Unable to load funds from Monad Testnet: ${readError instanceof Error ? readError.message : "RPC read failed"}`);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [limit]);

  if (loading) {
    return <p className="text-sm text-muted font-mono">Loading funds from Monad...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-dark font-mono">{error}</p>;
  }

  if (funds.length === 0) {
    return <p className="text-sm text-muted font-mono">No on-chain funds have been created yet.</p>;
  }

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {funds.map((fund) => (
        <div key={fund.id} className="bezel spring hover:-translate-y-2">
          <Link href={`/fund/${fund.id}`} className="group bezel-core block p-6 md:p-7">
            <div className="flex items-start justify-between gap-4 mb-12">
              <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center"><Vault size={18} weight="light" /></div>
              <ArrowRight size={18} className="text-muted spring group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-mono mb-2">Fund / {String(fund.id).padStart(2, "0")}</p>
            <h3 className="font-serif text-3xl mb-2 truncate tracking-tight">{fund.name}</h3>
            <p className="text-sm text-muted line-clamp-2 min-h-10">{fund.purpose}</p>
            <div className="mt-8 pt-4 border-t border-black/10 flex justify-between text-xs font-mono"><span className="text-muted">Treasury</span><span>{formatMON(fund.balance)}</span></div>
          </Link>
        </div>
      ))}
    </div>
  );
}
