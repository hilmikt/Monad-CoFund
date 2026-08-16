"use client";

import { useState } from "react";
import { mockCreateProposal } from "@/lib/mockActions";
import { isPositiveAmount, isValidAddress } from "@/lib/validation";
import TransactionStatus, { TxStatus } from "./TransactionStatus";
import { PaperPlaneRight } from "@phosphor-icons/react";

export default function ProposalForm({ onComplete }: { onComplete: () => void }) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidAddress(recipient) || !isPositiveAmount(amount) || !purpose) return;

    setStatus("confirming");
    
    try {
      const res = await mockCreateProposal({
        recipient,
        amount: Number(amount),
        purpose
      });
      if (res.success) {
        setStatus("success");
        setTxHash(res.txHash);
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } catch {
      setStatus("failed");
    }
  };

  const isFormValid = isValidAddress(recipient) && isPositiveAmount(amount) && purpose.length > 0;

  if (status !== "idle" && status !== "failed") {
    return (
      <div className="p-6">
        <TransactionStatus status={status} txHash={txHash} message="Proposal created successfully" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-3 bg-surface-secondary border border-border rounded-full">
          <PaperPlaneRight size={24} className="text-foreground" />
        </div>
        <div>
          <h3 className="font-serif text-xl">New Spending Proposal</h3>
          <p className="text-sm text-muted">Suggest a payment from the treasury</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full bg-surface-secondary border border-border rounded-button px-4 py-3 font-mono text-sm focus:outline-none focus:border-foreground transition-colors"
            placeholder="0x..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Amount (MON)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-surface-secondary border border-border rounded-button px-4 py-3 font-mono text-sm focus:outline-none focus:border-foreground transition-colors"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Purpose</label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full bg-surface-secondary border border-border rounded-button px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
            placeholder="What is this for?"
          />
        </div>
      </div>

      {status === "failed" && (
        <div className="mb-4">
          <TransactionStatus status="failed" />
        </div>
      )}

      <button
        type="submit"
        disabled={!isFormValid}
        className="w-full py-3 bg-foreground text-background font-medium rounded-button hover:bg-[#333] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Create Proposal
      </button>
    </form>
  );
}
