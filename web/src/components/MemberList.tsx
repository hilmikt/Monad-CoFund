"use client";

import { Member } from "@/lib/mockData";
import { formatAddress, formatMON } from "@/lib/format";
import { User } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export default function MemberList({ members }: { members: Member[] }) {
  return (
    <div className="border border-border rounded-card bg-surface overflow-hidden shadow-subtle">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-secondary">
        <h3 className="font-serif text-lg">Members</h3>
        <span className="text-xs bg-surface border border-border px-2 py-1 rounded-pill font-mono">
          {members.length}
        </span>
      </div>
      
      <ul className="divide-y divide-border">
        {members.map((m, i) => (
          <li key={i} className={cn("px-6 py-4 flex items-center justify-between", m.isCurrentUser && "bg-surface-secondary")}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-muted">
                <User weight="fill" size={16} />
              </div>
              <div>
                <div className="font-mono text-sm flex items-center gap-2">
                  {m.isCurrentUser ? "You" : formatAddress(m.address)}
                  {m.isCurrentUser && (
                    <span className="text-[10px] tracking-widest uppercase bg-foreground text-background px-1.5 py-0.5 rounded-pill">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right font-medium">
              {formatMON(m.contribution)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
