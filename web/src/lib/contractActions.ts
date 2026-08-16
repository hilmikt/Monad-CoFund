/**
 * contractActions.ts
 *
 * Real contract interaction layer for Monad CoFund.
 * Replaces the mock service layer (mockActions.ts).
 *
 * All functions accept human-readable MON amounts and convert to wei internally.
 * All bigint return values from wagmi are normalised to number/string.
 *
 * To swap back to mock (dev/testing), import from mockActions.ts instead.
 * The function signatures are intentionally identical.
 */

import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
  getAccount,
} from "@wagmi/core";
import { parseEther, formatEther, decodeEventLog } from "viem";
import { wagmiConfig, monadTestnet } from "./wagmi";
import { monadCoFundABI, MONAD_COFUND_ADDRESS } from "./contracts/MonadCoFund";
import type { Fund, Member, Category, Proposal } from "./types";

// ─── HELPERS ──────────────────────────────────────────────────────────────

function toMON(wei: bigint): number {
  return parseFloat(formatEther(wei));
}

function getConnectedAddress(): `0x${string}` {
  const { address } = getAccount(wagmiConfig);
  if (!address) throw new Error("Wallet not connected");
  return address;
}

async function sendTx(args: Parameters<typeof writeContract>[1]) {
  const hash = await writeContract(wagmiConfig, args as Parameters<typeof writeContract>[1]);
  const receipt = await waitForTransactionReceipt(wagmiConfig, { hash, chainId: monadTestnet.id });
  if (receipt.status === "reverted") throw new Error("Transaction reverted");
  return { hash, receipt };
}

// ─── READ: FULL FUND DATA ─────────────────────────────────────────────────

export async function getFundData(fundId: number): Promise<Fund> {
  const id = BigInt(fundId);

  const [rawFund, rawMembers, rawCategories, rawProposals] = await Promise.all([
    readContract(wagmiConfig, { ...monadCoFundConfig(), functionName: "getFund", args: [id] }),
    readContract(wagmiConfig, { ...monadCoFundConfig(), functionName: "getMembers", args: [id] }),
    readContract(wagmiConfig, { ...monadCoFundConfig(), functionName: "getCategories", args: [id] }),
    readContract(wagmiConfig, { ...monadCoFundConfig(), functionName: "getProposals", args: [id] }),
  ]);

  const connectedAddress = getAccount(wagmiConfig).address?.toLowerCase();

  // Fetch contributions for each member in parallel
  const contributionAmounts = await Promise.all(
    (rawMembers as readonly `0x${string}`[]).map((addr) =>
      readContract(wagmiConfig, {
        ...monadCoFundConfig(),
        functionName: "getContribution",
        args: [id, addr],
      })
    )
  );

  const members: Member[] = (rawMembers as readonly `0x${string}`[]).map((addr, i) => ({
    address: addr,
    contribution: toMON(contributionAmounts[i] as bigint),
    isCurrentUser: addr.toLowerCase() === connectedAddress,
  }));

  const categories: Category[] = (rawCategories as readonly {
    id: bigint; name: string; allocated: bigint; spent: bigint; exists: boolean;
  }[]).map((c) => ({
    id: Number(c.id),
    name: c.name,
    allocated: toMON(c.allocated),
    spent: toMON(c.spent),
  }));

  const fund = rawFund as {
    id: bigint; name: string; purpose: string; target: bigint; balance: bigint;
    approvalThreshold: bigint; memberCount: bigint; categoryCount: bigint;
    proposalCount: bigint; creator: `0x${string}`; exists: boolean;
  };

  const proposals: Proposal[] = (rawProposals as readonly {
    id: bigint; categoryId: bigint; creator: `0x${string}`; recipient: `0x${string}`;
    amount: bigint; purpose: string; approvalCount: bigint; executed: boolean; exists: boolean;
  }[]).map((p) => ({
    id: Number(p.id),
    categoryId: Number(p.categoryId),
    creator: p.creator,
    recipient: p.recipient,
    amount: toMON(p.amount),
    purpose: p.purpose,
    approvals: Number(p.approvalCount),
    threshold: Number(fund.approvalThreshold),
    executed: p.executed,
  }));

  return {
    id: Number(fund.id),
    name: fund.name,
    purpose: fund.purpose,
    target: toMON(fund.target),
    balance: toMON(fund.balance),
    approvalThreshold: Number(fund.approvalThreshold),
    creator: fund.creator,
    members,
    categories,
    proposals,
  };
}

function monadCoFundConfig() {
  return {
    address: MONAD_COFUND_ADDRESS,
    abi: monadCoFundABI,
  } as const;
}

// ─── READ: HAS APPROVED ───────────────────────────────────────────────────

export async function hasApprovedProposal(
  fundId: number,
  proposalId: number,
  member: `0x${string}`
): Promise<boolean> {
  return readContract(wagmiConfig, {
    ...monadCoFundConfig(),
    functionName: "hasApproved",
    args: [BigInt(fundId), BigInt(proposalId), member],
  }) as Promise<boolean>;
}

