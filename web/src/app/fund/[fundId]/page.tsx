"use client";

import { useEffect, useState } from "react";
import { Fund } from "@/lib/mockData";
import { mockGetFund } from "@/lib/mockActions";
import FundSummary from "@/components/FundSummary";
import CategoryList from "@/components/CategoryList";
import MemberList from "@/components/MemberList";
import ProposalCard from "@/components/ProposalCard";
import ContributionForm from "@/components/ContributionForm";
import ProposalForm from "@/components/ProposalForm";
import { Copy, Plus, Users, Wallet } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export default function FundDashboard() {
  const [fund, setFund] = useState<Fund | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals / forms state
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [isProposalOpen, setIsProposalOpen] = useState(false);

  const fetchFund = async () => {
    try {
      const data = await mockGetFund();
      setFund(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFund();
  }, []);

  if (loading || !fund) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-4 text-muted">
          <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
          <span className="font-mono text-sm uppercase tracking-widest">Loading Treasury...</span>
        </div>
      </div>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Invite link copied to clipboard!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest bg-surface-secondary border border-border px-2.5 py-1 rounded-pill text-muted">
            Monad CoFund Treasury
          </span>
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight mt-3 mb-2 uppercase">{fund.name}</h1>
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

      {/* Main Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-10">
          
          {/* Treasury Hero */}
          <FundSummary fund={fund} />

          {/* Budget Categories */}
          <CategoryList categories={fund.categories} />
          
          {/* Action Triggers */}
          <div className="grid sm:grid-cols-2 gap-4">
            <button 
              onClick={() => {
                setIsContributeOpen(!isContributeOpen);
                setIsProposalOpen(false);
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
              <ContributionForm onComplete={() => {
                setIsContributeOpen(false);
                fetchFund();
              }} />
            </div>
          )}

          {isProposalOpen && (
            <div className="bg-surface border border-border rounded-card shadow-subtle overflow-hidden animate-in fade-in slide-in-from-top-4">
              <ProposalForm fund={fund} onComplete={() => {
                setIsProposalOpen(false);
                fetchFund();
              }} />
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
                    proposal={proposal}
                    categories={fund.categories}
                    treasuryBalance={fund.balance}
                    onUpdate={fetchFund}
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
