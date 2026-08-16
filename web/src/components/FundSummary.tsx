"use client";

import { Fund } from "@/lib/types";
import { formatMON } from "@/lib/format";
import { Vault, Users, Folders } from "@phosphor-icons/react";

export default function FundSummary({ fund }: { fund: Fund }) {
  const totalAllocated = fund.categories.reduce((sum, c) => sum + c.allocated, 0);
  const totalSpent = fund.categories.reduce((sum, c) => sum + c.spent, 0);
  const percentage = Math.min(100, Math.round((totalSpent / totalAllocated) * 100));

  return (
    <div className="border border-border rounded-card bg-surface p-8 shadow-subtle mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-muted font-mono font-medium mb-2">
            <Vault size={16} /> Treasury Balance
          </div>
          <div className="text-5xl font-serif tracking-tight">
            {formatMON(fund.balance)}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-surface-secondary border border-border p-4 rounded-button font-mono text-xs">
          <div>
            <span className="text-muted block uppercase text-[9px] tracking-wider">Allocated</span>
            <span className="font-semibold text-sm">{formatMON(totalAllocated)}</span>
          </div>
          <div>
            <span className="text-muted block uppercase text-[9px] tracking-wider">Spent</span>
            <span className="font-semibold text-sm">{formatMON(totalSpent)}</span>
          </div>
          <div>
            <span className="text-muted block uppercase text-[9px] tracking-wider">Members</span>
            <span className="font-semibold text-sm flex items-center gap-1">
              <Users size={12} /> {fund.members.length}
            </span>
          </div>
          <div>
            <span className="text-muted block uppercase text-[9px] tracking-wider">Categories</span>
            <span className="font-semibold text-sm flex items-center gap-1">
              <Folders size={12} /> {fund.categories.length}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <div className="flex items-center justify-between text-xs font-mono text-muted mb-2">
          <span>Overall Spending Progress</span>
          <span>{formatMON(totalSpent)} spent / {formatMON(totalAllocated)} budget ({percentage}%)</span>
        </div>
        <div className="w-full bg-surface-secondary h-3 rounded-pill overflow-hidden border border-border">
          <div 
            className="bg-foreground h-full transition-all duration-1000 ease-out" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
