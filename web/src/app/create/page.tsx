"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/components/Web3Providers";
import { createCategory, createFund } from "@/lib/contractActions";
import { isPositiveAmount } from "@/lib/validation";
import TransactionStatus, { TxStatus } from "@/components/TransactionStatus";
import { MagicWand, Warning } from "@phosphor-icons/react";
import { MONAD_TESTNET_EXPLORER } from "@/lib/wagmi";
import { MONAD_COFUND_ADDRESS } from "@/lib/contracts/MonadCoFund";

export default function CreateFundPage() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const [name, setName] = useState("Goa Trip");
  const [purpose, setPurpose] = useState("Shared expenses for our Goa trip");
  const [target, setTarget] = useState("100");
  const [threshold, setThreshold] = useState("2");
  
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string>();

  const isContractSet = MONAD_COFUND_ADDRESS !== "0x0000000000000000000000000000000000000000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !purpose || !isPositiveAmount(target) || !isPositiveAmount(threshold)) return;

    setStatus("confirming");
    try {
      const res = await createFund({
        name,
        purpose,
        target: Number(target),
        threshold: Number(threshold)
      });
      
      if (res.success) {
        const categoryRes = await createCategory(res.fundId, name.trim(), Number(target));
        setStatus("success");
        setTxHash(categoryRes.txHash || res.txHash);
        // Redirect to new fund's dashboard
        setTimeout(() => {
          router.push(`/fund/${res.fundId || 1}`);
        }, 2000);
      }
    } catch {
      setStatus("failed");
    }
  };

  const isFormValid = name && purpose && isPositiveAmount(target) && isPositiveAmount(threshold) && isConnected;

  if (status !== "idle" && status !== "failed") {
    return (
      <div className="max-w-xl mx-auto pt-12">
        <TransactionStatus 
          status={status} 
          txHash={txHash} 
          message="CoFund created on Monad Testnet ✓" 
          explorerUrl={txHash ? `${MONAD_TESTNET_EXPLORER}/tx/${txHash}` : undefined}
        />
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

      {!isContractSet && (
        <div className="mb-6 p-4 bg-yellow-light border border-yellow-light rounded-card text-xs font-mono text-yellow-dark flex items-start gap-2">
          <Warning size={16} className="shrink-0 mt-0.5" weight="bold" />
          <div>
            <strong>Contract address not configured.</strong> Set <code>NEXT_PUBLIC_CONTRACT_ADDRESS</code> in <code>web/.env.local</code> to interact with the deployed contract on Monad Testnet.
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="mb-6 p-4 bg-surface border border-border rounded-card text-xs font-mono text-muted flex items-center gap-2">
          <Warning size={16} weight="bold" />
          <span>Connect your wallet to deploy a CoFund.</span>
        </div>
      )}

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
            Create CoFund On-Chain
          </button>
        </div>
      </form>
    </div>
  );
}
