"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { monadTestnet } from "@/lib/wagmi";
import { Warning } from "@phosphor-icons/react";

export default function WalletButton() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const isWrongNetwork = isConnected && chainId !== monadTestnet.id;

  return (
    <div className="flex items-center gap-3">
      {isWrongNetwork && (
        <span className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-red-dark bg-red-light border border-red-light px-3 py-1.5 rounded-pill">
          <Warning size={14} weight="bold" /> Wrong Network
        </span>
      )}
      <ConnectButton
        label="Connect Wallet"
        accountStatus="address"
        chainStatus="icon"
        showBalance={false}
      />
    </div>
  );
}
