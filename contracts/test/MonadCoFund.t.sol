// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {MonadCoFund} from "../src/MonadCoFund.sol";

/**
 * @title MonadCoFundTest
 * @notice Comprehensive tests for MonadCoFund contract (44 test cases as specified).
 */
contract MonadCoFundTest is Test {
    MonadCoFund public cofund;

    address alice = makeAddr("alice");   // fund creator
    address bob   = makeAddr("bob");     // second member
    address carol = makeAddr("carol");   // third member
    address dave  = makeAddr("dave");    // fourth member (non-member in some tests)
    address eve   = makeAddr("eve");     // non-member

    uint256 constant ONE_MON = 1 ether;

    function setUp() public {
        cofund = new MonadCoFund();
        // Fund wallets
        vm.deal(alice, 1000 ether);
        vm.deal(bob,   1000 ether);
        vm.deal(carol, 1000 ether);
        vm.deal(dave,  1000 ether);
        vm.deal(eve,   1000 ether);
    }

    // ──────────────────────────────────────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────────────────────────────────────

    function _createFund(address creator) internal returns (uint256) {
        vm.prank(creator);
        return cofund.createFund("Goa Trip", "Shared expenses", 100 ether, 2);
    }

    function _joinFund(uint256 fundId, address member) internal {
        vm.prank(member);
        cofund.joinFund(fundId);
    }

    function _deposit(uint256 fundId, address member, uint256 amount) internal {
        vm.prank(member);
        cofund.deposit{value: amount}(fundId);
    }

    function _createCategory(uint256 fundId, address creator, string memory name, uint256 budget)
        internal
        returns (uint256)
    {
        vm.prank(creator);
        return cofund.createCategory(fundId, name, budget);
    }

    function _createProposal(
        uint256 fundId,
        address member,
        uint256 categoryId,
        address payable recipient,
        uint256 amount,
        string memory purpose
    ) internal returns (uint256) {
        vm.prank(member);
        return cofund.createProposal(fundId, categoryId, recipient, amount, purpose);
    }

    function _approve(uint256 fundId, uint256 proposalId, address member) internal {
        vm.prank(member);
        cofund.approveProposal(fundId, proposalId);
    }

    function _execute(uint256 fundId, uint256 proposalId, address executor) internal {
        vm.prank(executor);
        cofund.executeProposal(fundId, proposalId);
    }

    // ──────────────────────────────────────────────────────────────────────
    // 1. FUND CREATION
    // ──────────────────────────────────────────────────────────────────────

    function test_CreateFund_Success() public {
        vm.prank(alice);
        uint256 fundId = cofund.createFund("Goa Trip", "Shared expenses", 100 ether, 2);
        assertEq(fundId, 1);

        MonadCoFund.Fund memory f = cofund.getFund(1);
        assertEq(f.name, "Goa Trip");
        assertEq(f.purpose, "Shared expenses");
        assertEq(f.target, 100 ether);
        assertEq(f.approvalThreshold, 2);
        assertEq(f.creator, alice);
        assertEq(f.balance, 0);
    }

    function test_CreateFund_CreatorBecomesMember() public {
        uint256 fundId = _createFund(alice);
        assertTrue(cofund.isMember(fundId, alice));
        assertEq(cofund.getFund(fundId).memberCount, 1);
    }

    function test_CreateFund_FundIdsIncrement() public {
        _createFund(alice);
        _createFund(bob);
        assertEq(cofund.fundCount(), 2);
        assertEq(cofund.getFund(1).creator, alice);
        assertEq(cofund.getFund(2).creator, bob);
    }

    function test_CreateFund_InvalidThreshold_Reverts() public {
        vm.prank(alice);
        vm.expectRevert(MonadCoFund.InvalidThreshold.selector);
        cofund.createFund("Test", "Test", 0, 0);
    }

    function test_CreateFund_EmptyName_Reverts() public {
        vm.prank(alice);
        vm.expectRevert(MonadCoFund.EmptyString.selector);
        cofund.createFund("", "Purpose", 0, 1);
    }

    function test_CreateFund_EmptyPurpose_Reverts() public {
        vm.prank(alice);
        vm.expectRevert(MonadCoFund.EmptyString.selector);
        cofund.createFund("Name", "", 0, 1);
    }

    // ──────────────────────────────────────────────────────────────────────
    // 2. MEMBERS
    // ──────────────────────────────────────────────────────────────────────

    function test_JoinFund_Success() public {
        uint256 fundId = _createFund(alice);
        _joinFund(fundId, bob);
        assertTrue(cofund.isMember(fundId, bob));
        assertEq(cofund.getFund(fundId).memberCount, 2);
    }

    function test_JoinFund_DuplicateJoin_Reverts() public {
        uint256 fundId = _createFund(alice);
        _joinFund(fundId, bob);
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(MonadCoFund.AlreadyMember.selector, fundId, bob));
        cofund.joinFund(fundId);
    }

    function test_NonMember_CannotDeposit() public {
        uint256 fundId = _createFund(alice);
        vm.prank(eve);
        vm.expectRevert(abi.encodeWithSelector(MonadCoFund.NotMember.selector, fundId, eve));
        cofund.deposit{value: 1 ether}(fundId);
    }

    function test_NonMember_CannotCreateProposal() public {
        uint256 fundId = _createFund(alice);
        _deposit(fundId, alice, 10 ether);
        uint256 catId = _createCategory(fundId, alice, "Food", 10 ether);

        vm.prank(eve);
        vm.expectRevert(abi.encodeWithSelector(MonadCoFund.NotMember.selector, fundId, eve));
        cofund.createProposal(fundId, catId, payable(eve), 1 ether, "Dinner");
    }

    function test_NonMember_CannotApprove() public {
        uint256 fundId = _createFund(alice);
        _joinFund(fundId, bob);
        _deposit(fundId, alice, 10 ether);
        uint256 catId = _createCategory(fundId, alice, "Food", 10 ether);
        uint256 propId = _createProposal(fundId, alice, catId, payable(carol), 1 ether, "Dinner");

        vm.prank(eve);
        vm.expectRevert(abi.encodeWithSelector(MonadCoFund.NotMember.selector, fundId, eve));
        cofund.approveProposal(fundId, propId);
    }

    // ──────────────────────────────────────────────────────────────────────
    // 3. DEPOSITS
    // ──────────────────────────────────────────────────────────────────────

    function test_Deposit_ValidDeposit() public {
        uint256 fundId = _createFund(alice);
        _deposit(fundId, alice, 10 ether);
        assertEq(cofund.getFund(fundId).balance, 10 ether);
    }

    function test_Deposit_BalanceIncreases() public {
        uint256 fundId = _createFund(alice);
        _joinFund(fundId, bob);
        _deposit(fundId, alice, 10 ether);
        _deposit(fundId, bob, 5 ether);
        assertEq(cofund.getFund(fundId).balance, 15 ether);
    }

    function test_Deposit_ContributionIncreases() public {
        uint256 fundId = _createFund(alice);
        _deposit(fundId, alice, 10 ether);
        _deposit(fundId, alice, 5 ether);
        assertEq(cofund.getContribution(fundId, alice), 15 ether);
    }

    function test_Deposit_ZeroDeposit_Reverts() public {
        uint256 fundId = _createFund(alice);
        vm.prank(alice);
        vm.expectRevert(MonadCoFund.InvalidAmount.selector);
        cofund.deposit{value: 0}(fundId);
    }

    function test_Deposit_FundsIsolated() public {
        uint256 fund1 = _createFund(alice);
        vm.prank(bob);
        uint256 fund2 = cofund.createFund("Fund2", "Second", 0, 1);

        _deposit(fund1, alice, 10 ether);
        _deposit(fund2, bob, 5 ether);

        assertEq(cofund.getFund(fund1).balance, 10 ether);
        assertEq(cofund.getFund(fund2).balance, 5 ether);
    }

    // ──────────────────────────────────────────────────────────────────────
    // 4. CATEGORIES
    // ──────────────────────────────────────────────────────────────────────

    function test_CreateCategory_CreatorCanCreate() public {
        uint256 fundId = _createFund(alice);
        uint256 catId = _createCategory(fundId, alice, "Villa", 40 ether);
        assertEq(catId, 1);

        MonadCoFund.Category memory c = cofund.getCategory(fundId, catId);
        assertEq(c.name, "Villa");
        assertEq(c.allocated, 40 ether);
        assertEq(c.spent, 0);
    }

    function test_CreateCategory_NonCreator_Reverts() public {
        uint256 fundId = _createFund(alice);
        _joinFund(fundId, bob);

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(MonadCoFund.OnlyCreator.selector, fundId, bob));
        cofund.createCategory(fundId, "Villa", 40 ether);
    }

    function test_CreateCategory_ZeroBudget_Reverts() public {
        uint256 fundId = _createFund(alice);
        vm.prank(alice);
        vm.expectRevert(MonadCoFund.InvalidAmount.selector);
        cofund.createCategory(fundId, "Villa", 0);
    }

    function test_CreateCategory_EmptyName_Reverts() public {
        uint256 fundId = _createFund(alice);
        vm.prank(alice);
        vm.expectRevert(MonadCoFund.EmptyString.selector);
        cofund.createCategory(fundId, "", 40 ether);
    }

    function test_CreateCategory_IsolatedBetweenFunds() public {
        uint256 fund1 = _createFund(alice);
        vm.prank(bob);
        uint256 fund2 = cofund.createFund("Fund2", "Second", 0, 1);

        _createCategory(fund1, alice, "Villa", 40 ether);
        // fund2 should have no categories
        assertEq(cofund.getCategoryCount(fund2), 0);
    }

    function test_CreateCategory_SpentInitiallyZero() public {
        uint256 fundId = _createFund(alice);
        uint256 catId = _createCategory(fundId, alice, "Villa", 40 ether);
        MonadCoFund.Category memory c = cofund.getCategory(fundId, catId);
        assertEq(c.spent, 0);
    }

    // ──────────────────────────────────────────────────────────────────────
    // 5. PROPOSALS
    // ──────────────────────────────────────────────────────────────────────

    function test_CreateProposal_Valid() public {
        uint256 fundId = _createFund(alice);
        _deposit(fundId, alice, 50 ether);
        uint256 catId = _createCategory(fundId, alice, "Villa", 40 ether);

        uint256 propId = _createProposal(fundId, alice, catId, payable(bob), 10 ether, "Villa rent");
        assertEq(propId, 1);

        MonadCoFund.Proposal memory p = cofund.getProposal(fundId, propId);
        assertEq(p.categoryId, catId);
        assertEq(p.amount, 10 ether);
        assertEq(p.recipient, bob);
        assertEq(p.purpose, "Villa rent");
        assertFalse(p.executed);
        assertEq(p.approvalCount, 0);
    }

    function test_CreateProposal_InvalidCategory_Reverts() public {
        uint256 fundId = _createFund(alice);
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(MonadCoFund.CategoryNotFound.selector, fundId, 99));
        cofund.createProposal(fundId, 99, payable(bob), 1 ether, "Test");
    }

    function test_CreateProposal_ZeroAmount_Reverts() public {
        uint256 fundId = _createFund(alice);
        uint256 catId = _createCategory(fundId, alice, "Villa", 40 ether);
        vm.prank(alice);
        vm.expectRevert(MonadCoFund.InvalidAmount.selector);
        cofund.createProposal(fundId, catId, payable(bob), 0, "Test");
    }

    function test_CreateProposal_ZeroRecipient_Reverts() public {
        uint256 fundId = _createFund(alice);
        uint256 catId = _createCategory(fundId, alice, "Villa", 40 ether);
        vm.prank(alice);
        vm.expectRevert(MonadCoFund.InvalidRecipient.selector);
        cofund.createProposal(fundId, catId, payable(address(0)), 1 ether, "Test");
    }

    function test_CreateProposal_EmptyPurpose_Reverts() public {
        uint256 fundId = _createFund(alice);
        uint256 catId = _createCategory(fundId, alice, "Villa", 40 ether);
        vm.prank(alice);
        vm.expectRevert(MonadCoFund.EmptyString.selector);
        cofund.createProposal(fundId, catId, payable(bob), 1 ether, "");
    }

    function test_CreateProposal_NonMember_Reverts() public {
        uint256 fundId = _createFund(alice);
        uint256 catId = _createCategory(fundId, alice, "Villa", 40 ether);
        vm.prank(eve);
        vm.expectRevert(abi.encodeWithSelector(MonadCoFund.NotMember.selector, fundId, eve));
        cofund.createProposal(fundId, catId, payable(bob), 1 ether, "Villa rent");
    }

    // ──────────────────────────────────────────────────────────────────────
    // 6. APPROVALS
    // ──────────────────────────────────────────────────────────────────────

    function test_Approve_MemberCanApprove() public {
        uint256 fundId = _createFund(alice);
        _joinFund(fundId, bob);
        _deposit(fundId, alice, 10 ether);
        uint256 catId = _createCategory(fundId, alice, "Food", 10 ether);
        uint256 propId = _createProposal(fundId, alice, catId, payable(carol), 1 ether, "Dinner");

        _approve(fundId, propId, alice);
        assertEq(cofund.getProposal(fundId, propId).approvalCount, 1);
        assertTrue(cofund.hasApproved(fundId, propId, alice));
    }

    function test_Approve_DuplicateApproval_Reverts() public {
        uint256 fundId = _createFund(alice);
        _joinFund(fundId, bob);
        _deposit(fundId, alice, 10 ether);
        uint256 catId = _createCategory(fundId, alice, "Food", 10 ether);
        uint256 propId = _createProposal(fundId, alice, catId, payable(carol), 1 ether, "Dinner");

        _approve(fundId, propId, alice);
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(MonadCoFund.AlreadyApproved.selector, fundId, propId, alice));
        cofund.approveProposal(fundId, propId);
    }

    function test_Approve_CountIncreases() public {
        uint256 fundId = _createFund(alice);
        _joinFund(fundId, bob);
        _deposit(fundId, alice, 10 ether);
        uint256 catId = _createCategory(fundId, alice, "Food", 10 ether);
        uint256 propId = _createProposal(fundId, alice, catId, payable(carol), 1 ether, "Dinner");

        _approve(fundId, propId, alice);
        _approve(fundId, propId, bob);
        assertEq(cofund.getProposal(fundId, propId).approvalCount, 2);
    }

    function test_Approve_ThresholdEnforced() public {
        // threshold = 2, only 1 approval → execute reverts
        uint256 fundId = _createFund(alice);
        _joinFund(fundId, bob);
        _deposit(fundId, alice, 10 ether);
        uint256 catId = _createCategory(fundId, alice, "Food", 10 ether);
        uint256 propId = _createProposal(fundId, alice, catId, payable(carol), 1 ether, "Dinner");

        _approve(fundId, propId, alice);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(MonadCoFund.ThresholdNotReached.selector, fundId, propId));
        cofund.executeProposal(fundId, propId);
    }

    // ──────────────────────────────────────────────────────────────────────
    // 7. EXECUTION
    // ──────────────────────────────────────────────────────────────────────

    function test_Execute_BeforeThreshold_Reverts() public {
        uint256 fundId = _createFund(alice);
        _joinFund(fundId, bob);
        _deposit(fundId, alice, 10 ether);
        uint256 catId = _createCategory(fundId, alice, "Food", 10 ether);
        uint256 propId = _createProposal(fundId, alice, catId, payable(carol), 1 ether, "Dinner");

        _approve(fundId, propId, alice);  // 1/2 — not enough

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(MonadCoFund.ThresholdNotReached.selector, fundId, propId));
        cofund.executeProposal(fundId, propId);
    }

    function test_Execute_InsufficientTreasury_Reverts() public {
        uint256 fundId = _createFund(alice);
        _joinFund(fundId, bob);
        _deposit(fundId, alice, 1 ether);   // only 1 MON
        uint256 catId = _createCategory(fundId, alice, "Food", 50 ether);
        uint256 propId = _createProposal(fundId, alice, catId, payable(carol), 40 ether, "Dinner");

        _approve(fundId, propId, alice);
        _approve(fundId, propId, bob);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(MonadCoFund.InsufficientTreasury.selector, fundId, 40 ether, 1 ether));
        cofund.executeProposal(fundId, propId);
    }

    function test_Execute_InsufficientCategoryBudget_Reverts() public {
        uint256 fundId = _createFund(alice);
        _joinFund(fundId, bob);
        _deposit(fundId, alice, 50 ether);
        uint256 catId = _createCategory(fundId, alice, "Food", 5 ether);  // only 5 budgeted
        uint256 propId = _createProposal(fundId, alice, catId, payable(carol), 10 ether, "Dinner");

        _approve(fundId, propId, alice);
        _approve(fundId, propId, bob);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(MonadCoFund.InsufficientCategoryBudget.selector, fundId, catId, 10 ether, 5 ether)
        );
        cofund.executeProposal(fundId, propId);
    }

    function test_Execute_TransfersCorrectAmount() public {
        uint256 fundId = _createFund(alice);
        _joinFund(fundId, bob);
        _deposit(fundId, alice, 50 ether);
        uint256 catId = _createCategory(fundId, alice, "Food", 30 ether);
        uint256 propId = _createProposal(fundId, alice, catId, payable(carol), 10 ether, "Dinner");

        _approve(fundId, propId, alice);
        _approve(fundId, propId, bob);

        uint256 carolBefore = carol.balance;
        _execute(fundId, propId, alice);
        assertEq(carol.balance, carolBefore + 10 ether);
    }

    function test_Execute_FundBalanceDecreases() public {
        uint256 fundId = _createFund(alice);
        _joinFund(fundId, bob);
        _deposit(fundId, alice, 50 ether);
        uint256 catId = _createCategory(fundId, alice, "Food", 30 ether);
        uint256 propId = _createProposal(fundId, alice, catId, payable(carol), 10 ether, "Dinner");

        _approve(fundId, propId, alice);
        _approve(fundId, propId, bob);
        _execute(fundId, propId, alice);

        assertEq(cofund.getFund(fundId).balance, 40 ether);
    }

    function test_Execute_CategorySpentIncreases() public {
        uint256 fundId = _createFund(alice);
        _joinFund(fundId, bob);
        _deposit(fundId, alice, 50 ether);
        uint256 catId = _createCategory(fundId, alice, "Food", 30 ether);
        uint256 propId = _createProposal(fundId, alice, catId, payable(carol), 10 ether, "Dinner");

        _approve(fundId, propId, alice);
        _approve(fundId, propId, bob);
        _execute(fundId, propId, alice);

        assertEq(cofund.getCategory(fundId, catId).spent, 10 ether);
    }

    function test_Execute_ProposalMarkedExecuted() public {
        uint256 fundId = _createFund(alice);
        _joinFund(fundId, bob);
        _deposit(fundId, alice, 50 ether);
        uint256 catId = _createCategory(fundId, alice, "Food", 30 ether);
        uint256 propId = _createProposal(fundId, alice, catId, payable(carol), 10 ether, "Dinner");

        _approve(fundId, propId, alice);
        _approve(fundId, propId, bob);
        _execute(fundId, propId, alice);

        assertTrue(cofund.getProposal(fundId, propId).executed);
    }

    function test_Execute_DoubleExecution_Reverts() public {
        uint256 fundId = _createFund(alice);
        _joinFund(fundId, bob);
        _deposit(fundId, alice, 50 ether);
        uint256 catId = _createCategory(fundId, alice, "Food", 30 ether);
        uint256 propId = _createProposal(fundId, alice, catId, payable(carol), 10 ether, "Dinner");

        _approve(fundId, propId, alice);
        _approve(fundId, propId, bob);
        _execute(fundId, propId, alice);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(MonadCoFund.AlreadyExecuted.selector, fundId, propId));
        cofund.executeProposal(fundId, propId);
    }

    function test_Execute_ReentrantRecipient_CannotDoubleSpend() public {
        // Deploy a reentrancy attacker
        ReentrantRecipient attacker = new ReentrantRecipient(cofund);

        uint256 fundId = _createFund(alice);
        _joinFund(fundId, bob);
        _deposit(fundId, alice, 50 ether);
        uint256 catId = _createCategory(fundId, alice, "Food", 30 ether);
        uint256 propId = _createProposal(
            fundId, alice, catId, payable(address(attacker)), 10 ether, "Attack"
        );

        _approve(fundId, propId, alice);
        _approve(fundId, propId, bob);

        // Tell attacker which fund/proposal to re-enter
        attacker.setTarget(fundId, propId);

        // Execute should succeed (ReentrancyGuard prevents double-spend)
        _execute(fundId, propId, alice);

        // Attacker should only have received once
        assertEq(address(attacker).balance, 10 ether);
        // Fund balance reduced by exactly 10 MON
        assertEq(cofund.getFund(fundId).balance, 40 ether);
    }

    // ──────────────────────────────────────────────────────────────────────
    // 8. ISOLATION
    // ──────────────────────────────────────────────────────────────────────

    function test_Isolation_FundAMoneyCannotBeSpentByFundB() public {
        uint256 fund1 = _createFund(alice);
        vm.prank(bob);
        uint256 fund2 = cofund.createFund("Fund2", "Second", 0, 1);

        _deposit(fund1, alice, 50 ether);

        // fund2 cannot spend fund1's balance
        uint256 catId2 = _createCategory(fund2, bob, "Food", 100 ether);
        uint256 propId2 = _createProposal(fund2, bob, catId2, payable(carol), 30 ether, "Steal");
        _approve(fund2, propId2, bob);

        // fund2 balance is 0, should revert
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(MonadCoFund.InsufficientTreasury.selector, fund2, 30 ether, 0));
        cofund.executeProposal(fund2, propId2);
    }

    function test_Isolation_FundACategoryCannotBeUsedByFundB() public {
        uint256 fund1 = _createFund(alice);
        vm.prank(bob);
        uint256 fund2 = cofund.createFund("Fund2", "Second", 0, 1);
        _joinFund(fund2, alice);

        _createCategory(fund1, alice, "Villa", 40 ether);  // catId=1 in fund1

        // Alice tries to use fund1's catId 1 for a fund2 proposal
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(MonadCoFund.CategoryNotFound.selector, fund2, 1));
        cofund.createProposal(fund2, 1, payable(carol), 5 ether, "Test");
    }

    function test_Isolation_FundAProposalsCannotAffectFundB() public {
        uint256 fund1 = _createFund(alice);
        _joinFund(fund1, bob);
        _deposit(fund1, alice, 50 ether);
        uint256 cat1 = _createCategory(fund1, alice, "Villa", 40 ether);
        uint256 prop1 = _createProposal(fund1, alice, cat1, payable(carol), 10 ether, "Rent");

        _approve(fund1, prop1, alice);
        _approve(fund1, prop1, bob);
        _execute(fund1, prop1, alice);

        vm.prank(bob);
        uint256 fund2 = cofund.createFund("Fund2", "Second", 0, 1);
        _deposit(fund2, bob, 20 ether);
        // fund2 balance unaffected
        assertEq(cofund.getFund(fund2).balance, 20 ether);
    }

    function test_Isolation_AccountingIndependence() public {
        uint256 fund1 = _createFund(alice);
        _joinFund(fund1, bob);
        _deposit(fund1, alice, 100 ether);
        _deposit(fund1, bob, 50 ether);

        vm.prank(carol);
        uint256 fund2 = cofund.createFund("Fund2", "Second", 0, 1);
        _deposit(fund2, carol, 200 ether);

        assertEq(cofund.getFund(fund1).balance, 150 ether);
        assertEq(cofund.getFund(fund2).balance, 200 ether);
        assertEq(cofund.getContribution(fund1, alice), 100 ether);
        assertEq(cofund.getContribution(fund1, bob), 50 ether);
        assertEq(cofund.getContribution(fund2, carol), 200 ether);
    }

    // ──────────────────────────────────────────────────────────────────────
    // EXTRA: reject untracked transfers
    // ──────────────────────────────────────────────────────────────────────

    function test_RejectDirectSend() public {
        vm.prank(alice);
        (bool success,) = address(cofund).call{value: 1 ether}("");
        assertFalse(success);
    }

    function test_GetMembers_ReturnsAllMembers() public {
        uint256 fundId = _createFund(alice);
        _joinFund(fundId, bob);
        _joinFund(fundId, carol);
        address[] memory members = cofund.getMembers(fundId);
        assertEq(members.length, 3);
        assertEq(members[0], alice);
        assertEq(members[1], bob);
        assertEq(members[2], carol);
    }

    function test_GetCategories_ReturnAllCategories() public {
        uint256 fundId = _createFund(alice);
        _createCategory(fundId, alice, "Villa", 40 ether);
        _createCategory(fundId, alice, "Travel", 25 ether);
        MonadCoFund.Category[] memory cats = cofund.getCategories(fundId);
        assertEq(cats.length, 2);
        assertEq(cats[0].name, "Villa");
        assertEq(cats[1].name, "Travel");
    }
}

// ──────────────────────────────────────────────────────────────────────────
// HELPER: Reentrancy attack contract
// ──────────────────────────────────────────────────────────────────────────
contract ReentrantRecipient {
    MonadCoFund immutable cofund;
    uint256 public targetFund;
    uint256 public targetProposal;
    bool public attacked;

    constructor(MonadCoFund _cofund) {
        cofund = _cofund;
    }

    function setTarget(uint256 fundId, uint256 proposalId) external {
        targetFund = fundId;
        targetProposal = proposalId;
    }

    receive() external payable {
        if (!attacked) {
            attacked = true;
            // Attempt to re-enter — must fail due to ReentrancyGuard
            try cofund.executeProposal(targetFund, targetProposal) {} catch {}
        }
    }
}
