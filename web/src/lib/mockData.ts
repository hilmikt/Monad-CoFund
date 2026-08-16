export interface Member {
  address: string;
  contribution: number;
  isCurrentUser: boolean;
}

export interface Proposal {
  id: number;
  purpose: string;
  amount: number;
  recipient: string;
  creator: string;
  approvals: number;
  threshold: number;
  executed: boolean;
  rejected?: boolean;
}

export interface Fund {
  id: number;
  name: string;
  purpose: string;
  target: number;
  balance: number;
  approvalThreshold: number;
  members: Member[];
  proposals: Proposal[];
}

// Initial mock state
export const CURRENT_USER_ADDRESS = "0x71A914b4f3bA9F21888B2A999";

export const MOCK_FUND: Fund = {
  id: 1,
  name: "Goa Trip",
  purpose: "Shared expenses for our Goa trip",
  target: 100,
  balance: 72,
  approvalThreshold: 2,
  members: [
    {
      address: CURRENT_USER_ADDRESS,
      contribution: 20,
      isCurrentUser: true,
    },
    {
      address: "0x8A2B09F3C6D1F91F",
      contribution: 15,
      isCurrentUser: false,
    },
    {
      address: "0x4B7C5E90123A31F4",
      contribution: 20,
      isCurrentUser: false,
    },
    {
      address: "0x92C4D2E57187D20A",
      contribution: 17,
      isCurrentUser: false,
    },
  ],
  proposals: [
    {
      id: 1,
      purpose: "Villa booking",
      amount: 30,
      recipient: "0x83A49F201C92A0B",
      creator: CURRENT_USER_ADDRESS,
      approvals: 1,
      threshold: 2,
      executed: false,
    },
    {
      id: 2,
      purpose: "Flight tickets",
      amount: 50,
      recipient: "0x12F8B3C4E5D6A7B8",
      creator: "0x8A2B09F3C6D1F91F",
      approvals: 2,
      threshold: 2,
      executed: true,
    }
  ],
};
