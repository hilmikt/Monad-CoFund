"use client";

import { useState } from "react";
import { useWallet } from "./Web3Providers";
import { joinFund } from "@/lib/contractActions";
import { monadTestnet } from "@/lib/wagmi";
import TransactionStatus, { TxStatus } from "./TransactionStatus";
import { ArrowRight } from "@phosphor-icons/react";

export default function JoinFundButton({ fundId, onJoined }: { fundId: number; onJoined: () => void }) {
  const { address, isConnected, chainId, switchNetwork } = useWallet();
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string>();

  const isWrongNetwork = isConnected && chainId !== monadTestnet.id;

  const handleJoin = async () => {
    if (!address) return;
    if (isWrongNetwork) {
      await switchNetwork();
      return;
    }
    setStatus("confirming");
    try {
      const res = await joinFund(fundId);
      setStatus("success");
      setTxHash(res.txHash);
      setTimeout(() => onJoined(), 2000);
    } catch {
      setStatus("failed");
    }
  };

  if (!isConnected) return null;

  if (status === "confirming" || status === "pending" || status === "success") {
    return (
      <div className="border border-border rounded-card bg-surface p-4 shadow-subtle">
        <TransactionStatus status={status} txHash={txHash} message="You've joined the fund!" />
      </div>
    );
  }

  return (
    <div className="border border-border rounded-card bg-surface-secondary p-4 flex items-center justify-between gap-4 shadow-subtle">
      <div>
        <p className="font-medium text-sm">You&apos;re not a member yet</p>
        <p className="text-muted text-xs font-mono">Join to contribute, propose, and vote</p>
      </div>
      <button
        onClick={handleJoin}
        className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-button hover:bg-[#333] transition-all shadow-subtle whitespace-nowrap"
      >
        {isWrongNetwork ? "Switch Network" : "Join Fund"} <ArrowRight weight="bold" size={14} />
      </button>
      {status === "failed" && (
        <div className="mt-3">
          <TransactionStatus status="failed" />
        </div>
      )}
    </div>
  );
}
