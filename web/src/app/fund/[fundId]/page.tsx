"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@/components/Web3Providers";
import { Fund } from "@/lib/types";
import { getFundData, checkIsMember } from "@/lib/contractActions";
import { mockGetFund } from "@/lib/mockActions";
import { MONAD_COFUND_ADDRESS } from "@/lib/contracts/MonadCoFund";
import FundSummary from "@/components/FundSummary";
import CategoryList from "@/components/CategoryList";
import MemberList from "@/components/MemberList";
import ProposalCard from "@/components/ProposalCard";
import ContributionForm from "@/components/ContributionForm";
import ProposalForm from "@/components/ProposalForm";
import JoinFundButton from "@/components/JoinFundButton";
import CreateCategoryForm from "@/components/CreateCategoryForm";
import { Copy, Plus, Users, Wallet, FolderPlus, Warning } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export default function FundDashboard() {
  const params = useParams();
  const fundId = Number(params?.fundId) || 1;
  const { address, isConnected } = useWallet();

  const [fund, setFund] = useState<Fund | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContractLive, setIsContractLive] = useState(false);
  const [isMember, setIsMember] = useState(false);

  // Forms accordion states
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const isContractConfigured =
    MONAD_COFUND_ADDRESS !== "0x0000000000000000000000000000000000000000";

  const loadFund = useCallback(async () => {
    if (isContractConfigured) {
      try {
        const data = await getFundData(fundId);
        setFund(data);
        setIsContractLive(true);

        if (address) {
          const memberStatus = await checkIsMember(fundId, address);
          setIsMember(memberStatus);
        }
        setLoading(false);
        return;
      } catch (err) {
        console.warn("Contract read failed, falling back to mock state:", err);
      }
    }

    try {
      const mockData = await mockGetFund();
      setFund(mockData);
      setIsContractLive(false);
      setIsMember(true);
    } catch {
      setError("Unable to load fund details.");
    } finally {
      setLoading(false);
    }
  }, [fundId, address, isContractConfigured]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (isContractConfigured) {
        try {
          const data = await getFundData(fundId);
          if (!ignore) {
            setFund(data);
            setIsContractLive(true);
            if (address) {
              const memberStatus = await checkIsMember(fundId, address);
              setIsMember(memberStatus);
            }
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Contract read failed, falling back to mock state:", err);
        }
      }

      try {
        const mockData = await mockGetFund();
        if (!ignore) {
          setFund(mockData);
          setIsContractLive(false);
          setIsMember(true);
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setError("Unable to load fund details.");
          setLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [fundId, address, isContractConfigured]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-4 text-muted">
          <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
          <span className="font-mono text-sm uppercase tracking-widest">Loading Treasury...</span>
        </div>
      </div>
    );
  }

  if (error || !fund) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <Warning size={48} className="mx-auto text-muted mb-4" />
        <h2 className="text-2xl font-serif mb-2">Fund Not Found</h2>
        <p className="text-muted text-sm mb-6">{error || "This fund does not exist on-chain."}</p>
        <button
          onClick={() => loadFund()}
          className="px-6 py-2.5 bg-foreground text-background font-medium rounded-button text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const isCreator =
    address && fund.creator && address.toLowerCase() === fund.creator.toLowerCase();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Invite link copied to clipboard!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Network / Mode Banner */}
      {!isContractConfigured && (
        <div className="p-4 bg-surface-secondary border border-border rounded-card text-xs font-mono text-muted flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-dark animate-ping" />
            <span>
              <strong>Demo Mode:</strong> Deploy contract to Monad Testnet and set{" "}
              <code>NEXT_PUBLIC_CONTRACT_ADDRESS</code> in <code>web/.env.local</code>.
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest bg-surface-secondary border border-border px-2.5 py-1 rounded-pill text-muted">
              Fund #{fund.id}
            </span>
            {isContractLive && (
              <span className="text-[10px] font-mono uppercase tracking-widest bg-green-light text-green-dark border border-green-light px-2.5 py-1 rounded-pill">
                Live on Monad Testnet
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight mb-2 uppercase">{fund.name}</h1>
          <p className="text-muted text-base max-w-xl">{fund.purpose}</p>
        </div>
        <div className="flex items-center gap-3 text-sm font-medium">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-surface-secondary border border-border rounded-pill text-xs font-mono">
            <Users weight="fill" size={14} /> {fund.members.length} Members
          </span>
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-surface border border-border rounded-pill hover:bg-surface-secondary transition-colors cursor-pointer text-xs font-mono shadow-subtle"
          >
            <Copy size={14} /> Copy Invite Link
          </button>
        </div>
      </div>

      {/* Membership Check for live contract */}
      {isContractLive && isConnected && !isMember && (
        <JoinFundButton fundId={fund.id} onJoined={loadFund} />
      )}

      {/* Main Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-10">
          
          {/* Treasury Hero */}
          <FundSummary fund={fund} />

          {/* Budget Categories */}
          <div>
            <CategoryList categories={fund.categories} />
            {isCreator && (
              <button
                onClick={() => {
                  setIsCategoryOpen(!isCategoryOpen);
                  setIsContributeOpen(false);
                  setIsProposalOpen(false);
                }}
                className="mt-3 text-xs font-mono text-muted hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <FolderPlus size={14} /> {isCategoryOpen ? "Close category form" : "+ Add another category"}
              </button>
            )}
          </div>

          {/* Add Category Form (Creator only) */}
          {isCategoryOpen && (
            <div className="bg-surface border border-border rounded-card shadow-subtle overflow-hidden animate-in fade-in slide-in-from-top-4">
              <CreateCategoryForm
                fundId={fund.id}
                onComplete={() => {
                  setIsCategoryOpen(false);
                  loadFund();
                }}
              />
            </div>
          )}
          
          {/* Action Triggers */}
          <div className="grid sm:grid-cols-2 gap-4">
            <button 
              onClick={() => {
                setIsContributeOpen(!isContributeOpen);
                setIsProposalOpen(false);
                setIsCategoryOpen(false);
              }}
              className={cn(
                "py-4 font-medium rounded-button transition-all border flex items-center justify-center gap-2 text-sm shadow-subtle hover:scale-[0.99] active:scale-[0.98]",
                isContributeOpen 
                  ? "bg-foreground text-background border-foreground" 
                  : "bg-surface border-border hover:bg-surface-secondary"
              )}
            >
              <Wallet weight="bold" size={18} /> Contribute MON
            </button>
            <button 
              onClick={() => {
                setIsProposalOpen(!isProposalOpen);
                setIsContributeOpen(false);
                setIsCategoryOpen(false);
              }}
              className={cn(
                "py-4 font-medium rounded-button transition-all border flex items-center justify-center gap-2 text-sm shadow-subtle hover:scale-[0.99] active:scale-[0.98]",
                isProposalOpen 
                  ? "bg-foreground text-background border-foreground" 
                  : "bg-surface border-border hover:bg-surface-secondary"
              )}
            >
              <Plus weight="bold" size={18} /> New Proposal
            </button>
          </div>

          {/* Inline Forms */}
          {isContributeOpen && (
            <div className="bg-surface border border-border rounded-card shadow-subtle overflow-hidden animate-in fade-in slide-in-from-top-4">
              <ContributionForm 
                fundId={fund.id} 
                onComplete={() => {
                  setIsContributeOpen(false);
                  loadFund();
                }} 
              />
            </div>
          )}

          {isProposalOpen && (
            <div className="bg-surface border border-border rounded-card shadow-subtle overflow-hidden animate-in fade-in slide-in-from-top-4">
              <ProposalForm 
                fund={fund} 
                onComplete={() => {
                  setIsProposalOpen(false);
                  loadFund();
                }} 
              />
            </div>
          )}

          {/* Proposals List */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl tracking-tight">Spending Proposals</h3>
              <span className="text-xs font-mono bg-surface-secondary border border-border px-2 py-1 rounded-pill">
                {fund.proposals.length} Total
              </span>
            </div>
            
            {fund.proposals.length === 0 ? (
              <div className="text-center p-12 border border-border border-dashed rounded-card bg-surface-secondary text-muted text-sm font-mono">
                No spending proposals created yet.
              </div>
            ) : (
              <div className="space-y-4">
                {[...fund.proposals].reverse().map(proposal => (
                  <ProposalCard 
                    key={proposal.id} 
                    fundId={fund.id}
                    proposal={proposal}
                    categories={fund.categories}
                    treasuryBalance={fund.balance}
                    onUpdate={loadFund}
                  />
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Sidebar */}
        <div>
          <div className="sticky top-24">
            <MemberList members={fund.members} />
          </div>
        </div>

      </div>

    </div>
  );
}
