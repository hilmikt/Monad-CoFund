# Monad CoFund

> **Pool together. Decide together. Spend together.**  
> *A group should not need to trust one person with everyone's money. They can trust the rules.*

Monad CoFund is a programmable group treasury built natively on **Monad**. A group creates one shared fund, members contribute native MON, the treasury is divided into predefined budget categories, members submit spending proposals under those categories, vote collectively to reach the approval threshold, and approved payments are executed directly and trustlessly from the smart contract.

---

## Architecture

Monad CoFund uses a **single deployed contract architecture**:

```text
MonadCoFund (Contract)
│
├── Fund #1: Goa Trip
│   ├── Treasury Balance (MON)
│   ├── Members [0xAlice, 0xBob, 0xCarol, 0xDave]
│   ├── Budget Categories:
│   │   ├── Villa (Budget: 40 MON, Spent: 30 MON)
│   │   ├── Travel (Budget: 25 MON, Spent: 10 MON)
│   │   ├── Food (Budget: 20 MON, Spent: 5 MON)
│   │   └── Activities (Budget: 15 MON, Spent: 0 MON)
│   └── Spending Proposals:
│       ├── Proposal #1: Beach Villa Booking (30 MON) → [Approved 2/3]
│       ├── Proposal #2: Train Tickets (10 MON) → [Ready to Execute 3/3]
│       └── Proposal #3: Welcome Dinner (5 MON) → [Executed]
│
├── Fund #2: Hackathon Team
└── Fund #3: ...
```

- **One Contract, Multiple Funds**: Individual funds and categories are internal data structures, not separate deployed contracts.
- **Budget Enforced On-Chain**: A proposal cannot execute unless **both** (1) enough treasury balance exists and (2) enough remaining budget exists in that category.
- **No Custodian**: No admin drain, no single wallet holding pooled funds.

---

## Monad Testnet Details

| Parameter | Value |
|---|---|
| **Chain ID** | `10143` |
| **Network Name** | `Monad Testnet` |
| **Native Token** | `MON` (18 decimals) |
| **RPC Endpoint** | `https://testnet-rpc.monad.xyz` |
| **Block Explorer** | `https://testnet.monadexplorer.com` |

---

## Smart Contract

### Source & Structure

- **Contract Path**: [`contracts/src/MonadCoFund.sol`](contracts/src/MonadCoFund.sol)
- **Solidity Version**: `^0.8.24` (with checked arithmetic and OpenZeppelin `ReentrancyGuard`)
- **Tests**: [`contracts/test/MonadCoFund.t.sol`](contracts/test/MonadCoFund.t.sol) (48 comprehensive tests covering fund creation, membership, deposits, categories, proposals, approvals, execution, reentrancy protection, and cross-fund isolation)
- **Deployment Script**: [`contracts/script/Deploy.s.sol`](contracts/script/Deploy.s.sol)

### Core Functions

- `createFund(string name, string purpose, uint256 target, uint256 approvalThreshold)`: Deploys a new CoFund. Creator is automatically member #1.
- `joinFund(uint256 fundId)`: Adds caller to member list.
- `deposit(uint256 fundId) payable`: Adds native MON to fund treasury balance.
- `createCategory(uint256 fundId, string name, uint256 budget)`: Creator sets up spending categories.
- `createProposal(uint256 fundId, uint256 categoryId, address payable recipient, uint256 amount, string purpose)`: Member proposes an expense.
- `approveProposal(uint256 fundId, uint256 proposalId)`: Member signs an approval vote.
- `executeProposal(uint256 fundId, uint256 proposalId)`: Executes payment once approval threshold is met and category budget is verified.

---

## Running Contract Tests

To run the full Foundry test suite:

```bash
cd contracts
forge test -vv
```

