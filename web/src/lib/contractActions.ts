/**
 * contractActions.ts
 *
 * Real contract interaction layer for Monad CoFund using viem.
 * Interacts directly with the on-chain MonadCoFund contract on Monad Testnet.
 */

import { parseEther, formatEther, decodeEventLog, createWalletClient, custom, ContractFunctionArgs } from "viem";
import { publicClient, monadTestnet } from "./wagmi";
import { monadCoFundABI, MONAD_COFUND_ADDRESS } from "./contracts/MonadCoFund";
import type { Fund, Member, Category, Proposal } from "./types";

interface WindowWithEthereum {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  };
}

function toMON(wei: bigint): number {
  return parseFloat(formatEther(wei));
}

function getWalletClient() {
  if (typeof window === "undefined" || !(window as WindowWithEthereum).ethereum) {
    throw new Error("No EVM wallet detected");
  }
  const eth = (window as WindowWithEthereum).ethereum;
  return createWalletClient({
    chain: monadTestnet,
    transport: custom(eth as Parameters<typeof custom>[0]),
  });
}

type WriteFunctionName =
  | "createFund"
  | "joinFund"
  | "deposit"
  | "createCategory"
  | "createProposal"
  | "approveProposal"
  | "executeProposal";

async function sendTransaction(
  functionName: WriteFunctionName,
  args: ContractFunctionArgs<typeof monadCoFundABI, "nonpayable" | "payable", WriteFunctionName>,
  value?: bigint
) {
  const walletClient = getWalletClient();
  const [account] = await walletClient.getAddresses();
  if (!account) throw new Error("Wallet not connected");

  const hash = await walletClient.writeContract({
    address: MONAD_COFUND_ADDRESS,
    abi: monadCoFundABI,
    functionName,
    args,
    value,
    account,
  } as unknown as Parameters<typeof walletClient.writeContract>[0]);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status === "reverted") throw new Error("Transaction reverted on-chain");
  return { hash, receipt };
}

// ─── READ: FULL FUND DATA ─────────────────────────────────────────────────

