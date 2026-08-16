const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MonadCoFund", function () {
  let cofund;
  let alice, bob, carol, dave, eve;

  beforeEach(async function () {
    [alice, bob, carol, dave, eve] = await ethers.getSigners();
    const MonadCoFund = await ethers.getContractFactory("MonadCoFund");
    cofund = await MonadCoFund.deploy();
    await cofund.waitForDeployment();
  });

  describe("1. Fund Creation", function () {
    it("should create a fund successfully", async function () {
      const tx = await cofund.connect(alice).createFund("Goa Trip", "Shared expenses", ethers.parseEther("100"), 2);
      await tx.wait();

      const f = await cofund.getFund(1);
      expect(f.name).to.equal("Goa Trip");
      expect(f.purpose).to.equal("Shared expenses");
      expect(f.target).to.equal(ethers.parseEther("100"));
      expect(f.approvalThreshold).to.equal(2n);
      expect(f.creator).to.equal(alice.address);
      expect(f.balance).to.equal(0n);
    });

    it("should make creator the first member", async function () {
      await cofund.connect(alice).createFund("Goa Trip", "Shared expenses", ethers.parseEther("100"), 2);
      expect(await cofund.isMember(1, alice.address)).to.equal(true);
      const f = await cofund.getFund(1);
      expect(f.memberCount).to.equal(1n);
    });

    it("should increment fund IDs", async function () {
      await cofund.connect(alice).createFund("Fund 1", "Purpose 1", ethers.parseEther("10"), 1);
      await cofund.connect(bob).createFund("Fund 2", "Purpose 2", ethers.parseEther("20"), 1);

      expect(await cofund.getFundCount()).to.equal(2n);
      const f1 = await cofund.getFund(1);
      const f2 = await cofund.getFund(2);
      expect(f1.creator).to.equal(alice.address);
      expect(f2.creator).to.equal(bob.address);
    });

    it("should revert if threshold is 0", async function () {
      await expect(
        cofund.connect(alice).createFund("Test", "Test", 0, 0)
      ).to.be.revertedWithCustomError(cofund, "InvalidThreshold");
    });

    it("should revert if name or purpose is empty", async function () {
      await expect(
        cofund.connect(alice).createFund("", "Test", 0, 1)
      ).to.be.revertedWithCustomError(cofund, "EmptyString");

      await expect(
        cofund.connect(alice).createFund("Test", "", 0, 1)
      ).to.be.revertedWithCustomError(cofund, "EmptyString");
    });
  });

  describe("2. Membership", function () {
    beforeEach(async function () {
      await cofund.connect(alice).createFund("Goa Trip", "Shared expenses", ethers.parseEther("100"), 2);
    });

    it("should allow a user to join", async function () {
      await cofund.connect(bob).joinFund(1);
      expect(await cofund.isMember(1, bob.address)).to.equal(true);
      const f = await cofund.getFund(1);
      expect(f.memberCount).to.equal(2n);
    });

    it("should revert if user joins twice", async function () {
      await cofund.connect(bob).joinFund(1);
      await expect(
        cofund.connect(bob).joinFund(1)
      ).to.be.revertedWithCustomError(cofund, "AlreadyMember");
    });

    it("should prevent non-members from depositing", async function () {
      await expect(
        cofund.connect(eve).deposit(1, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(cofund, "NotMember");
    });

    it("should prevent non-members from creating proposals", async function () {
      await cofund.connect(alice).createCategory(1, "Villa", ethers.parseEther("40"));
      await expect(
        cofund.connect(eve).createProposal(1, 1, bob.address, ethers.parseEther("10"), "Rent")
      ).to.be.revertedWithCustomError(cofund, "NotMember");
    });

    it("should prevent non-members from approving proposals", async function () {
      await cofund.connect(alice).createCategory(1, "Villa", ethers.parseEther("40"));
      await cofund.connect(alice).createProposal(1, 1, bob.address, ethers.parseEther("10"), "Rent");
      await expect(
        cofund.connect(eve).approveProposal(1, 1)
      ).to.be.revertedWithCustomError(cofund, "NotMember");
    });
  });

  describe("3. Treasury & Deposits", function () {
    beforeEach(async function () {
      await cofund.connect(alice).createFund("Goa Trip", "Shared expenses", ethers.parseEther("100"), 2);
      await cofund.connect(bob).joinFund(1);
    });

    it("should accept valid deposits and update balances", async function () {
      await cofund.connect(alice).deposit(1, { value: ethers.parseEther("10") });
      await cofund.connect(bob).deposit(1, { value: ethers.parseEther("5") });

      const f = await cofund.getFund(1);
      expect(f.balance).to.equal(ethers.parseEther("15"));
      expect(await cofund.getContribution(1, alice.address)).to.equal(ethers.parseEther("10"));
      expect(await cofund.getContribution(1, bob.address)).to.equal(ethers.parseEther("5"));
    });

    it("should revert zero deposit", async function () {
      await expect(
        cofund.connect(alice).deposit(1, { value: 0 })
      ).to.be.revertedWithCustomError(cofund, "InvalidAmount");
    });

    it("should isolate funds between different fund IDs", async function () {
      await cofund.connect(bob).createFund("Fund 2", "Second", 0, 1);
      await cofund.connect(alice).deposit(1, { value: ethers.parseEther("10") });
      await cofund.connect(bob).deposit(2, { value: ethers.parseEther("5") });

      expect((await cofund.getFund(1)).balance).to.equal(ethers.parseEther("10"));
      expect((await cofund.getFund(2)).balance).to.equal(ethers.parseEther("5"));
    });
  });

  describe("4. Categories / Budgets", function () {
    beforeEach(async function () {
      await cofund.connect(alice).createFund("Goa Trip", "Shared expenses", ethers.parseEther("100"), 2);
      await cofund.connect(bob).joinFund(1);
    });

    it("should allow creator to create category", async function () {
      await cofund.connect(alice).createCategory(1, "Villa", ethers.parseEther("40"));
      const cat = await cofund.getCategory(1, 1);
      expect(cat.name).to.equal("Villa");
      expect(cat.allocated).to.equal(ethers.parseEther("40"));
      expect(cat.spent).to.equal(0n);
    });

    it("should revert if non-creator tries to create category", async function () {
      await expect(
        cofund.connect(bob).createCategory(1, "Villa", ethers.parseEther("40"))
      ).to.be.revertedWithCustomError(cofund, "OnlyCreator");
    });

    it("should revert if budget is 0 or name is empty", async function () {
      await expect(
        cofund.connect(alice).createCategory(1, "Villa", 0)
      ).to.be.revertedWithCustomError(cofund, "InvalidAmount");

      await expect(
        cofund.connect(alice).createCategory(1, "", ethers.parseEther("40"))
      ).to.be.revertedWithCustomError(cofund, "EmptyString");
    });
  });

  describe("5. Proposals, Approvals & Execution", function () {
    beforeEach(async function () {
      await cofund.connect(alice).createFund("Goa Trip", "Shared expenses", ethers.parseEther("100"), 2);
      await cofund.connect(bob).joinFund(1);
      await cofund.connect(carol).joinFund(1);
      await cofund.connect(alice).createCategory(1, "Villa", ethers.parseEther("40"));
      await cofund.connect(alice).deposit(1, { value: ethers.parseEther("50") });
    });

    it("should create a proposal and track state", async function () {
      await cofund.connect(alice).createProposal(1, 1, dave.address, ethers.parseEther("10"), "Villa deposit");
      const p = await cofund.getProposal(1, 1);
      expect(p.purpose).to.equal("Villa deposit");
      expect(p.amount).to.equal(ethers.parseEther("10"));
      expect(p.recipient).to.equal(dave.address);
      expect(p.approvalCount).to.equal(0n);
      expect(p.executed).to.equal(false);
    });

    it("should allow approvals and prevent duplicate approvals", async function () {
      await cofund.connect(alice).createProposal(1, 1, dave.address, ethers.parseEther("10"), "Villa deposit");
      await cofund.connect(alice).approveProposal(1, 1);
      expect(await cofund.hasApproved(1, 1, alice.address)).to.equal(true);

      await expect(
        cofund.connect(alice).approveProposal(1, 1)
      ).to.be.revertedWithCustomError(cofund, "AlreadyApproved");

      await cofund.connect(bob).approveProposal(1, 1);
      const p = await cofund.getProposal(1, 1);
      expect(p.approvalCount).to.equal(2n);
    });

    it("should revert execution before threshold is reached", async function () {
      await cofund.connect(alice).createProposal(1, 1, dave.address, ethers.parseEther("10"), "Villa deposit");
      await cofund.connect(alice).approveProposal(1, 1);

      await expect(
        cofund.connect(alice).executeProposal(1, 1)
      ).to.be.revertedWithCustomError(cofund, "ThresholdNotReached");
    });

    it("should revert execution if category budget is exceeded", async function () {
      await cofund.connect(alice).createProposal(1, 1, dave.address, ethers.parseEther("45"), "Over budget");
      await cofund.connect(alice).approveProposal(1, 1);
      await cofund.connect(bob).approveProposal(1, 1);

      await expect(
        cofund.connect(alice).executeProposal(1, 1)
      ).to.be.revertedWithCustomError(cofund, "InsufficientCategoryBudget");
    });

    it("should execute payment correctly, transfer MON, and update treasury & category spent", async function () {
      await cofund.connect(alice).createProposal(1, 1, dave.address, ethers.parseEther("30"), "Villa booking");
      await cofund.connect(alice).approveProposal(1, 1);
      await cofund.connect(bob).approveProposal(1, 1);

      const daveBalanceBefore = await ethers.provider.getBalance(dave.address);
      await cofund.connect(alice).executeProposal(1, 1);
      const daveBalanceAfter = await ethers.provider.getBalance(dave.address);

      expect(daveBalanceAfter - daveBalanceBefore).to.equal(ethers.parseEther("30"));
      expect((await cofund.getFund(1)).balance).to.equal(ethers.parseEther("20"));
      expect((await cofund.getCategory(1, 1)).spent).to.equal(ethers.parseEther("30"));
      expect((await cofund.getProposal(1, 1)).executed).to.equal(true);
    });

    it("should revert double execution", async function () {
      await cofund.connect(alice).createProposal(1, 1, dave.address, ethers.parseEther("10"), "Villa deposit");
      await cofund.connect(alice).approveProposal(1, 1);
      await cofund.connect(bob).approveProposal(1, 1);

      await cofund.connect(alice).executeProposal(1, 1);

      await expect(
        cofund.connect(alice).executeProposal(1, 1)
      ).to.be.revertedWithCustomError(cofund, "AlreadyExecuted");
    });
  });
});
