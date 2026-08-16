"use client";

import { useState } from "react";
import { useWallet } from "./Web3Providers";
import { deposit } from "@/lib/contractActions";
import { isPositiveAmount } from "@/lib/validation";
import TransactionStatus, { TxStatus } from "./TransactionStatus";
import { Coins } from "@phosphor-icons/react";
import { MONAD_TESTNET_EXPLORER } from "@/lib/wagmi";

export default function ContributionForm({
  fundId,
  onComplete,
}: {
  fundId: number;
  onComplete: () => void;
}) {
  const { balance } = useWallet();
  const [amount, setAmount] = useState("5");
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPositiveAmount(amount)) return;

    setStatus("confirming");
    try {
      const res = await deposit(fundId, Number(amount));
      setStatus("success");
      setTxHash(res.txHash);
      // The receipt has already been confirmed by deposit(); refresh the parent
      // immediately so the treasury balance is read from the chain again.
      setTimeout(() => void onComplete(), 500);
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
          message={`+${amount} MON contributed to treasury`}
          explorerUrl={txHash ? `${MONAD_TESTNET_EXPLORER}/tx/${txHash}` : undefined}
        />
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
          <p className="text-sm text-muted">Add native MON to the treasury</p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Amount (MON)</label>
        <input
          type="number"
          step="0.001"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-surface-secondary border border-border rounded-button px-4 py-3 text-lg font-mono focus:outline-none focus:border-foreground transition-colors"
          placeholder="0.000"
        />
        <div className="flex justify-between mt-2 text-xs text-muted">
          <span>Your wallet balance</span>
          <span className="font-mono">{balance || "0.00"} MON</span>
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
