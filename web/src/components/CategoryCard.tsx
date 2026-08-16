"use client";

import { Category } from "@/lib/types";
import { formatMON } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Warning, CheckCircle } from "@phosphor-icons/react";

export default function CategoryCard({ category }: { category: Category }) {
  const remaining = Math.max(0, category.allocated - category.spent);
  const percentage = Math.min(100, Math.round((category.spent / category.allocated) * 100));
  
  const isExhausted = remaining === 0;
  const isLow = remaining > 0 && remaining <= category.allocated * 0.25;

  return (
    <div className={cn(
      "border border-border rounded-card bg-surface p-5 shadow-subtle flex flex-col justify-between transition-all hover:border-foreground/30",
      isExhausted && "bg-surface-secondary/60 opacity-90"
    )}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-serif text-lg font-medium tracking-tight uppercase">{category.name}</h4>
          {isExhausted ? (
            <span className="text-[10px] tracking-widest uppercase bg-red-light text-red-dark border border-red-light px-2 py-0.5 rounded-pill flex items-center gap-1 font-mono">
              <Warning weight="bold" /> Exhausted
            </span>
          ) : isLow ? (
            <span className="text-[10px] tracking-widest uppercase bg-yellow-light text-yellow-dark border border-yellow-light px-2 py-0.5 rounded-pill flex items-center gap-1 font-mono">
              <Warning weight="bold" /> Low Budget
            </span>
          ) : (
            <span className="text-[10px] tracking-widest uppercase bg-green-light text-green-dark border border-green-light px-2 py-0.5 rounded-pill flex items-center gap-1 font-mono">
              <CheckCircle weight="fill" /> Active
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs mb-4">
          <div>
            <span className="text-muted block uppercase text-[10px] tracking-widest">Budget</span>
            <span className="font-mono font-medium text-foreground">{formatMON(category.allocated)}</span>
          </div>
          <div>
            <span className="text-muted block uppercase text-[10px] tracking-widest">Spent</span>
            <span className="font-mono font-medium text-foreground">{formatMON(category.spent)}</span>
          </div>
          <div>
            <span className="text-muted block uppercase text-[10px] tracking-widest">Remaining</span>
            <span className={cn(
              "font-mono font-semibold",
              isExhausted ? "text-red-dark" : isLow ? "text-yellow-dark" : "text-green-dark"
            )}>
              {formatMON(remaining)}
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="w-full bg-surface-secondary h-2.5 rounded-pill overflow-hidden border border-border">
          <div 
            className={cn(
              "h-full transition-all duration-700 ease-out",
              isExhausted ? "bg-red-dark" : isLow ? "bg-yellow-dark" : "bg-foreground"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="text-right text-[10px] font-mono text-muted mt-1.5">
          {percentage}% spent
        </div>
      </div>
    </div>
  );
}
