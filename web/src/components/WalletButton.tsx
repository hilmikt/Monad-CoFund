"use client";

import { useWallet } from "./Web3Providers";
import { formatAddress } from "@/lib/format";
import { Wallet, Warning } from "@phosphor-icons/react";
import { monadTestnet } from "@/lib/wagmi";

export default function WalletButton() {
  const { address, isConnected, chainId, connectWallet, disconnectWallet, switchNetwork } = useWallet();
  const isWrongNetwork = isConnected && chainId !== monadTestnet.id;

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        {isWrongNetwork && (
          <button
            onClick={switchNetwork}
            className="flex items-center gap-1.5 text-xs font-mono text-red-dark bg-red-light border border-red-light px-3 py-1.5 rounded-pill hover:opacity-80 transition-opacity"
          >
            <Warning size={14} weight="bold" /> Switch to Monad Testnet
          </button>
        )}
        <button
          onClick={disconnectWallet}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border bg-surface rounded-button hover:bg-surface-secondary transition-all shadow-subtle"
        >
          <Wallet weight="bold" className="text-foreground" />
          <span className="font-mono">{formatAddress(address)}</span>
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={connectWallet}
      className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-button hover:bg-[#333] active:scale-95 transition-all shadow-subtle"
    >
      Connect Wallet
    </button>
  );
}
