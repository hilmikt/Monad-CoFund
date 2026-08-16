"use client";

import { useState } from "react";
import { formatAddress } from "@/lib/format";
import { Wallet } from "@phosphor-icons/react";
import { CURRENT_USER_ADDRESS } from "@/lib/mockData";

export default function WalletButton() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    // Simulate wallet connection
    await new Promise(r => setTimeout(r, 1000));
    setConnected(true);
    setLoading(false);
  };

  if (loading) {
    return (
      <button disabled className="px-4 py-2 text-sm font-medium border border-border bg-surface-secondary text-muted rounded-button transition-all">
        Connecting...
      </button>
    );
  }

  if (connected) {
    return (
      <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border bg-surface rounded-button hover:bg-surface-secondary transition-all shadow-subtle">
        <Wallet weight="bold" className="text-foreground" />
        <span className="font-mono">{formatAddress(CURRENT_USER_ADDRESS)}</span>
      </button>
    );
  }

  return (
    <button 
      onClick={handleConnect}
      className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-button hover:bg-[#333] active:scale-95 transition-all"
    >
      Connect Wallet
    </button>
  );
}
