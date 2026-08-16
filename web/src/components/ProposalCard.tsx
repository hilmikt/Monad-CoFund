"use client";

import { useState } from "react";
import { Proposal } from "@/lib/mockData";
import { formatAddress, formatMON } from "@/lib/format";
import { mockApproveProposal, mockExecuteProposal } from "@/lib/mockActions";
import TransactionStatus, { TxStatus } from "./TransactionStatus";
import { Check, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export default function ProposalCard({ 
  proposal, 
  onUpdate 
}: { 
  proposal: Proposal;
  onUpdate: () => void;
}) {
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string>();

  const isReady = proposal.approvals >= proposal.threshold;
  const isExecuted = proposal.executed;
  const percentage = Math.min(100, Math.round((proposal.approvals / proposal.threshold) * 100));

  const handleApprove = async () => {
    setStatus("confirming");
    try {
      const res = await mockApproveProposal(proposal.id);
      if (res.success) {
        setStatus("success");
        setTxHash(res.txHash);
        setTimeout(() => {
          setStatus("idle");
          onUpdate();
        }, 1500);
      }
    } catch (err) {
      setStatus("failed");
    }
  };

  const handleExecute = async () => {
    setStatus("confirming");
    try {
      const res = await mockExecuteProposal(proposal.id);
      if (res.success) {
        setStatus("success");
        setTxHash(res.txHash);
        setTimeout(() => {
          setStatus("idle");
          onUpdate();
        }, 1500);
      }
    } catch (err) {
      setStatus("failed");
    }
  };

  if (status !== "idle" && status !== "failed") {
    return (
      <div className="border border-border rounded-card bg-surface p-6 shadow-subtle mb-4">
        <TransactionStatus status={status} txHash={txHash} />
      </div>
    );
  }

  return (
    <div className={cn(
      "border border-border rounded-card bg-surface p-6 shadow-subtle mb-4 transition-all",
      isExecuted && "opacity-75 bg-surface-secondary"
    )}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="font-serif text-lg tracking-tight mb-1 uppercase">{proposal.purpose}</h4>
          <div className="text-2xl font-mono">{formatMON(proposal.amount)}</div>
        </div>
        {isExecuted && (
          <span className="text-[10px] tracking-widest uppercase bg-green-light text-green-dark border border-green-light px-2 py-1 rounded-pill flex items-center gap-1">
            <Check weight="bold" /> Executed
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <div className="text-muted mb-1 text-xs uppercase tracking-widest">To</div>
          <div className="font-mono">{formatAddress(proposal.recipient)}</div>
        </div>
        <div>
          <div className="text-muted mb-1 text-xs uppercase tracking-widest">Proposed by</div>
          <div className="font-mono">{formatAddress(proposal.creator)}</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted text-xs uppercase tracking-widest">Approval</span>
          <span className="font-mono font-medium">{proposal.approvals} / {proposal.threshold}</span>
        </div>
        <div className="w-full bg-surface-secondary h-2 rounded-pill overflow-hidden border border-border mb-3">
          <div 
            className={cn("h-full transition-all duration-500", isReady ? "bg-green-dark" : "bg-foreground")}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {!isExecuted && (
        <div className="pt-4 border-t border-border mt-4">
          {!isReady ? (
            <button 
              onClick={handleApprove}
              className="w-full py-2.5 border border-border bg-surface hover:bg-surface-secondary transition-all rounded-button font-medium shadow-subtle"
            >
              Approve
            </button>
          ) : (
            <button 
              onClick={handleExecute}
              className="w-full py-2.5 bg-foreground text-background hover:bg-[#333] transition-all rounded-button font-medium flex items-center justify-center gap-2 shadow-subtle"
            >
              Execute Payment <CaretRight weight="bold" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
