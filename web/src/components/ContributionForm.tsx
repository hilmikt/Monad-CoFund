"use client";

import { useState } from "react";
import { mockDeposit } from "@/lib/mockActions";
import { isPositiveAmount } from "@/lib/validation";
import TransactionStatus, { TxStatus } from "./TransactionStatus";
import { Coins } from "@phosphor-icons/react";

export default function ContributionForm({ onComplete }: { onComplete: () => void }) {
  const [amount, setAmount] = useState("5.00");
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPositiveAmount(amount)) return;

    setStatus("confirming");
    
    // Simulate transaction
    try {
      const res = await mockDeposit(Number(amount));
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

  if (status !== "idle" && status !== "failed") {
    return (
      <div className="p-6">
        <TransactionStatus status={status} txHash={txHash} message={`+${amount} MON contributed successfully`} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-3 bg-surface-secondary border border-border rounded-full">
          <Coins size={24} className="text-foreground" />
        </div>
        <div>
          <h3 className="font-serif text-xl">Contribute</h3>
          <p className="text-sm text-muted">Add funds to the treasury</p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Amount (MON)</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-surface-secondary border border-border rounded-button px-4 py-3 text-lg font-mono focus:outline-none focus:border-foreground transition-colors"
          placeholder="0.00"
        />
        <div className="flex justify-between mt-2 text-xs text-muted">
          <span>Your balance</span>
          <span className="font-mono">42.50 MON</span>
        </div>
      </div>

      {status === "failed" && (
        <div className="mb-4">
          <TransactionStatus status="failed" />
        </div>
      )}

      <button
        type="submit"
        disabled={!isPositiveAmount(amount)}
        className="w-full py-3 bg-foreground text-background font-medium rounded-button hover:bg-[#333] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Contribute {amount || "0"} MON
      </button>
    </form>
  );
}
