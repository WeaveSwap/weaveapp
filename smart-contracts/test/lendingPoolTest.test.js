const { getNamedAccounts, ethers } = require("hardhat");
const { assert, expect } = require("chai");

describe("LendingAndBorrowingTest", () => {
  let deployer,
    simpleToken,
    lendingTracker,
    lendingPool,
    user,
    mintAmount,
    priceAggregator,
    borrowingTracker;
  beforeEach("", async () => {
    //GET THE ACCOUNTS AND SET VARIABLES
    mintAmount = ethers.parseEther("1000");
    deployer = (await getNamedAccounts()).deployer;
    const accounts = ethers.getSigners();
    user = accounts[1];
    await deployments.fixture(["all", "tokens", "Lendingpool"]);

    //GET THE CONTRACTS
    simpleToken = await ethers.getContract("TestToken1", deployer);
    lendingPool = await ethers.getContract("Pool", deployer);
    lendingTracker = await ethers.getContract("LendingTracker", deployer);
    priceAggregator = await ethers.getContract("MockV3Aggregator", deployer);
    borrowingTracker = await ethers.getContract("BorrowingTracker", deployer);
  });
  describe("Token part", () => {
    it("Mints the tokens", async () => {
      const deployerBalanceToken1 = await simpleToken.balanceOf(deployer);
      assert.equal(deployerBalanceToken1, mintAmount);
    });
  });
  describe("LendingTracker", () => {
    describe("Deploys the new pool contracts", () => {
      beforeEach(async () => {
        await lendingTracker.addBorrowingContract(borrowingTracker.target);
        await lendingTracker.addTokenPool(simpleToken.target, deployer);
      });
      it("Adds pool to a mapping", async () => {
        const mappingResult = await lendingTracker.tokenToPool(
          simpleToken.target
        );
        expect(mappingResult.priceAddress).to.equal(deployer);
      });
      it("Pool variables", async () => {
        const mappingResult = await lendingTracker.tokenToPool(
          simpleToken.target
        );
        const lendingPoolContract = await ethers.getContractAt(
          "Pool",
          mappingResult.poolAddress
        );
        expect(await lendingPoolContract.ownerContract()).to.equal(
          lendingTracker.target
        );
        expect(await lendingPoolContract.token()).to.equal(simpleToken.target);
      });
      it("Pool interaction constrictions", async () => {
        const mappingResult = await lendingTracker.tokenToPool(
          simpleToken.target
        );
        const lendingPoolContract = await ethers.getContractAt(
          "Pool",
          mappingResult.poolAddress
        );
        await expect(lendingPoolContract.lend(mintAmount)).to.be.reverted;
      });
      it("ChangePriceFeed", async () => {
        await lendingTracker.changePriceFeed(
          simpleToken.target,
          simpleToken.target
        );
        const mappingResult = await lendingTracker.tokenToPool(
          simpleToken.target
        );

        expect(mappingResult.priceAddress).to.equal(simpleToken.target);
      });
    });
    describe("lendToken", () => {
      beforeEach(async () => {
        await lendingTracker.addBorrowingContract(borrowingTracker.target);
        await lendingTracker.addTokenPool(simpleToken.target, deployer);
        await simpleToken.approve(lendingTracker.target, mintAmount);
        await lendingTracker.lendToken(
          simpleToken.target,
          ethers.parseEther("500")
        );
      });
      it("Reverts if token not available", async () => {
        await expect(
          lendingTracker.lendToken(deployer, ethers.parseEther("10"))
        ).to.be.reverted;
      });
      it("Updates the balances", async () => {
        const mappingResult = await lendingTracker.tokenToPool(
          simpleToken.target
        );
        const lendingPoolContract = await ethers.getContractAt(
          "Pool",
          mappingResult.poolAddress
        );
        expect(
          await simpleToken.balanceOf(lendingPoolContract.target)
        ).to.equal(ethers.parseEther("500"));
        expect(await simpleToken.balanceOf(lendingTracker.target)).to.equal(
          ethers.parseEther("0")
        );
        expect(await simpleToken.balanceOf(deployer)).to.equal(
          ethers.parseEther("500")
        );
      });
      it("Updates the mapping", async () => {
        const userTokens = await lendingTracker.userLendedTokens(deployer, 0);
        expect(userTokens).to.equal(simpleToken.target);
      });
      it("Updates reserve in the pool", async () => {
        const mappingResult = await lendingTracker.tokenToPool(
          simpleToken.target
        );
        const lendingPoolContract = await ethers.getContractAt(
          "Pool",
          mappingResult.poolAddress
        );
        expect(await lendingPoolContract.reserve()).to.equal(
          ethers.parseEther("500")
        );
      });
      it("WithdrawLendedToken", async () => {
        const mappingResult = await lendingTracker.tokenToPool(
          simpleToken.target
        );
        const lendingPoolContract = await ethers.getContractAt(
          "Pool",
          mappingResult.poolAddress
        );
        expect(await lendingPoolContract.reserve()).to.equal(
          ethers.parseEther("500")
        );
        expect(await simpleToken.balanceOf(deployer)).to.equal(
          ethers.parseEther("500")
        );
        await lendingTracker.withdrawLendedToken(
          simpleToken.target,
          ethers.parseEther("500")
        );
        expect(await lendingPoolContract.reserve()).to.equal("0");
        expect(await simpleToken.balanceOf(deployer)).to.equal(mintAmount);
      });
    });
    describe("Collateral", async () => {
      beforeEach(async () => {
        await lendingTracker.addBorrowingContract(borrowingTracker.target);
      });
      it("Reverts if pool doesnt exist", async () => {
        await simpleToken.approve(lendingTracker.target, mintAmount);
        await expect(
          borrowingTracker.stakeCollateral(simpleToken.target, mintAmount)
        ).to.be.reverted;
      });
      it("Reverts if the price is under 100", async () => {
        await lendingTracker.addTokenPool(simpleToken.target, priceAggregator);
        await simpleToken.approve(
          borrowingTracker.target,
          ethers.parseEther("2")
        );
        await expect(
          borrowingTracker.stakeCollateral(
            simpleToken.target,
            ethers.parseEther("1")
          )
        ).to.be.reverted;
        await borrowingTracker.stakeCollateral(
          simpleToken.target,
          ethers.parseEther("2")
        );
      });
      it("Stakes the collateral", async () => {
        await lendingTracker.addTokenPool(simpleToken.target, priceAggregator);
        await simpleToken.approve(borrowingTracker.target, mintAmount);
        await borrowingTracker.stakeCollateral(simpleToken.target, mintAmount);
        expect(await simpleToken.balanceOf(borrowingTracker.target)).to.equal(
          mintAmount
        );
        expect(
          await borrowingTracker.collateral(deployer, simpleToken.target)
        ).to.equal(mintAmount);
        expect(await borrowingTracker.collateralTokens(deployer, 0)).to.equal(
          simpleToken.target
        );
      });
      it("unstakes the collateral", async () => {
        await lendingTracker.addTokenPool(simpleToken.target, priceAggregator);
        await simpleToken.approve(borrowingTracker.target, mintAmount);
        await borrowingTracker.stakeCollateral(simpleToken.target, mintAmount);
        await borrowingTracker.unstakeCollateral(
          simpleToken.target,
          mintAmount
        );
        expect(await simpleToken.balanceOf(borrowingTracker.target)).to.equal(
          "0"
        );
        expect(await simpleToken.balanceOf(deployer)).to.equal(mintAmount);
        await expect(borrowingTracker.collateralTokens(deployer, 0)).to.be
          .reverted;
        expect(
          await borrowingTracker.collateral(deployer, simpleToken.target)
        ).to.equal("0");
      });
    });
    describe("Borrow", () => {
      let lendingPoolContract;
      beforeEach(async () => {
        await lendingTracker.addBorrowingContract(borrowingTracker.target);
        await lendingTracker.addTokenPool(simpleToken.target, priceAggregator);
        await simpleToken.approve(lendingTracker.target, mintAmount);
        await lendingTracker.lendToken(
          simpleToken.target,
          ethers.parseEther("500")
        );
        const mappingResult = await lendingTracker.tokenToPool(
          simpleToken.target
        );
        lendingPoolContract = await ethers.getContractAt(
          "Pool",
          mappingResult.poolAddress
        );
      });
      it("Reverts it pool is not available", async () => {
        await expect(
          borrowingTracker.borrowToken(deployer, ethers.parseEther("10"))
        ).to.be.reverted;
      });
      it("Updates mappings", async () => {
        await simpleToken.approve(
          borrowingTracker.target,
          ethers.parseEther("30")
        );
        await borrowingTracker.stakeCollateral(
          simpleToken.target,
          ethers.parseEther("20")
        );

        const borrowingId = await borrowingTracker.borrowingId(deployer);
        const deployerBalanceBefore = await simpleToken.balanceOf(deployer);
        await borrowingTracker.borrowToken(
          simpleToken.target,
          ethers.parseEther("10")
        );
        const deployerBalanceAfter = await simpleToken.balanceOf(deployer);
        expect(await borrowingTracker.borrowedTokens(deployer, 0)).to.equal(
          simpleToken.target
        );
        expect(
          await borrowingTracker.userBorrowReceipts(
            deployer,
            simpleToken.target,
            0
          )
        ).to.equal(borrowingId);
        expect(
          (await borrowingTracker.borrowReceiptData(deployer, borrowingId))
            .amount
        ).to.equal(ethers.parseEther("10"));
        expect(
          (await borrowingTracker.borrowReceiptData(deployer, borrowingId))
            .tokenAddress
        ).to.equal(simpleToken.target);
        expect(
          (await borrowingTracker.borrowReceiptData(deployer, borrowingId)).apy
        ).to.equal("0");
        expect(deployerBalanceBefore + ethers.parseEther("10")).to.equal(
          deployerBalanceAfter
        );
        expect(
          await simpleToken.balanceOf(lendingPoolContract.target)
        ).to.equal(ethers.parseEther("490"));
      });
      it("Reverts if treshold is too high", async () => {
        await simpleToken.approve(
          borrowingTracker.target,
          ethers.parseEther("100")
        );
        await borrowingTracker.stakeCollateral(
          simpleToken.target,
          ethers.parseEther("20")
        );
        await expect(
          borrowingTracker.borrowToken(
            simpleToken.target,
            ethers.parseEther("15")
          )
        ).to.be.reverted;
        await borrowingTracker.borrowToken(
          simpleToken.target,
          ethers.parseEther("10")
        );
        expect(
          await borrowingTracker.liquidityTreshold(
            deployer,
            "0x0000000000000000000000000000000000000000",
            "0"
          )
        ).to.equal(BigInt(50));
        expect(
          await borrowingTracker.liquidityTreshold(
            deployer,
            simpleToken.target,
            ethers.parseEther("10")
          )
        ).to.equal(BigInt(100));
        await expect(
          borrowingTracker.borrowToken(
            simpleToken.target,
            ethers.parseEther("5")
          )
        ).to.be.reverted;
      });
      it("Accrued interest", async () => {
        await simpleToken.approve(
          borrowingTracker.target,
          ethers.parseEther("100")
        );
        await borrowingTracker.stakeCollateral(
          simpleToken.target,
          ethers.parseEther("20")
        );
        const borrowingId = await borrowingTracker.borrowingId(deployer);
        await borrowingTracker.borrowToken(
          simpleToken.target,
          ethers.parseEther("10")
        );
        expect(
          await borrowingTracker.accruedInterest(
            borrowingId,
            deployer,
            ethers.parseEther("10")
          )
        ).to.equal("0");
      });
      it("Returns borrowed tokens", async () => {
        await simpleToken.approve(
          borrowingTracker.target,
          ethers.parseEther("100")
        );
        await borrowingTracker.stakeCollateral(
          simpleToken.target,
          ethers.parseEther("20")
        );
        const borrowingId = await borrowingTracker.borrowingId(deployer);
        await borrowingTracker.borrowToken(
          simpleToken.target,
          ethers.parseEther("10")
        );
        const deployerBalanceBefore = await simpleToken.balanceOf(deployer);
        await borrowingTracker.returnBorrowedToken(
          borrowingId,
          ethers.parseEther("10")
        );
        const deployerBalanceAfter = await simpleToken.balanceOf(deployer);
        await expect(borrowingTracker.borrowedTokens(deployer, 0)).to.be
          .reverted;
        await expect(
          borrowingTracker.userBorrowReceipts(deployer, simpleToken.target, 0)
        ).to.be.reverted;
        expect(
          (await borrowingTracker.borrowReceiptData(deployer, borrowingId))
            .amount
        ).to.equal(ethers.parseEther("0"));
        expect(deployerBalanceBefore - ethers.parseEther("10")).to.equal(
          deployerBalanceAfter
        );
        expect(
          await simpleToken.balanceOf(lendingPoolContract.target)
        ).to.equal(ethers.parseEther("500"));
      });
    });
  });
});
