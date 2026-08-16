"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockCreateFund } from "@/lib/mockActions";
import { isPositiveAmount } from "@/lib/validation";
import TransactionStatus, { TxStatus } from "@/components/TransactionStatus";
import { MagicWand } from "@phosphor-icons/react";

export default function CreateFundPage() {
  const router = useRouter();
  const [name, setName] = useState("Goa Trip");
  const [purpose, setPurpose] = useState("Shared expenses for our Goa trip");
  const [target, setTarget] = useState("100");
  const [threshold, setThreshold] = useState("2");
  
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !purpose || !isPositiveAmount(target) || !isPositiveAmount(threshold)) return;

    setStatus("pending");
    try {
      const res = await mockCreateFund({
        name,
        purpose,
        target: Number(target),
        threshold: Number(threshold)
      });
      
      if (res.success) {
        setStatus("success");
        setTxHash(res.txHash);
        // Delay to show success state before redirecting
        setTimeout(() => {
          router.push(`/fund/${res.fundId}`);
        }, 2000);
      }
    } catch {
      setStatus("failed");
    }
  };

  const isFormValid = name && purpose && isPositiveAmount(target) && isPositiveAmount(threshold);

  if (status !== "idle" && status !== "failed") {
    return (
      <div className="max-w-xl mx-auto pt-12">
        <TransactionStatus status={status} txHash={txHash} message="CoFund created successfully ✓" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-serif tracking-tight mb-4 flex items-center gap-3">
          Create a CoFund <MagicWand className="text-muted" weight="duotone" />
        </h1>
        <p className="text-muted text-lg">
          Set up a new shared treasury and invite your group.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface border border-border p-8 rounded-card shadow-subtle space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 uppercase tracking-widest text-muted">Fund Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface-secondary border border-border rounded-button px-4 py-3 focus:outline-none focus:border-foreground transition-colors"
            placeholder="e.g. Goa Trip"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 uppercase tracking-widest text-muted">Purpose</label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            rows={2}
            className="w-full bg-surface-secondary border border-border rounded-button px-4 py-3 focus:outline-none focus:border-foreground transition-colors resize-none"
            placeholder="What is this fund for?"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 uppercase tracking-widest text-muted">Target (MON)</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-surface-secondary border border-border rounded-button px-4 py-3 font-mono focus:outline-none focus:border-foreground transition-colors"
              placeholder="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 uppercase tracking-widest text-muted">Approvals Needed</label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full bg-surface-secondary border border-border rounded-button px-4 py-3 font-mono focus:outline-none focus:border-foreground transition-colors"
              placeholder="2"
            />
          </div>
        </div>

        {status === "failed" && (
          <div className="pt-4">
            <TransactionStatus status="failed" />
          </div>
        )}

        <div className="pt-6 border-t border-border mt-8">
          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full py-4 bg-foreground text-background font-medium rounded-button hover:bg-[#333] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-subtle hover:scale-[0.99] active:scale-[0.98]"
          >
            Create CoFund
          </button>
        </div>
      </form>
    </div>
  );
}
