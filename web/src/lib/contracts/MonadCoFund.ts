/**
 * MonadCoFund Contract ABI + Configuration
 *
 * Set NEXT_PUBLIC_CONTRACT_ADDRESS in web/.env.local after deployment.
 * Chain: Monad Testnet (chainId: 10143)
 */

export const MONAD_COFUND_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ??
  "0x0000000000000000000000000000000000000000";

export const monadCoFundABI = [
  // ─── WRITE FUNCTIONS ────────────────────────────────────────────────────
  {
    name: "createFund",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "purpose", type: "string" },
      { name: "target", type: "uint256" },
      { name: "approvalThreshold", type: "uint256" },
    ],
    outputs: [{ name: "fundId", type: "uint256" }],
  },
  {
    name: "joinFund",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "fundId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "deposit",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "fundId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "createCategory",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "fundId", type: "uint256" },
      { name: "name", type: "string" },
      { name: "budget", type: "uint256" },
    ],
    outputs: [{ name: "categoryId", type: "uint256" }],
  },
  {
    name: "createProposal",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "fundId", type: "uint256" },
      { name: "categoryId", type: "uint256" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "purpose", type: "string" },
    ],
    outputs: [{ name: "proposalId", type: "uint256" }],
  },
  {
    name: "approveProposal",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "fundId", type: "uint256" },
      { name: "proposalId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "executeProposal",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "fundId", type: "uint256" },
      { name: "proposalId", type: "uint256" },
    ],
    outputs: [],
  },

  // ─── VIEW FUNCTIONS ─────────────────────────────────────────────────────
  {
    name: "getFund",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "fundId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "name", type: "string" },
          { name: "purpose", type: "string" },
          { name: "target", type: "uint256" },
          { name: "balance", type: "uint256" },
          { name: "approvalThreshold", type: "uint256" },
          { name: "memberCount", type: "uint256" },
          { name: "categoryCount", type: "uint256" },
          { name: "proposalCount", type: "uint256" },
          { name: "creator", type: "address" },
          { name: "exists", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "getMembers",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "fundId", type: "uint256" }],
    outputs: [{ name: "", type: "address[]" }],
  },
  {
    name: "getContribution",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "fundId", type: "uint256" },
      { name: "member", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getCategory",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "fundId", type: "uint256" },
      { name: "categoryId", type: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "name", type: "string" },
          { name: "allocated", type: "uint256" },
          { name: "spent", type: "uint256" },
          { name: "exists", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "getCategories",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "fundId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "name", type: "string" },
          { name: "allocated", type: "uint256" },
          { name: "spent", type: "uint256" },
          { name: "exists", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "getProposal",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "fundId", type: "uint256" },
      { name: "proposalId", type: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "categoryId", type: "uint256" },
          { name: "creator", type: "address" },
          { name: "recipient", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "purpose", type: "string" },
          { name: "approvalCount", type: "uint256" },
          { name: "executed", type: "bool" },
          { name: "exists", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "getProposals",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "fundId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "categoryId", type: "uint256" },
          { name: "creator", type: "address" },
          { name: "recipient", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "purpose", type: "string" },
          { name: "approvalCount", type: "uint256" },
          { name: "executed", type: "bool" },
          { name: "exists", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "getProposalCount",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "fundId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getCategoryCount",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "fundId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "hasApproved",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "fundId", type: "uint256" },
      { name: "proposalId", type: "uint256" },
      { name: "member", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "isMember",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "fundId", type: "uint256" },
      { name: "wallet", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "getFundCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "fundCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },

  // ─── EVENTS ─────────────────────────────────────────────────────────────
  {
    name: "FundCreated",
    type: "event",
    inputs: [
      { name: "fundId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "approvalThreshold", type: "uint256", indexed: false },
      { name: "target", type: "uint256", indexed: false },
    ],
  },
  {
    name: "MemberJoined",
    type: "event",
    inputs: [
      { name: "fundId", type: "uint256", indexed: true },
      { name: "member", type: "address", indexed: true },
    ],
  },
  {
    name: "DepositReceived",
    type: "event",
    inputs: [
      { name: "fundId", type: "uint256", indexed: true },
      { name: "member", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "newBalance", type: "uint256", indexed: false },
    ],
  },
  {
    name: "CategoryCreated",
    type: "event",
    inputs: [
      { name: "fundId", type: "uint256", indexed: true },
      { name: "categoryId", type: "uint256", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "budget", type: "uint256", indexed: false },
    ],
  },
  {
    name: "ProposalCreated",
    type: "event",
    inputs: [
      { name: "fundId", type: "uint256", indexed: true },
      { name: "proposalId", type: "uint256", indexed: true },
      { name: "categoryId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: false },
      { name: "recipient", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "purpose", type: "string", indexed: false },
    ],
  },
  {
    name: "ProposalApproved",
    type: "event",
    inputs: [
      { name: "fundId", type: "uint256", indexed: true },
      { name: "proposalId", type: "uint256", indexed: true },
      { name: "approver", type: "address", indexed: true },
      { name: "approvalCount", type: "uint256", indexed: false },
    ],
  },
  {
    name: "ProposalExecuted",
    type: "event",
    inputs: [
      { name: "fundId", type: "uint256", indexed: true },
      { name: "proposalId", type: "uint256", indexed: true },
      { name: "categoryId", type: "uint256", indexed: true },
      { name: "recipient", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

export const monadCoFundConfig = {
  address: MONAD_COFUND_ADDRESS,
  abi: monadCoFundABI,
} as const;