// ─── READ: IS MEMBER ──────────────────────────────────────────────────────

export async function checkIsMember(fundId: number, wallet: `0x${string}`): Promise<boolean> {
  return readContract(wagmiConfig, {
    ...monadCoFundConfig(),
    functionName: "isMember",
    args: [BigInt(fundId), wallet],
  }) as Promise<boolean>;
}

// ─── READ: FUND COUNT ─────────────────────────────────────────────────────

export async function getFundCount(): Promise<number> {
  const count = await readContract(wagmiConfig, {
    ...monadCoFundConfig(),
    functionName: "getFundCount",
    args: [],
  });
  return Number(count);
}

// ─── WRITE: CREATE FUND ───────────────────────────────────────────────────

export async function createFund(data: {
  name: string;
  purpose: string;
  target: number;
  threshold: number;
}): Promise<{ success: boolean; fundId: number; txHash: string }> {
  const { hash, receipt } = await sendTx({
    address: MONAD_COFUND_ADDRESS,
    abi: monadCoFundABI,
    functionName: "createFund",
    args: [
      data.name,
      data.purpose,
      parseEther(data.target.toString()),
      BigInt(data.threshold),
    ],
  });

  // Parse FundCreated event to get the fundId
  let fundId = 0;
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({ abi: monadCoFundABI, ...log });
      if (decoded.eventName === "FundCreated") {
        fundId = Number((decoded.args as { fundId: bigint }).fundId);
        break;
      }
    } catch {}
  }

  return { success: true, fundId, txHash: hash };
}

// ─── WRITE: JOIN FUND ─────────────────────────────────────────────────────

export async function joinFund(fundId: number): Promise<{ success: boolean; txHash: string }> {
  const { hash } = await sendTx({
    address: MONAD_COFUND_ADDRESS,
    abi: monadCoFundABI,
    functionName: "joinFund",
    args: [BigInt(fundId)],
  });
  return { success: true, txHash: hash };
}

// ─── WRITE: DEPOSIT ───────────────────────────────────────────────────────

export async function deposit(
  fundId: number,
  amount: number
): Promise<{ success: boolean; txHash: string }> {
  const { hash } = await sendTx({
    address: MONAD_COFUND_ADDRESS,
    abi: monadCoFundABI,
    functionName: "deposit",
    args: [BigInt(fundId)],
    value: parseEther(amount.toString()),
  });
  return { success: true, txHash: hash };
}

// ─── WRITE: CREATE CATEGORY ───────────────────────────────────────────────

export async function createCategory(
  fundId: number,
  name: string,
  budget: number
): Promise<{ success: boolean; categoryId: number; txHash: string }> {
  const { hash, receipt } = await sendTx({
    address: MONAD_COFUND_ADDRESS,
    abi: monadCoFundABI,
    functionName: "createCategory",
    args: [BigInt(fundId), name, parseEther(budget.toString())],
  });

  let categoryId = 0;
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({ abi: monadCoFundABI, ...log });
      if (decoded.eventName === "CategoryCreated") {
        categoryId = Number((decoded.args as { categoryId: bigint }).categoryId);
        break;
      }
    } catch {}
  }

  return { success: true, categoryId, txHash: hash };
}

// ─── WRITE: CREATE PROPOSAL ───────────────────────────────────────────────

export async function createProposal(data: {
  fundId: number;
  categoryId: number;
  recipient: string;
  amount: number;
  purpose: string;
}): Promise<{ success: boolean; txHash: string }> {
  const { hash } = await sendTx({
    address: MONAD_COFUND_ADDRESS,
    abi: monadCoFundABI,
    functionName: "createProposal",
    args: [
      BigInt(data.fundId),
      BigInt(data.categoryId),
      data.recipient as `0x${string}`,
      parseEther(data.amount.toString()),
      data.purpose,
    ],
  });
  return { success: true, txHash: hash };
}

// ─── WRITE: APPROVE PROPOSAL ──────────────────────────────────────────────

export async function approveProposal(
  fundId: number,
  proposalId: number
): Promise<{ success: boolean; txHash: string }> {
  const { hash } = await sendTx({
    address: MONAD_COFUND_ADDRESS,
    abi: monadCoFundABI,
    functionName: "approveProposal",
    args: [BigInt(fundId), BigInt(proposalId)],
  });
  return { success: true, txHash: hash };
}

// ─── WRITE: EXECUTE PROPOSAL ──────────────────────────────────────────────

export async function executeProposal(
  fundId: number,
  proposalId: number
): Promise<{ success: boolean; txHash: string }> {
  const { hash } = await sendTx({
    address: MONAD_COFUND_ADDRESS,
    abi: monadCoFundABI,
    functionName: "executeProposal",
    args: [BigInt(fundId), BigInt(proposalId)],
  });
  return { success: true, txHash: hash };
}

export { getConnectedAddress };