export async function getFundData(fundId: number): Promise<Fund> {
  const id = BigInt(fundId);

  const [rawFund, rawMembers, rawCategories, rawProposals] = await Promise.all([
    publicClient.readContract({
      address: MONAD_COFUND_ADDRESS,
      abi: monadCoFundABI,
      functionName: "getFund",
      args: [id],
    }),
    publicClient.readContract({
      address: MONAD_COFUND_ADDRESS,
      abi: monadCoFundABI,
      functionName: "getMembers",
      args: [id],
    }),
    publicClient.readContract({
      address: MONAD_COFUND_ADDRESS,
      abi: monadCoFundABI,
      functionName: "getCategories",
      args: [id],
    }),
    publicClient.readContract({
      address: MONAD_COFUND_ADDRESS,
      abi: monadCoFundABI,
      functionName: "getProposals",
      args: [id],
    }),
  ]);

  let connectedAddress: string | undefined;
  if (typeof window !== "undefined" && (window as WindowWithEthereum).ethereum) {
    try {
      const accounts = (await (window as WindowWithEthereum).ethereum?.request({
        method: "eth_accounts",
      })) as string[];
      if (accounts && accounts.length > 0) connectedAddress = accounts[0].toLowerCase();
    } catch {}
  }

  // Fetch contributions for each member in parallel
  const contributionAmounts = await Promise.all(
    (rawMembers as readonly `0x${string}`[]).map((addr) =>
      publicClient.readContract({
        address: MONAD_COFUND_ADDRESS,
        abi: monadCoFundABI,
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

// ─── READ: HAS APPROVED ───────────────────────────────────────────────────

export async function hasApprovedProposal(
  fundId: number,
  proposalId: number,
  member: `0x${string}`
): Promise<boolean> {
  return publicClient.readContract({
    address: MONAD_COFUND_ADDRESS,
    abi: monadCoFundABI,
    functionName: "hasApproved",
    args: [BigInt(fundId), BigInt(proposalId), member],
  }) as Promise<boolean>;
}

// ─── READ: IS MEMBER ──────────────────────────────────────────────────────

export async function checkIsMember(fundId: number, wallet: `0x${string}`): Promise<boolean> {
  return publicClient.readContract({
    address: MONAD_COFUND_ADDRESS,
    abi: monadCoFundABI,
    functionName: "isMember",
    args: [BigInt(fundId), wallet],
  }) as Promise<boolean>;
}

// ─── READ: FUND COUNT ─────────────────────────────────────────────────────

export async function getFundCount(): Promise<number> {
  const count = await publicClient.readContract({
    address: MONAD_COFUND_ADDRESS,
    abi: monadCoFundABI,
    functionName: "getFundCount",
    args: [],
  });
  return Number(count);
}

export async function getAllFundData(): Promise<Fund[]> {
  const count = await getFundCount();
  if (count === 0) return [];

  return Promise.all(
    Array.from({ length: count }, (_, index) => getFundData(index + 1))
  );
}

export async function getFundSummaries(): Promise<Fund[]> {
  const count = await getFundCount();
  if (count === 0) return [];

  const rawFunds = await Promise.all(
    Array.from({ length: count }, (_, index) =>
      publicClient.readContract({
        address: MONAD_COFUND_ADDRESS,
        abi: monadCoFundABI,
        functionName: "getFund",
        args: [BigInt(index + 1)],
      })
    )
  );

  return rawFunds.map((rawFund) => {
    const fund = rawFund as {
      id: bigint; name: string; purpose: string; target: bigint; balance: bigint;
      approvalThreshold: bigint; creator: `0x${string}`;
    };
    return {
      id: Number(fund.id),
      name: fund.name,
      purpose: fund.purpose,
      target: toMON(fund.target),
      balance: toMON(fund.balance),
      approvalThreshold: Number(fund.approvalThreshold),
      creator: fund.creator,
      members: [],
      categories: [],
      proposals: [],
    };
  });
}

// ─── WRITE: CREATE FUND ───────────────────────────────────────────────────

export async function createFund(data: {
  name: string;
  purpose: string;
  target: number;
  threshold: number;
}): Promise<{ success: boolean; fundId: number; txHash: string }> {
  const { hash, receipt } = await sendTransaction("createFund", [
    data.name,
    data.purpose,
    parseEther(data.target.toString()),
    BigInt(data.threshold),
  ]);

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
  const { hash } = await sendTransaction("joinFund", [BigInt(fundId)]);
  return { success: true, txHash: hash };
}

// ─── WRITE: DEPOSIT ───────────────────────────────────────────────────────

export async function deposit(
  fundId: number,
  amount: number
): Promise<{ success: boolean; txHash: string }> {
  const { hash } = await sendTransaction(
    "deposit",
    [BigInt(fundId)],
    parseEther(amount.toString())
  );
  return { success: true, txHash: hash };
}

// ─── WRITE: CREATE CATEGORY ───────────────────────────────────────────────

export async function createCategory(
  fundId: number,
  name: string,
  budget: number
): Promise<{ success: boolean; categoryId: number; txHash: string }> {
  const { hash, receipt } = await sendTransaction("createCategory", [
    BigInt(fundId),
    name,
    parseEther(budget.toString()),
  ]);

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
  const { hash } = await sendTransaction("createProposal", [
    BigInt(data.fundId),
    BigInt(data.categoryId),
    data.recipient as `0x${string}`,
    parseEther(data.amount.toString()),
    data.purpose,
  ]);
  return { success: true, txHash: hash };
}

// ─── WRITE: APPROVE PROPOSAL ──────────────────────────────────────────────

export async function approveProposal(
  fundId: number,
  proposalId: number
): Promise<{ success: boolean; txHash: string }> {
  const { hash } = await sendTransaction("approveProposal", [
    BigInt(fundId),
    BigInt(proposalId),
  ]);
  return { success: true, txHash: hash };
}

// ─── WRITE: EXECUTE PROPOSAL ──────────────────────────────────────────────

export async function executeProposal(
  fundId: number,
  proposalId: number
): Promise<{ success: boolean; txHash: string }> {
  const { hash } = await sendTransaction("executeProposal", [
    BigInt(fundId),
    BigInt(proposalId),
  ]);
  return { success: true, txHash: hash };
}
