"use client";

import { Fund } from "@/lib/mockData";
import { formatMON } from "@/lib/format";

export default function FundSummary({ fund }: { fund: Fund }) {
  const percentage = Math.min(100, Math.round((fund.balance / fund.target) * 100));

  return (
    <div className="border border-border rounded-card bg-surface p-8 text-center shadow-subtle mb-8">
      <h3 className="text-xs tracking-widest uppercase text-muted mb-4 font-mono font-medium">
        Treasury Balance
      </h3>
      
      <div className="text-5xl font-serif tracking-tight mb-2">
        {formatMON(fund.balance)}
      </div>
      
      <div className="text-muted text-sm mb-6">
        {formatMON(fund.balance)} / {formatMON(fund.target)}
      </div>

      <div className="w-full bg-surface-secondary h-3 rounded-pill overflow-hidden border border-border">
        <div 
          className="bg-foreground h-full transition-all duration-1000 ease-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
