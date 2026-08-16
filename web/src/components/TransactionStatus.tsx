"use client";

import { CheckCircle, Spinner, XCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type TxStatus = "idle" | "confirming" | "pending" | "success" | "failed" | "rejected";

interface Props {
  status: TxStatus;
  message?: string;
  txHash?: string;
  explorerUrl?: string;
}

export default function TransactionStatus({ status, message, txHash, explorerUrl }: Props) {
  if (status === "idle") return null;

  const bgMap = {
    confirming: "bg-surface-secondary border-border text-foreground",
    pending: "bg-surface-secondary border-border text-foreground",
    success: "bg-green-light border-green-light text-green-dark",
    failed: "bg-red-light border-red-light text-red-dark",
    rejected: "bg-red-light border-red-light text-red-dark",
  };

  return (
    <div className={cn(
      "flex flex-col border rounded-card p-4 text-sm animate-in fade-in zoom-in-95 duration-200 shadow-subtle",
      bgMap[status]
    )}>
      <div className="flex items-center gap-3">
        {status === "confirming" || status === "pending" ? (
          <Spinner className="animate-spin" size={20} />
        ) : status === "success" ? (
          <CheckCircle size={20} weight="fill" />
        ) : (
          <XCircle size={20} weight="fill" />
        )}
        
        <span className="font-medium">
          {status === "confirming" && "Confirm in wallet..."}
          {status === "pending" && "Transaction pending..."}
          {status === "success" && (message || "Transaction successful ✓")}
          {status === "failed" && "Transaction failed"}
          {status === "rejected" && "Transaction rejected"}
        </span>
      </div>
      
      {txHash && status === "success" && (
        <a 
          href={explorerUrl || `#`}
          className="mt-3 text-xs font-mono underline underline-offset-2 opacity-80 hover:opacity-100 flex items-center gap-1"
          target={explorerUrl ? "_blank" : undefined}
          rel={explorerUrl ? "noreferrer" : undefined}
          onClick={explorerUrl ? undefined : e => e.preventDefault()}
        >
          View transaction <span>→</span>
        </a>
      )}
    </div>
  );
}
