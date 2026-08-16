# Monad CoFund

Monad CoFund is a shared treasury for groups.

Create a fund, invite members, collect MON, set spending categories, and approve payments together. Funds are held and managed by a smart contract on Monad Testnet - not by one person.

## Try the live app

[Open Monad CoFund](https://monad-cofund-jade.vercel.app/)

You will need a Web3 wallet such as MetaMask or Brave Wallet, connected to **Monad Testnet**.

### Monad Testnet settings

| Setting | Value |
|---|---|
| Network | Monad Testnet |
| Chain ID | `10143` |
| Currency | MON |
| RPC URL | `https://testnet-rpc.monad.xyz` |
| Explorer | [MonadVision](https://testnet.monadvision.com/) |

You can get testnet MON from the [Monad faucet](https://faucet.monad.xyz/).

## How to use it

1. Open the live app and connect your wallet.
2. Create a CoFund with a name, purpose, target, and approval threshold.
3. Add budget categories such as Travel, Food, or Accommodation.
4. Share the fund link with your group.
5. Members join and contribute MON to the treasury.
6. Create spending proposals under a category.
7. Members approve the proposal.
8. Execute the payment once the approval threshold is reached.

Every contribution, approval, and payment is recorded on Monad Testnet.

## Deployed contract

**MonadCoFund:** `0x87a58B3D8c50735BEdBa2C8868932F12Cd659c54`

[View the contract on MonadVision](https://testnet.monadvision.com/address/0x87a58B3D8c50735BEdBa2C8868932F12Cd659c54)

The contract is verified and the frontend connects to this deployed address and its ABI.

## Why CoFund?

Groups should not need to trust one person with everyone's money. CoFund makes the rules visible and enforceable:

- No single person can withdraw funds without the required approvals.
- Spending is limited by the treasury balance and category budgets.
- Members and transactions can be checked on-chain.
- Multiple independent funds can live in one contract.

## About the build

Monad CoFund was built by an 18-year-old builder from Kerala for the **Monad Blitz V5 hackathon** - as a practical experiment in making group money management more transparent and collaborative.

## Disclaimer

This app runs on Monad Testnet and is intended for experimentation and demonstration. Testnet MON has no real-world value. Do not use real funds or rely on the software for production financial activity.
