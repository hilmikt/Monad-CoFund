"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Vault } from "@phosphor-icons/react";
import { getAllFundData } from "@/lib/contractActions";
import { Fund } from "@/lib/types";
import { formatMON } from "@/lib/format";

export default function FundDirectory({ limit }: { limit?: number }) {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAllFundData()
      .then((data) => {
        if (active) setFunds(limit ? data.slice(-limit).reverse() : data.reverse());
      })
      .catch((readError) => {
        console.error("Fund directory read failed:", readError);
        if (active) setError("Unable to load funds from Monad Testnet.");
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
    <div className="grid gap-4 md:grid-cols-3">
      {funds.map((fund) => (
        <Link
          key={fund.id}
          href={`/fund/${fund.id}`}
          className="group bg-surface border border-border rounded-card p-6 shadow-subtle hover:bg-surface-secondary transition-colors"
        >
          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-green-light text-green-dark flex items-center justify-center">
              <Vault size={20} weight="fill" />
            </div>
            <ArrowRight size={18} className="text-muted group-hover:text-foreground transition-colors" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-muted font-mono mb-2">Fund #{fund.id}</p>
          <h3 className="font-serif text-2xl mb-2 truncate">{fund.name}</h3>
          <p className="text-sm text-muted line-clamp-2 min-h-10">{fund.purpose}</p>
          <div className="mt-6 pt-4 border-t border-border flex justify-between text-xs font-mono">
            <span className="text-muted">Treasury</span>
            <span>{formatMON(fund.balance)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
