"use client";

import { Fund } from "@/lib/types";
import { formatMON } from "@/lib/format";
import { Vault, Users, ShieldCheck } from "@phosphor-icons/react";

export default function FundSummary({ fund }: { fund: Fund }) {
  return (
    <div className="bezel mb-8">
      <div className="bezel-core bg-surface p-7 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-muted font-mono font-medium mb-2">
            <Vault size={16} /> Treasury Balance
          </div>
          <div className="text-5xl font-serif tracking-tight">
            {formatMON(fund.balance)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-surface-secondary border border-border p-4 rounded-button font-mono text-xs">
          <div>
            <span className="text-muted block uppercase text-[9px] tracking-wider">Members</span>
            <span className="font-semibold text-sm flex items-center gap-1">
              <Users size={12} /> {fund.members.length}
            </span>
          </div>
          <div>
            <span className="text-muted block uppercase text-[9px] tracking-wider">Approval threshold</span>
            <span className="font-semibold text-sm flex items-center gap-1">
              <ShieldCheck size={12} /> {fund.approvalThreshold}
            </span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
