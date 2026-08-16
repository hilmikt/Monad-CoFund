/**
 * Shared TypeScript types for Monad CoFund.
 * These mirror the on-chain Solidity structs — mapped from uint256 to number/bigint
 * for frontend use.
 *
 * When reading from the contract via wagmi, the raw return values use bigint.
 * The contractActions.ts layer normalises them to number where appropriate.
 */

export interface Member {
  address: string;
  contribution: number; // in MON (normalised from wei)
  isCurrentUser: boolean;
}

export interface Category {
  id: number;
  name: string;
  allocated: number; // in MON
  spent: number;     // in MON
}

export interface Proposal {
  id: number;
  categoryId: number;
  purpose: string;
  amount: number;        // in MON
  recipient: string;
  creator: string;
  approvals: number;
  threshold: number;
  executed: boolean;
}

export interface Fund {
  id: number;
  name: string;
  purpose: string;
  target: number;         // in MON
  balance: number;        // in MON (current treasury)
  approvalThreshold: number;
  members: Member[];
  categories: Category[];
  proposals: Proposal[];
  creator: string;
}
