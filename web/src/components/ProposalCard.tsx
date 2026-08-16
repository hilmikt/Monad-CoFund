"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Category, Proposal } from "@/lib/types";
import { formatAddress, formatMON } from "@/lib/format";
import { approveProposal, executeProposal, hasApprovedProposal } from "@/lib/contractActions";
import TransactionStatus, { TxStatus } from "./TransactionStatus";
import { Check, CaretRight, Warning, Folder } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { MONAD_TESTNET_EXPLORER } from "@/lib/wagmi";

export default function ProposalCard({ 
  fundId,
  proposal, 
  categories,
  treasuryBalance,
  onUpdate 
}: { 
  fundId: number;
  proposal: Proposal;
  categories: Category[];
  treasuryBalance: number;
  onUpdate: () => void;
}) {
  const { address } = useAccount();
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string>();
  const [alreadyApproved, setAlreadyApproved] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(false);

  const category = categories.find(c => c.id === proposal.categoryId) || {
    id: proposal.categoryId,
    name: "General",
    allocated: 0,
    spent: 0
  };

  const categoryRemaining = Math.max(0, category.allocated - category.spent);
  const remainingAfterExecution = Math.max(0, categoryRemaining - proposal.amount);

  const isReady = proposal.approvals >= proposal.threshold;
  const isExecuted = proposal.executed;
  const percentage = Math.min(100, Math.round((proposal.approvals / proposal.threshold) * 100));

  // Validation checks
  const exceedsCategoryBudget = !isExecuted && proposal.amount > categoryRemaining;
  const exceedsTreasury = !isExecuted && proposal.amount > treasuryBalance;

  // Check if current user already approved
  useEffect(() => {
    async function checkApproval() {
      if (!address || isExecuted) return;
      try {
        setCheckingApproval(true);
        const hasAppr = await hasApprovedProposal(fundId, proposal.id, address);
        setAlreadyApproved(hasAppr);
      } catch {
        // Silently continue if check fails
      } finally {
        setCheckingApproval(false);
      }
    }
    checkApproval();
  }, [fundId, proposal.id, address, isExecuted]);

  const handleApprove = async () => {
    setStatus("confirming");
    try {
      const res = await approveProposal(fundId, proposal.id);
      setStatus("success");
      setTxHash(res.txHash);
      setTimeout(() => {
        setStatus("idle");
        setAlreadyApproved(true);
        onUpdate();
      }, 2000);
    } catch {
      setStatus("failed");
    }
  };

  const handleExecute = async () => {
    if (exceedsCategoryBudget || exceedsTreasury) return;

    setStatus("confirming");
    try {
      const res = await executeProposal(fundId, proposal.id);
      setStatus("success");
      setTxHash(res.txHash);
      setTimeout(() => {
        setStatus("idle");
        onUpdate();
      }, 2000);
    } catch {
      setStatus("failed");
    }
  };

  if (status !== "idle" && status !== "failed") {
    return (
      <div className="border border-border rounded-card bg-surface p-6 shadow-subtle mb-4">
        <TransactionStatus 
          status={status} 
          txHash={txHash} 
          explorerUrl={txHash ? `${MONAD_TESTNET_EXPLORER}/tx/${txHash}` : undefined}
        />
      </div>
    );
  }

  return (
    <div className={cn(
      "border border-border rounded-card bg-surface p-6 shadow-subtle mb-4 transition-all",
      isExecuted && "opacity-80 bg-surface-secondary/40"
    )}>
      {/* Category Tag & Status */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-[11px] font-mono tracking-widest uppercase bg-surface-secondary border border-border px-2.5 py-1 rounded-pill flex items-center gap-1.5 font-medium">
          <Folder size={12} className="text-muted" /> {category.name}
        </span>

        {isExecuted ? (
          <span className="text-[10px] tracking-widest uppercase bg-green-light text-green-dark border border-green-light px-2.5 py-1 rounded-pill flex items-center gap-1 font-mono font-medium">
            <Check weight="bold" /> Executed
          </span>
        ) : isReady ? (
          <span className="text-[10px] tracking-widest uppercase bg-blue-light text-blue-dark border border-blue-light px-2.5 py-1 rounded-pill font-mono font-medium">
            Ready to Execute
          </span>
        ) : (
          <span className="text-[10px] tracking-widest uppercase bg-yellow-light text-yellow-dark border border-yellow-light px-2.5 py-1 rounded-pill font-mono font-medium">
            Waiting for Approvals
          </span>
        )}
      </div>

      {/* Purpose & Amount */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-serif text-xl tracking-tight uppercase mb-1">{proposal.purpose}</h4>
          <div className="text-2xl font-mono font-medium">{formatMON(proposal.amount)}</div>
        </div>
      </div>

      {/* Recipient & Creator */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-xs font-mono">
        <div>
          <span className="text-muted block uppercase text-[10px] tracking-widest mb-0.5">Recipient</span>
          <span>{formatAddress(proposal.recipient)}</span>
        </div>
        <div>
          <span className="text-muted block uppercase text-[10px] tracking-widest mb-0.5">Proposed By</span>
          <span>{formatAddress(proposal.creator)}</span>
        </div>
      </div>

      {/* Category Budget Impact Preview */}
      <div className="bg-surface-secondary border border-border rounded-button p-3 mb-6 text-xs font-mono grid grid-cols-3 gap-2">
        <div>
          <span className="text-muted block uppercase text-[9px] tracking-wider">Category Budget</span>
          <span className="font-medium">{formatMON(category.allocated)}</span>
        </div>
        <div>
          <span className="text-muted block uppercase text-[9px] tracking-wider">Remaining</span>
          <span className="font-medium">{formatMON(categoryRemaining)}</span>
        </div>
        <div>
          <span className="text-muted block uppercase text-[9px] tracking-wider">
            {isExecuted ? "Category Remaining" : "After Execution"}
          </span>
          <span className={cn(
            "font-semibold",
            exceedsCategoryBudget ? "text-red-dark" : "text-green-dark"
          )}>
            {formatMON(isExecuted ? categoryRemaining : remainingAfterExecution)}
          </span>
        </div>
      </div>

      {/* Approvals Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5 font-mono">
          <span className="text-muted uppercase tracking-widest text-[10px]">Approvals</span>
          <span className="font-medium">{proposal.approvals} / {proposal.threshold}</span>
        </div>
        <div className="w-full bg-surface-secondary h-2.5 rounded-pill overflow-hidden border border-border mb-2">
          <div 
            className={cn("h-full transition-all duration-500", isReady ? "bg-green-dark" : "bg-foreground")}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Validation Warnings */}
      {exceedsCategoryBudget && (
        <div className="mb-4 p-2.5 bg-red-light border border-red-light rounded-button text-red-dark text-xs font-mono flex items-center gap-2">
          <Warning size={14} weight="bold" />
          <span>Insufficient {category.name} budget</span>
        </div>
      )}

      {exceedsTreasury && !exceedsCategoryBudget && (
        <div className="mb-4 p-2.5 bg-red-light border border-red-light rounded-button text-red-dark text-xs font-mono flex items-center gap-2">
          <Warning size={14} weight="bold" />
          <span>Insufficient treasury balance</span>
        </div>
      )}

      {/* Action Buttons */}
      {!isExecuted && (
        <div className="pt-3 border-t border-border">
          {!isReady ? (
            <button 
              onClick={handleApprove}
              disabled={alreadyApproved || checkingApproval}
              className="w-full py-2.5 border border-border bg-surface hover:bg-surface-secondary transition-all rounded-button font-medium text-sm shadow-subtle hover:scale-[0.99] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {alreadyApproved 
                ? `Already Approved (${proposal.approvals}/${proposal.threshold})`
                : `Approve (${proposal.approvals}/${proposal.threshold})`
              }
            </button>
          ) : (
            <button 
              onClick={handleExecute}
              disabled={exceedsCategoryBudget || exceedsTreasury}
              className="w-full py-2.5 bg-foreground text-background hover:bg-[#333] transition-all rounded-button font-medium text-sm flex items-center justify-center gap-2 shadow-subtle disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[0.99] active:scale-[0.98]"
            >
              Execute Payment <CaretRight weight="bold" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
