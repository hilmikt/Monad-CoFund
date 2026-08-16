import { CURRENT_USER_ADDRESS, Fund, MOCK_FUND, Proposal } from "./mockData";

/**
 * Simulates a delay for blockchain transactions.
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simple in-memory state for the mock session
let currentFundState: Fund = { 
  ...MOCK_FUND,
  members: [...MOCK_FUND.members],
  categories: [...MOCK_FUND.categories.map(c => ({ ...c }))],
  proposals: [...MOCK_FUND.proposals.map(p => ({ ...p }))],
};

/**
 * Fetch the current fund state
 */
export async function mockGetFund(): Promise<Fund> {
  await delay(600); // Simulate network load
  return currentFundState;
}

/**
 * Mock creation of a new CoFund
 */
export async function mockCreateFund(data: { name: string; purpose: string; target: number; threshold: number }) {
  await delay(2000);
  
  const newFund: Fund = {
    id: Math.floor(Math.random() * 1000),
    name: data.name,
    purpose: data.purpose,
    target: data.target,
    balance: 0,
    approvalThreshold: data.threshold,
    members: [
      {
        address: CURRENT_USER_ADDRESS,
        contribution: 0,
        isCurrentUser: true,
      }
    ],
    categories: [
      { id: 1, name: "Villa", allocated: Math.round(data.target * 0.4), spent: 0 },
      { id: 2, name: "Travel", allocated: Math.round(data.target * 0.25), spent: 0 },
      { id: 3, name: "Food", allocated: Math.round(data.target * 0.2), spent: 0 },
      { id: 4, name: "Activities", allocated: Math.round(data.target * 0.15), spent: 0 },
    ],
    proposals: [],
  };
  
  // Update in-memory mock store
  currentFundState = newFund;
  
  return {
    success: true,
    fundId: newFund.id,
    txHash: "0x" + Math.random().toString(16).slice(2, 10) + "..."
  };
}

/**
 * Mock contributing MON to the current fund
 */
export async function mockDeposit(amount: number) {
  await delay(2000); // simulate wallet confirm + pending
  
  currentFundState.balance += amount;
  
  const userMember = currentFundState.members.find(m => m.isCurrentUser);
  if (userMember) {
    userMember.contribution += amount;
  } else {
    currentFundState.members.push({
      address: CURRENT_USER_ADDRESS,
      contribution: amount,
      isCurrentUser: true,
    });
  }
  
  return {
    success: true,
    txHash: "0x" + Math.random().toString(16).slice(2, 10) + "..."
  };
}

/**
 * Mock creating a new proposal under a specific category
 */
export async function mockCreateProposal(data: { categoryId: number; recipient: string; amount: number; purpose: string }) {
  await delay(2000);
  
  const newProposal: Proposal = {
    id: currentFundState.proposals.length + 1,
    categoryId: data.categoryId,
    purpose: data.purpose,
    amount: data.amount,
    recipient: data.recipient,
    creator: CURRENT_USER_ADDRESS,
    approvals: 1, // creator automatically approves
    threshold: currentFundState.approvalThreshold,
    executed: false,
  };
  
  currentFundState.proposals.push(newProposal);
  
  return {
    success: true,
    txHash: "0x" + Math.random().toString(16).slice(2, 10) + "..."
  };
}

/**
 * Mock approving a proposal
 */
export async function mockApproveProposal(proposalId: number) {
  await delay(1800);
  
  const proposal = currentFundState.proposals.find(p => p.id === proposalId);
  if (proposal && proposal.approvals < proposal.threshold) {
    proposal.approvals += 1;
  }
  
  return {
    success: true,
    txHash: "0x" + Math.random().toString(16).slice(2, 10) + "..."
  };
}

/**
 * Mock executing a proposal
 * Increments category spent amount and decrements treasury balance.
 */
export async function mockExecuteProposal(proposalId: number) {
  await delay(2500);
  
  const proposal = currentFundState.proposals.find(p => p.id === proposalId);
  if (proposal && !proposal.executed) {
    proposal.executed = true;
    
    // Update Treasury Balance
    currentFundState.balance -= proposal.amount;
    
    // Update Category Spent
    const category = currentFundState.categories.find(c => c.id === proposal.categoryId);
    if (category) {
      category.spent += proposal.amount;
    }
  }
  
  return {
    success: true,
    txHash: "0x" + Math.random().toString(16).slice(2, 10) + "..."
  };
}
