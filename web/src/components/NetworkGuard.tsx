"use client";

import React, { useState, useEffect } from "react";
import { WarningCircle } from "@phosphor-icons/react";

export default function NetworkGuard({ children }: { children: React.ReactNode }) {
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);

  // Expose a window function to toggle mock network state for demo purposes
  useEffect(() => {
    (window as unknown as { toggleMockNetwork: () => void }).toggleMockNetwork = () => setIsCorrectNetwork(v => !v);
  }, []);

  if (!isCorrectNetwork) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto p-8">
        <div className="bg-red-light text-red-dark p-4 rounded-full mb-6">
          <WarningCircle size={32} weight="fill" />
        </div>
        <h2 className="text-xl font-serif mb-2">Wrong Network</h2>
        <p className="text-muted mb-6">
          This application requires the Monad network. Please switch networks in your wallet to continue.
        </p>
        <button 
          onClick={() => setIsCorrectNetwork(true)}
          className="px-6 py-3 bg-foreground text-background rounded-button hover:bg-[#333] transition-all font-medium"
        >
          Switch to Monad
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