All 48 tests cover:
1. Fund creation and isolation
2. Member join and authorization rules
3. Native MON deposits and accounting
4. Category creation and budget allocation
5. Proposal creation and category validation
6. Approval tracking and threshold enforcement
7. Reentrancy safety and double-execution rejection
8. Cross-fund isolation (funds cannot access other funds' balances or categories)

---

## Deployment to Monad Testnet

> [!IMPORTANT]
> Do NOT commit private keys. Use `--account` with a password-protected Foundry keystore or set the `PRIVATE_KEY` environment variable in your private environment.

### Deployed Contract

- **MonadCoFund**: [`0x87a58B3D8c50735BEdBa2C8868932F12Cd659c54`](https://testnet.monadscan.com/address/0x87a58B3D8c50735BEdBa2C8868932F12Cd659c54)
- **Deployment transaction**: [`0xee055e4fb890aee2dcb558160fdc1e396f89f2fe56b444a577ef9990c93067c3`](https://testnet.monadscan.com/tx/0xee055e4fb890aee2dcb558160fdc1e396f89f2fe56b444a577ef9990c93067c3)
- **Verification**: [MonadVision Sourcify full match](https://monadvision.com/contracts/full_match/10143/0x87a58B3D8c50735BEdBa2C8868932F12Cd659c54/)

Hardhat deployment command:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network monadTestnet
```

The frontend uses the compiled `MonadCoFund` artifact ABI in `web/src/lib/contracts/MonadCoFund.ts` and the deployed address from `NEXT_PUBLIC_CONTRACT_ADDRESS`.

### 1. Set Up Deployer Wallet

Import your private key into Foundry keystore (recommended):

```bash
cast wallet import monad-deployer --interactive
```

### 2. Run Deployment Script

```bash
cd contracts

forge script script/Deploy.s.sol \
  --rpc-url https://testnet-rpc.monad.xyz \
  --account monad-deployer \
  --broadcast \
  --verify \
  --verifier sourcify \
  -vvvv
```

Or deploying with `PRIVATE_KEY` environment variable:

```bash
forge script script/Deploy.s.sol \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY \
  --broadcast \
  -vvvv
```

### 3. Verification Command (Manual if needed)

```bash
forge verify-contract \
  <DEPLOYED_CONTRACT_ADDRESS> \
  src/MonadCoFund.sol:MonadCoFund \
  --verifier sourcify
```

---

## Frontend Integration & Configuration

### 1. Environment Setup

Copy `.env.local.example` in the `web` directory:

```bash
cd web
cp .env.local.example .env.local
```

Edit `web/.env.local`:

```env
# Paste the deployed MonadCoFund address here:
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedAddressHere

# Optional WalletConnect Project ID for mobile wallet connect:
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### 2. Run Frontend Development Server

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## User Flow Walkthrough

1. **Connect Wallet**: Click "Connect Wallet" in the navbar. Connect MetaMask or any EVM wallet on Monad Testnet.
2. **Create Fund**: Go to `/create` to set up a new CoFund with a name, purpose, target, and approval threshold (e.g. 2 approvals).
3. **Add Categories**: As the fund creator, add budget buckets (e.g. "Villa: 40 MON", "Travel: 25 MON").
4. **Invite & Join**: Share the invite link with group members. They click "Join Fund" to become registered members on-chain.
5. **Deposit MON**: Members contribute MON to fund the treasury balance.
6. **Create Proposal**: Select a category, specify recipient address and MON amount. The frontend validates in real-time that the amount does not exceed category remaining budget.
7. **Approve**: Group members review the proposal and click "Approve".
8. **Execute**: Once the approval threshold is reached (e.g. 2/2 or 3/3), click "Execute Payment". The smart contract transfers MON to the recipient, decrements the treasury, increments the category spent counter, and marks the proposal `Executed`.

---

## Security & Hackathon Notes

- **Checked Math**: Built with Solidity 0.8.24 with automatic overflow/underflow protection.
- **Reentrancy Safe**: Critical state changes (`executed = true`, `balance -= amount`, `category.spent += amount`) happen before external transfer calls, guarded by OpenZeppelin `ReentrancyGuard`.
- **No Custodian / No Owner Withdrawal**: The contract creator has no special power to extract funds. The only valid spending route is through approved proposals.
- **Testnet-Only**: This software is designed for hackathon demonstration on Monad Testnet and has not undergone formal security audits.
