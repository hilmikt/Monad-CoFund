export interface Member {
  address: string;
  contribution: number;
  isCurrentUser: boolean;
}

export interface Category {
  id: number;
  name: string;
  allocated: number;
  spent: number;
}

export interface Proposal {
  id: number;
  categoryId: number;
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
  categories: Category[];
  proposals: Proposal[];
}

// Initial mock state
export const CURRENT_USER_ADDRESS = "0x71A914b4f3bA9F21888B2A999";

export const MOCK_FUND: Fund = {
  id: 1,
  name: "Goa Trip",
  purpose: "Shared expenses for our Goa trip",
  target: 100,
  balance: 100, // Total treasury MON contributed
  approvalThreshold: 3,
  members: [
    {
      address: CURRENT_USER_ADDRESS,
      contribution: 30,
      isCurrentUser: true,
    },
    {
      address: "0x8A2B09F3C6D1F91F",
      contribution: 25,
      isCurrentUser: false,
    },
    {
      address: "0x4B7C5E90123A31F4",
      contribution: 25,
      isCurrentUser: false,
    },
    {
      address: "0x92C4D2E57187D20A",
      contribution: 20,
      isCurrentUser: false,
    },
  ],
  categories: [
    {
      id: 1,
      name: "Villa",
      allocated: 40,
      spent: 30,
    },
    {
      id: 2,
      name: "Travel",
      allocated: 25,
      spent: 10,
    },
    {
      id: 3,
      name: "Food",
      allocated: 20,
      spent: 5,
    },
    {
      id: 4,
      name: "Activities",
      allocated: 15,
      spent: 0,
    },
  ],
  proposals: [
    {
      id: 1,
      categoryId: 1,
      purpose: "Beach Villa Booking",
      amount: 30,
      recipient: "0x83A49F201C92A0B",
      creator: CURRENT_USER_ADDRESS,
      approvals: 2,
      threshold: 3,
      executed: false,
    },
    {
      id: 2,
      categoryId: 2,
      purpose: "Train Tickets",
      amount: 10,
      recipient: "0x12F8B3C4E5D6A7B8",
      creator: "0x8A2B09F3C6D1F91F",
      approvals: 3,
      threshold: 3,
      executed: false,
    },
    {
      id: 3,
      categoryId: 3,
      purpose: "Welcome Dinner",
      amount: 5,
      recipient: "0x987A6B5C4D3E2F10",
      creator: "0x4B7C5E90123A31F4",
      approvals: 3,
      threshold: 3,
      executed: true,
    },
  ],
};
