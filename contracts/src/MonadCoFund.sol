// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MonadCoFund
 * @notice A programmable group treasury on Monad.
 *         Groups create shared funds, contribute native MON, define budget categories,
 *         propose spending against those categories, vote collectively, and execute
 *         approved payments — all governed by on-chain rules, not a single custodian.
 * @dev    Single deployed contract managing multiple independent funds.
 *         No upgradeability, no owner drain, no privileged access.
 *         Only spending path: approved proposals.
 */
contract MonadCoFund is ReentrancyGuard {
    // ─────────────────────────────────────────────────────────────────────
    // STRUCTS
    // ─────────────────────────────────────────────────────────────────────

    struct Fund {
        uint256 id;
        string name;
        string purpose;
        uint256 target;       // 0 = no target
        uint256 balance;      // current accounted treasury balance
        uint256 approvalThreshold;
        uint256 memberCount;
        uint256 categoryCount;
        uint256 proposalCount;
        address creator;
        bool exists;
    }

    struct Category {
        uint256 id;
        string name;
        uint256 allocated;    // budgeted amount
        uint256 spent;        // total executed against this category
        bool exists;
    }

    struct Proposal {
        uint256 id;
        uint256 categoryId;
        address creator;
        address payable recipient;
        uint256 amount;
        string purpose;
        uint256 approvalCount;
        bool executed;
        bool exists;
    }

    // ─────────────────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────────────────

    uint256 public fundCount;

    /// fundId → Fund
    mapping(uint256 => Fund) private _funds;

    /// fundId → memberIndex → address  (for enumeration)
    mapping(uint256 => mapping(uint256 => address)) private _memberList;

    /// fundId → wallet → isMember
    mapping(uint256 => mapping(address => bool)) private _isMember;

    /// fundId → wallet → total MON contributed
    mapping(uint256 => mapping(address => uint256)) private _contributions;

    /// fundId → categoryId → Category
    mapping(uint256 => mapping(uint256 => Category)) private _categories;

    /// fundId → proposalId → Proposal
    mapping(uint256 => mapping(uint256 => Proposal)) private _proposals;

    /// fundId → proposalId → wallet → hasApproved
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) private _hasApproved;

    // ─────────────────────────────────────────────────────────────────────
    // EVENTS
    // ─────────────────────────────────────────────────────────────────────

    event FundCreated(
        uint256 indexed fundId,
        address indexed creator,
        string name,
        uint256 approvalThreshold,
        uint256 target
    );

    event MemberJoined(uint256 indexed fundId, address indexed member);

    event DepositReceived(
        uint256 indexed fundId,
        address indexed member,
        uint256 amount,
        uint256 newBalance
    );

    event CategoryCreated(
        uint256 indexed fundId,
        uint256 indexed categoryId,
        string name,
        uint256 budget
    );

    event ProposalCreated(
        uint256 indexed fundId,
        uint256 indexed proposalId,
        uint256 indexed categoryId,
        address creator,
        address recipient,
        uint256 amount,
        string purpose
    );

    event ProposalApproved(
        uint256 indexed fundId,
        uint256 indexed proposalId,
        address indexed approver,
        uint256 approvalCount
    );

    event ProposalExecuted(
        uint256 indexed fundId,
        uint256 indexed proposalId,
        uint256 indexed categoryId,
        address recipient,
        uint256 amount
    );

    // ─────────────────────────────────────────────────────────────────────
    // ERRORS
    // ─────────────────────────────────────────────────────────────────────

    error FundNotFound(uint256 fundId);
    error NotMember(uint256 fundId, address caller);
    error AlreadyMember(uint256 fundId, address caller);
    error CategoryNotFound(uint256 fundId, uint256 categoryId);
    error ProposalNotFound(uint256 fundId, uint256 proposalId);
    error InvalidThreshold();
    error InvalidAmount();
    error InvalidRecipient();
    error EmptyString();
    error AlreadyApproved(uint256 fundId, uint256 proposalId, address caller);
    error AlreadyExecuted(uint256 fundId, uint256 proposalId);
    error ThresholdNotReached(uint256 fundId, uint256 proposalId);
    error InsufficientTreasury(uint256 fundId, uint256 required, uint256 available);
    error InsufficientCategoryBudget(uint256 fundId, uint256 categoryId, uint256 required, uint256 available);
    error OnlyCreator(uint256 fundId, address caller);
    error TransferFailed();

    // ─────────────────────────────────────────────────────────────────────
    // MODIFIERS
    // ─────────────────────────────────────────────────────────────────────

    modifier fundExists(uint256 fundId) {
        if (!_funds[fundId].exists) revert FundNotFound(fundId);
        _;
    }

    modifier onlyMember(uint256 fundId) {
        if (!_isMember[fundId][msg.sender]) revert NotMember(fundId, msg.sender);
        _;
    }

    modifier onlyCreator(uint256 fundId) {
        if (_funds[fundId].creator != msg.sender) revert OnlyCreator(fundId, msg.sender);
        _;
    }

    // ─────────────────────────────────────────────────────────────────────
    // REJECT UNTRACKED TRANSFERS
    // ─────────────────────────────────────────────────────────────────────

    receive() external payable {
        revert("Use deposit()");
    }

    fallback() external payable {
        revert("Use deposit()");
    }

    // ─────────────────────────────────────────────────────────────────────
    // FUND CREATION
    // ─────────────────────────────────────────────────────────────────────

    /**
     * @notice Create a new CoFund. Caller becomes the first member.
     * @param name            Human-readable fund name
     * @param purpose         Purpose description
     * @param target          Fundraising target in wei (0 = no target)
     * @param approvalThreshold  Minimum approvals needed to execute a proposal
     */
    function createFund(
        string calldata name,
        string calldata purpose,
        uint256 target,
        uint256 approvalThreshold
    ) external returns (uint256 fundId) {
        if (bytes(name).length == 0) revert EmptyString();
        if (bytes(purpose).length == 0) revert EmptyString();
        if (approvalThreshold == 0) revert InvalidThreshold();

        fundCount++;
        fundId = fundCount;

        Fund storage f = _funds[fundId];
        f.id = fundId;
        f.name = name;
        f.purpose = purpose;
        f.target = target;
        f.balance = 0;
        f.approvalThreshold = approvalThreshold;
        f.creator = msg.sender;
        f.exists = true;

        // creator becomes first member
        _addMember(fundId, msg.sender);

        emit FundCreated(fundId, msg.sender, name, approvalThreshold, target);
    }

    // ─────────────────────────────────────────────────────────────────────
    // MEMBERSHIP
    // ─────────────────────────────────────────────────────────────────────

    /**
     * @notice Join an existing fund.
     */
    function joinFund(uint256 fundId) external fundExists(fundId) {
        if (_isMember[fundId][msg.sender]) revert AlreadyMember(fundId, msg.sender);
        _addMember(fundId, msg.sender);
        emit MemberJoined(fundId, msg.sender);
    }

    function _addMember(uint256 fundId, address member) internal {
        _isMember[fundId][member] = true;
        uint256 idx = _funds[fundId].memberCount;
        _memberList[fundId][idx] = member;
        _funds[fundId].memberCount++;
    }

    // ─────────────────────────────────────────────────────────────────────
    // TREASURY / DEPOSITS
    // ─────────────────────────────────────────────────────────────────────

    /**
     * @notice Deposit native MON into the fund treasury.
     * @dev    Caller must be a member. msg.value > 0.
     */
    function deposit(uint256 fundId)
        external
        payable
        fundExists(fundId)
        onlyMember(fundId)
    {
        if (msg.value == 0) revert InvalidAmount();

        _funds[fundId].balance += msg.value;
        _contributions[fundId][msg.sender] += msg.value;

        emit DepositReceived(fundId, msg.sender, msg.value, _funds[fundId].balance);
    }

    // ─────────────────────────────────────────────────────────────────────
    // CATEGORIES
    // ─────────────────────────────────────────────────────────────────────

    /**
     * @notice Create a spending category / budget bucket inside the fund.
     * @dev    Only the fund creator can add categories.
     */
    function createCategory(
        uint256 fundId,
        string calldata name,
        uint256 budget
    )
        external
        fundExists(fundId)
        onlyCreator(fundId)
        returns (uint256 categoryId)
    {
        if (bytes(name).length == 0) revert EmptyString();
        if (budget == 0) revert InvalidAmount();

        _funds[fundId].categoryCount++;
        categoryId = _funds[fundId].categoryCount;

        Category storage c = _categories[fundId][categoryId];
        c.id = categoryId;
        c.name = name;
        c.allocated = budget;
        c.spent = 0;
        c.exists = true;

        emit CategoryCreated(fundId, categoryId, name, budget);
    }

    // ─────────────────────────────────────────────────────────────────────
    // PROPOSALS
    // ─────────────────────────────────────────────────────────────────────

    /**
     * @notice Create a spending proposal under a category.
     */
    function createProposal(
        uint256 fundId,
        uint256 categoryId,
        address payable recipient,
        uint256 amount,
        string calldata purpose
    )
        external
        fundExists(fundId)
        onlyMember(fundId)
        returns (uint256 proposalId)
    {
        if (!_categories[fundId][categoryId].exists) revert CategoryNotFound(fundId, categoryId);
        if (recipient == address(0)) revert InvalidRecipient();
        if (amount == 0) revert InvalidAmount();
        if (bytes(purpose).length == 0) revert EmptyString();

        _funds[fundId].proposalCount++;
        proposalId = _funds[fundId].proposalCount;

        Proposal storage p = _proposals[fundId][proposalId];
        p.id = proposalId;
        p.categoryId = categoryId;
        p.creator = msg.sender;
        p.recipient = recipient;
        p.amount = amount;
        p.purpose = purpose;
        p.approvalCount = 0;
        p.executed = false;
        p.exists = true;

        emit ProposalCreated(fundId, proposalId, categoryId, msg.sender, recipient, amount, purpose);
    }

    // ─────────────────────────────────────────────────────────────────────
    // APPROVALS
    // ─────────────────────────────────────────────────────────────────────

    /**
     * @notice Approve a spending proposal.
     */
    function approveProposal(uint256 fundId, uint256 proposalId)
        external
        fundExists(fundId)
        onlyMember(fundId)
    {
        Proposal storage p = _proposals[fundId][proposalId];
        if (!p.exists) revert ProposalNotFound(fundId, proposalId);
        if (p.executed) revert AlreadyExecuted(fundId, proposalId);
        if (_hasApproved[fundId][proposalId][msg.sender]) revert AlreadyApproved(fundId, proposalId, msg.sender);

        _hasApproved[fundId][proposalId][msg.sender] = true;
        p.approvalCount++;

        emit ProposalApproved(fundId, proposalId, msg.sender, p.approvalCount);
    }

    // ─────────────────────────────────────────────────────────────────────
    // EXECUTION
    // ─────────────────────────────────────────────────────────────────────

    /**
     * @notice Execute an approved proposal — transfers MON to recipient.
     * @dev    Follows checks-effects-interactions. Protected by ReentrancyGuard.
     */
    function executeProposal(uint256 fundId, uint256 proposalId)
        external
        fundExists(fundId)
        nonReentrant
    {
        Fund storage f = _funds[fundId];
        Proposal storage p = _proposals[fundId][proposalId];

        // ── CHECKS ───────────────────────────────────────────────────────
        if (!p.exists) revert ProposalNotFound(fundId, proposalId);
        if (p.executed) revert AlreadyExecuted(fundId, proposalId);
        if (p.approvalCount < f.approvalThreshold) {
            revert ThresholdNotReached(fundId, proposalId);
        }
        if (f.balance < p.amount) {
            revert InsufficientTreasury(fundId, p.amount, f.balance);
        }

        Category storage c = _categories[fundId][p.categoryId];
        uint256 categoryRemaining = c.allocated - c.spent;
        if (p.amount > categoryRemaining) {
            revert InsufficientCategoryBudget(fundId, p.categoryId, p.amount, categoryRemaining);
        }

        // ── EFFECTS ──────────────────────────────────────────────────────
        p.executed = true;
        f.balance -= p.amount;
        c.spent += p.amount;

        // ── INTERACTIONS ─────────────────────────────────────────────────
        (bool success,) = p.recipient.call{value: p.amount}("");
        if (!success) revert TransferFailed();

        emit ProposalExecuted(fundId, proposalId, p.categoryId, p.recipient, p.amount);
    }

    // ─────────────────────────────────────────────────────────────────────
    // VIEW FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────

    function getFund(uint256 fundId) external view returns (Fund memory) {
        if (!_funds[fundId].exists) revert FundNotFound(fundId);
        return _funds[fundId];
    }

    function getMembers(uint256 fundId) external view returns (address[] memory) {
        if (!_funds[fundId].exists) revert FundNotFound(fundId);
        uint256 count = _funds[fundId].memberCount;
        address[] memory members = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            members[i] = _memberList[fundId][i];
        }
        return members;
    }

    function getContribution(uint256 fundId, address member) external view returns (uint256) {
        return _contributions[fundId][member];
    }

    function getCategory(uint256 fundId, uint256 categoryId) external view returns (Category memory) {
        if (!_categories[fundId][categoryId].exists) revert CategoryNotFound(fundId, categoryId);
        return _categories[fundId][categoryId];
    }

    function getCategories(uint256 fundId) external view returns (Category[] memory) {
        if (!_funds[fundId].exists) revert FundNotFound(fundId);
        uint256 count = _funds[fundId].categoryCount;
        Category[] memory cats = new Category[](count);
        for (uint256 i = 1; i <= count; i++) {
            cats[i - 1] = _categories[fundId][i];
        }
        return cats;
    }

    function getProposal(uint256 fundId, uint256 proposalId) external view returns (Proposal memory) {
        if (!_proposals[fundId][proposalId].exists) revert ProposalNotFound(fundId, proposalId);
        return _proposals[fundId][proposalId];
    }

    function getProposals(uint256 fundId) external view returns (Proposal[] memory) {
        if (!_funds[fundId].exists) revert FundNotFound(fundId);
        uint256 count = _funds[fundId].proposalCount;
        Proposal[] memory props = new Proposal[](count);
        for (uint256 i = 1; i <= count; i++) {
            props[i - 1] = _proposals[fundId][i];
        }
        return props;
    }

    function getProposalCount(uint256 fundId) external view returns (uint256) {
        return _funds[fundId].proposalCount;
    }

    function getCategoryCount(uint256 fundId) external view returns (uint256) {
        return _funds[fundId].categoryCount;
    }

    function hasApproved(uint256 fundId, uint256 proposalId, address member) external view returns (bool) {
        return _hasApproved[fundId][proposalId][member];
    }

    function isMember(uint256 fundId, address wallet) external view returns (bool) {
        return _isMember[fundId][wallet];
    }

    function getFundCount() external view returns (uint256) {
        return fundCount;
    }
}
