"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { monadTestnet, publicClient } from "@/lib/wagmi";

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

interface WalletContextType {
  address: `0x${string}` | null;
  isConnected: boolean;
  chainId: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
  balance: string;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  chainId: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchNetwork: async () => {},
  balance: "0",
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState("0");

  const getEthereum = (): EthereumProvider | null => {
    if (typeof window !== "undefined" && "ethereum" in window) {
      return (window as unknown as { ethereum: EthereumProvider }).ethereum;
    }
    return null;
  };

  const updateBalance = useCallback(async (addr: `0x${string}`) => {
    try {
      const bal = await publicClient.getBalance({ address: addr });
      setBalance((Number(bal) / 1e18).toFixed(4));
    } catch {
      setBalance("0");
    }
  }, []);

  const checkConnected = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) return;
    try {
      const accounts = (await ethereum.request({ method: "eth_accounts" })) as string[];
      if (accounts && accounts.length > 0) {
        const addr = accounts[0] as `0x${string}`;
        setAddress(addr);
        const chain = (await ethereum.request({ method: "eth_chainId" })) as string;
        setChainId(parseInt(chain, 16));
        updateBalance(addr);
      }
    } catch {}
  }, [updateBalance]);

  useEffect(() => {
    checkConnected();
    const ethereum = getEthereum();
    if (ethereum) {
      const handleAccountsChanged = (...args: unknown[]) => {
        const accounts = args[0] as string[];
        if (!accounts || accounts.length === 0) {
          setAddress(null);
          setBalance("0");
        } else {
          const addr = accounts[0] as `0x${string}`;
          setAddress(addr);
          updateBalance(addr);
        }
      };

      const handleChainChanged = (...args: unknown[]) => {
        const chain = args[0] as string;
        setChainId(parseInt(chain, 16));
      };

      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", handleChainChanged);

      return () => {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [checkConnected, updateBalance]);

  const connectWallet = async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      alert("Please install MetaMask or another EVM wallet to connect.");
      return;
    }
    try {
      const accounts = (await ethereum.request({ method: "eth_requestAccounts" })) as string[];
      if (accounts && accounts.length > 0) {
        const addr = accounts[0] as `0x${string}`;
        setAddress(addr);
        const chain = (await ethereum.request({ method: "eth_chainId" })) as string;
        setChainId(parseInt(chain, 16));
        updateBalance(addr);
      }
    } catch (err: unknown) {
      console.error("Wallet connection failed:", err);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setBalance("0");
  };

  const switchNetwork = async () => {
    const ethereum = getEthereum();
    if (!ethereum) return;
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${monadTestnet.id.toString(16)}` }],
      });
    } catch (switchError: unknown) {
      const err = switchError as { code?: number };
      if (err.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${monadTestnet.id.toString(16)}`,
                chainName: monadTestnet.name,
                nativeCurrency: monadTestnet.nativeCurrency,
                rpcUrls: monadTestnet.rpcUrls.default.http,
                blockExplorerUrls: [monadTestnet.blockExplorers.default.url],
              },
            ],
          });
        } catch {}
      }
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        chainId,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        balance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
export default Web3Provider;
