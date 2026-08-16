"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Fund } from "@/lib/types";
import { createProposal } from "@/lib/contractActions";
import { isPositiveAmount, isValidAddress } from "@/lib/validation";
import TransactionStatus, { TxStatus } from "./TransactionStatus";
import { PaperPlaneRight, Warning } from "@phosphor-icons/react";
import { formatMON } from "@/lib/format";
import { MONAD_TESTNET_EXPLORER } from "@/lib/wagmi";

export default function ProposalForm({
  fund,
  onComplete,
}: {
  fund: Fund;
  onComplete: () => void;
}) {
  const { address } = useAccount();
  const [categoryId, setCategoryId] = useState<number>(fund.categories[0]?.id || 1);
  const [recipient, setRecipient] = useState(address ?? "");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string>();

  const selectedCategory = fund.categories.find((c) => c.id === Number(categoryId)) || fund.categories[0];
  const categoryRemaining = selectedCategory ? Math.max(0, selectedCategory.allocated - selectedCategory.spent) : 0;

  const numAmount = Number(amount) || 0;
  const remainingAfterPayment = categoryRemaining - numAmount;

  let validationError: string | null = null;
  if (numAmount > 0) {
    if (numAmount > fund.balance) {
      validationError = "Insufficient treasury balance";
    } else if (numAmount > categoryRemaining) {
      validationError = `Insufficient ${selectedCategory?.name || "category"} budget`;
    }
  }

  const isFormValid =
    isValidAddress(recipient) &&
    isPositiveAmount(amount) &&
    purpose.length > 0 &&
    !validationError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setStatus("confirming");
    try {
      const res = await createProposal({
        fundId: fund.id,
        categoryId: selectedCategory.id,
        recipient,
        amount: numAmount,
        purpose,
      });
      setStatus("success");
      setTxHash(res.txHash);
      setTimeout(() => onComplete(), 2000);
    } catch {
      setStatus("failed");
    }
  };

  if (status !== "idle" && status !== "failed") {
    return (
      <div className="p-6">
        <TransactionStatus
          status={status}
          txHash={txHash}
          message="Proposal created on-chain"
          explorerUrl={txHash ? `${MONAD_TESTNET_EXPLORER}/tx/${txHash}` : undefined}
        />
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
          <p className="text-sm text-muted">Request a payment under a budget category</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {/* Category Selection */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
            Budget Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="w-full bg-surface-secondary border border-border rounded-button px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors font-medium"
          >
            {fund.categories.map((cat) => {
              const rem = Math.max(0, cat.allocated - cat.spent);
              return (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({formatMON(rem)} remaining of {formatMON(cat.allocated)})
                </option>
              );
            })}
          </select>
        </div>

        {/* Selected Category Info Banner */}
        {selectedCategory && (
          <div className="bg-surface-secondary border border-border rounded-button p-3 text-xs font-mono flex items-center justify-between">
            <div>
              <span className="text-muted block">Budget Overview ({selectedCategory.name})</span>
              <span className="font-medium text-foreground">
                {formatMON(categoryRemaining)} remaining of {formatMON(selectedCategory.allocated)}
              </span>
            </div>
            {numAmount > 0 && !validationError && (
              <div className="text-right">
                <span className="text-muted block">After Payment</span>
                <span className="font-semibold text-green-dark">{formatMON(remainingAfterPayment)}</span>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full bg-surface-secondary border border-border rounded-button px-4 py-3 font-mono text-sm focus:outline-none focus:border-foreground transition-colors"
            placeholder="0x..."
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">Amount (MON)</label>
          <input
            type="number"
            step="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-surface-secondary border border-border rounded-button px-4 py-3 font-mono text-sm focus:outline-none focus:border-foreground transition-colors"
            placeholder="0.000"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">Purpose</label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full bg-surface-secondary border border-border rounded-button px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
            placeholder="e.g. Beach Villa Booking"
          />
        </div>
      </div>

      {validationError && (
        <div className="mb-6 p-3 bg-red-light border border-red-light rounded-button text-red-dark text-xs font-mono flex items-center gap-2">
          <Warning size={16} weight="bold" />
          <span>{validationError}</span>
        </div>
      )}

      {status === "failed" && (
        <div className="mb-4">
          <TransactionStatus status="failed" />
        </div>
      )}

      <button
        type="submit"
        disabled={!isFormValid}
        className="w-full py-3 bg-foreground text-background font-medium rounded-button hover:bg-[#333] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-subtle"
      >
        Create Proposal
      </button>
    </form>
  );
}
