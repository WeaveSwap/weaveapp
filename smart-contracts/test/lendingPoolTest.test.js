const { getNamedAccounts, ethers } = require("hardhat");
const { assert, expect } = require("chai");

describe("LendingAndBorrowingTest", () => {
  let deployer,
    simpleToken,
    lendingTracker,
    lendingPool,
    user,
    mintAmount,
    priceAggregator;
  beforeEach("", async () => {
    //GET THE ACCOUNTS AND SET VARIABLES
    mintAmount = ethers.parseEther("1000");
    deployer = (await getNamedAccounts()).deployer;
    const accounts = ethers.getSigners();
    user = accounts[1];
    await deployments.fixture(["all", "tokens", "Lendingpool"]);

    //GET THE CONTRACTS
    simpleToken = await ethers.getContract("TestToken1", deployer);
    lendingPool = await ethers.getContract("Lending", deployer);
    lendingTracker = await ethers.getContract("LendingTracker", deployer);
    priceAggregator = await ethers.getContract("MockV3Aggregator", deployer);
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
          "Lending",
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
          "Lending",
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
          "Lending",
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
          "Lending",
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
          "Lending",
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
      it("Reverts if pool doesnt exist", async () => {
        await simpleToken.approve(lendingTracker.target, mintAmount);
        await expect(
          lendingTracker.stakeCollateral(simpleToken.target, mintAmount)
        ).to.be.reverted;
      });
      it("Stakes the collateral", async () => {
        await lendingTracker.addTokenPool(simpleToken.target, deployer);
        await simpleToken.approve(lendingTracker.target, mintAmount);
        await lendingTracker.stakeCollateral(simpleToken.target, mintAmount);
        expect(await simpleToken.balanceOf(lendingTracker.target)).to.equal(
          mintAmount
        );
        expect(
          await lendingTracker.collateral(deployer, simpleToken.target)
        ).to.equal(mintAmount);
        expect(await lendingTracker.collateralTokens(deployer, 0)).to.equal(
          simpleToken.target
        );
      });
      it("unstakes the collateral", async () => {
        await lendingTracker.addTokenPool(simpleToken.target, deployer);
        await simpleToken.approve(lendingTracker.target, mintAmount);
        await lendingTracker.stakeCollateral(simpleToken.target, mintAmount);
        await lendingTracker.unstakeCollateral(simpleToken.target, mintAmount);
        expect(await simpleToken.balanceOf(lendingTracker.target)).to.equal(
          "0"
        );
        expect(await simpleToken.balanceOf(deployer)).to.equal(mintAmount);
        expect(await lendingTracker.collateralTokens(deployer, 0)).to.be
          .reverted;
        expect(
          await lendingTracker.collateral(deployer, simpleToken.target)
        ).to.equal("0");
      });
      it("Terminates collateral", async () => {
        await lendingTracker.addTokenPool(simpleToken.target, deployer);
        await simpleToken.approve(lendingTracker.target, mintAmount);
        await lendingTracker.stakeCollateral(simpleToken.target, mintAmount);
      });
    });
    describe("Borrow", () => {
      beforeEach(async () => {
        await lendingTracker.addTokenPool(simpleToken.target, deployer);
        await simpleToken.approve(lendingTracker.target, mintAmount);
        await lendingTracker.lendToken(
          simpleToken.target,
          ethers.parseEther("500")
        );
      });
      it("Reverts it pool is not available", async () => {
        await expect(
          lendingTracker.borrowToken(deployer, ethers.parseEther("10"))
        ).to.be.reverted;
      });
      // it("loan to value too high", async () => {
      //     // Cant check
      // })
      // it("Updates mappings", async () => {
      //     await lendingTracker.borrowToken(simpleToken.target, ethers.parseEther("10"))
      //     expect(await lendingTracker.borrowedTokens(deployer, 0)).to.equal(
      //         simpleToken.target
      //     )
      //     expect(await lendingTracker.borrowed(deployer, simpleToken.target)).to.equal(
      //         ethers.parseEther("10")
      //     )
      // })
      // it("Updates balances", async () => {
      //     await lendingTracker.borrowToken(simpleToken.target, ethers.parseEther("10"))
      //     expect(await simpleToken.balanceOf(deployer)).to.equal(ethers.parseEther("510"))
      //     expect(await simpleToken.balanceOf(lendingTracker.target)).to.equal(
      //         ethers.parseEther("490")
      //     )
      // })
    });
  });
});
