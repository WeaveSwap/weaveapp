const { developmentChains } = require("../helper-hardhat-config");
const { network, getNamedAccounts, ethers } = require("hardhat");
const { assert, expect } = require("chai");
const { moveTime } = require("../utils/move-time");
const {
  days,
} = require("@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time/duration");

describe("LiquidityPoolTest", () => {
  let deployer, simpleToken, sampleToken, liquidityPool, user, mintAmount;
  beforeEach("", async () => {
    //GET THE ACCOUNTS AND SET VARIABLES
    mintAmount = ethers.parseEther("1000");
    deployer = (await getNamedAccounts()).deployer;
    const accounts = await ethers.getSigners();
    user = accounts[1];
    await deployments.fixture(["all", "tokens"]);

    //GET THE CONTRACTS
    simpleToken = await ethers.getContract("TestToken1", deployer);
    sampleToken = await ethers.getContract("TestToken2", deployer);
    liquidityPool = await ethers.getContract("LiquidityPool", deployer);
  });
  describe("Token part", () => {
    it("Mints the tokens", async () => {
      const deployerBalanceToken1 = await simpleToken.balanceOf(deployer);
      const deployerBalanceToken2 = await sampleToken.balanceOf(deployer);
      assert.equal(deployerBalanceToken1, mintAmount);
      assert.equal(deployerBalanceToken2, mintAmount);
    });
  });
  describe("Liquidity pool part", () => {
    beforeEach("Adds the initial liquidity", async () => {
      await simpleToken.approve(liquidityPool.target, mintAmount);
      await sampleToken.approve(liquidityPool.target, mintAmount);
      await liquidityPool.addInitialLiquidity(mintAmount, mintAmount);
    });
    it("Checks the initial liquidity", async () => {
      //ADDS THE LIQUIDITY
      expect(await liquidityPool.getAssetBalace(simpleToken.target)).to.equal(
        mintAmount
      );
      const liquidity = await liquidityPool.liquidity();
      expect(await liquidityPool.getLpTokenQuantity(deployer)).to.equal(
        liquidity
      );
      expect(
        (await liquidityPool.assetOnePrice()) / ethers.parseEther("1")
      ).to.equal("1");
      expect(
        (await liquidityPool.assetTwoPrice()) / ethers.parseEther("1")
      ).to.equal("1");
      expect(await liquidityPool.getAssetOne()).to.equal(mintAmount);
      expect(await liquidityPool.getAssetTwo()).to.equal(mintAmount);
    });
    it("Time checker initial liquidity", async () => {
      await expect(liquidityPool.removeLiquidity("100")).to.be.reverted;
      expect(await liquidityPool.isTimeInitialLiquidity()).to.equal(false);
      await network.provider.request({
        method: "evm_increaseTime",
        params: [31557600],
      });
      await network.provider.request({
        method: "evm_mine",
        params: [],
      });
      expect(await liquidityPool.isTimeInitialLiquidity()).to.equal(true);
    });
    it("Add additional liquidity", async () => {
      await simpleToken.mint(deployer, mintAmount);
      await sampleToken.mint(deployer, mintAmount);
      const assetBalance1Before = await simpleToken.balanceOf(deployer);
      const assetBalance2Before = await sampleToken.balanceOf(deployer);
      await simpleToken.approve(liquidityPool.target, mintAmount);
      await sampleToken.approve(liquidityPool.target, mintAmount);
      await liquidityPool.addLiquidity(
        simpleToken.target,
        sampleToken.target,
        mintAmount
      );
      const liquidity = await liquidityPool.liquidity();
      const assetBalance1After = await simpleToken.balanceOf(deployer);
      const assetBalance2After = await sampleToken.balanceOf(deployer);
      expect(assetBalance1After).to.equal(assetBalance1Before - mintAmount);
      expect(assetBalance2After).to.equal(assetBalance2Before - mintAmount);
      expect(await liquidityPool.getLpTokenQuantity(deployer)).to.equal(
        liquidity
      );
      expect(await liquidityPool.getAssetOne()).to.equal(
        ethers.parseEther("2000")
      );
      expect(await liquidityPool.getAssetTwo()).to.equal(
        ethers.parseEther("2000")
      );
      expect(
        (await liquidityPool.assetOnePrice()) / ethers.parseEther("1")
      ).to.equal("1");
      expect(
        (await liquidityPool.assetTwoPrice()) / ethers.parseEther("1")
      ).to.equal("1");
    });
    it("Removes the liquidity", async () => {
      await simpleToken.mint(deployer, mintAmount);
      await sampleToken.mint(deployer, mintAmount);
      await simpleToken.approve(liquidityPool.target, mintAmount);
      await sampleToken.approve(liquidityPool.target, mintAmount);
      await liquidityPool.addLiquidity(
        simpleToken.target,
        sampleToken.target,
        mintAmount
      );
      await expect(liquidityPool.removeLiquidity(100)).to.be.reverted; //Can't remove the initial liquidity
      await expect(liquidityPool.removeLiquidity(51)).to.be.reverted; //Can't remove the initial liquidity
      await liquidityPool.removeLiquidity(50);
      expect(await liquidityPool.getAssetOne()).to.equal(mintAmount);
      expect(await liquidityPool.getAssetTwo()).to.equal(mintAmount);
      await network.provider.request({
        method: "evm_increaseTime",
        params: [31557600],
      });
      await network.provider.request({
        method: "evm_mine",
        params: [],
      });
      await liquidityPool.removeLiquidity(100);
      expect(await liquidityPool.getAssetOne()).to.equal("0");
      expect(await liquidityPool.getAssetTwo()).to.equal("0");
    });
    it("Selling and buying", async () => {
      await simpleToken.mint(deployer, mintAmount);
      await sampleToken.mint(deployer, mintAmount);
      const gas = ethers.parseEther("10");
      await sampleToken.approve(
        liquidityPool.target,
        ethers.parseEther("1000")
      );
      await simpleToken.approve(
        liquidityPool.target,
        ethers.parseEther("1000")
      );
      await expect(liquidityPool.sellAssetTwo(ethers.parseEther("1000"))).to.be
        .reverted;
      await expect(liquidityPool.sellAssetOne(ethers.parseEther("1000"))).to.be
        .reverted;
      await liquidityPool.sellAssetTwo(ethers.parseEther("100"), {
        value: gas,
      });
      expect(
        (await liquidityPool.assetTwoPrice()).toString() /
          ethers.parseEther("1").toString()
      ).to.equal(
        (await liquidityPool.getAssetOne()).toString() /
          (await liquidityPool.getAssetTwo()).toString()
      );
      await liquidityPool.sellAssetOne(ethers.parseEther("300"), {
        value: gas,
      });
      expect(
        (
          (await liquidityPool.assetOnePrice()).toString() /
          ethers.parseEther("1").toString()
        ).toFixed(2)
      ).to.equal(
        (
          (await liquidityPool.getAssetTwo()).toString() /
          (await liquidityPool.getAssetOne()).toString()
        ).toFixed(2) // javscript calculates a little differently
      );
    });
    // it("Yield", async () => {
    //   await simpleToken.mint(deployer, mintAmount);
    //   await sampleToken.mint(deployer, mintAmount);
    //   const gas = ethers.parseEther("10");
    //   await simpleToken.approve(liquidityPool.target, mintAmount);
    //   await sampleToken.approve(liquidityPool.target, mintAmount);
    //   await liquidityPool.addLiquidity(
    //     simpleToken.target,
    //     sampleToken.target,
    //     mintAmount
    //   );
    //   await simpleToken.mint(deployer, mintAmount);
    //   await sampleToken.mint(deployer, mintAmount);
    //   await sampleToken.approve(
    //     liquidityPool.target,
    //     ethers.parseEther("1000")
    //   );
    //   await simpleToken.approve(
    //     liquidityPool.target,
    //     ethers.parseEther("1000")
    //   );
    //   await liquidityPool.sellAssetTwo(ethers.parseEther("100"), {
    //     value: gas,
    //   });
    //   // const swapFee = await liquidityPool.swapFee();
    //   // expect(await liquidityPool.yieldAmount()).to.equal(
    //   //     (ethers.parseEther("100").toString() * swapFee.toString()) / "100"
    //   // )
    //   expect(swapFee.toString()).to.equal(ethers.parseEther("0.001"));
    //   expect((await liquidityPool.yieldAmount()).toString()).to.equal(swapFee);
    //   await liquidityPool.getYield();
    //   expect((await liquidityPool.addressBalance()).toString()).to.equal("0");
    //   // expect((await liquidityPool.yieldAmount()).toString()).to.equal("0")
    //   await liquidityPool.sellAssetTwo(ethers.parseEther("100"), {
    //     value: gas,
    //   });
    //   expect((await liquidityPool.addressBalance()).toString()).to.equal(
    //     swapFee
    //   );
    //   await expect(liquidityPool.getYield()).to.be.reverted;
    //   await network.provider.request({
    //     method: "evm_increaseTime",
    //     params: [86400],
    //   });
    //   await network.provider.request({
    //     method: "evm_mine",
    //     params: [],
    //   });
    //   await liquidityPool.getYield();
    //   expect((await liquidityPool.addressBalance()).toString()).to.equal("0");
    // });
  });
});
