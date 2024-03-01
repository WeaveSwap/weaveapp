const { getNamedAccounts, deployments, ethers } = require("hardhat");
const { expect } = require("chai");
const { INITIAL_ANSWER } = require("../helper-hardhat-config");

describe("Pool tracker test", () => {
  let poolTracker,
    deployer,
    token1,
    token2,
    mintAmount,
    approveAmount,
    user,
    swapRouter,
    priceAggregator,
    token3;
  beforeEach(async () => {
    mintAmount = ethers.parseEther("1000");
    approveAmount = ethers.parseEther("1000");
    await deployments.fixture(["all", "tokens"]);
    const accounts = await ethers.getSigners();
    user = accounts[1];
    deployer = (await getNamedAccounts()).deployer;
    token1 = await ethers.getContract("TestToken1", deployer);
    token2 = await ethers.getContract("TestToken2", deployer);
    token3 = await ethers.getContract("TestToken3", deployer);
    poolTracker = await ethers.getContract("PoolTracker", deployer);
    swapRouter = await ethers.getContract("SwapRouter", deployer);
    priceAggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });
  describe("Creates a pool", () => {
    it("adds Pool to mapping", async () => {
      await token1.approve(poolTracker.target, approveAmount);
      await token2.approve(poolTracker.target, approveAmount);
      await poolTracker.createPool(
        token1.target,
        token2.target,
        mintAmount,
        mintAmount
      );
      const array = await poolTracker.poolOwner(deployer, 0);
      expect(array).to.not.equal(undefined);
      await expect(poolTracker.poolOwner(deployer, 1)).to.be.reverted;
    });
    it("emits the event", async () => {
      await token1.approve(poolTracker.target, approveAmount);
      await token2.approve(poolTracker.target, approveAmount);
      const transaction = await poolTracker.createPool(
        token1.target,
        token2.target,
        mintAmount,
        mintAmount
      );
      const txReceipt = await transaction.wait(1);
      const array = await poolTracker.poolOwner(deployer, 0);
      expect(txReceipt.logs[11].args.pool).to.equal(array);
      expect(txReceipt.logs[11].args.assetOne).to.equal(token1.target);
      expect(txReceipt.logs[11].args.assetTwo).to.equal(token2.target);
    });
    it("Enables liquidity Pool functionalities", async () => {
      await token1.approve(poolTracker.target, approveAmount);
      await token2.approve(poolTracker.target, approveAmount);
      const transaction = await poolTracker.createPool(
        token1.target,
        token2.target,
        mintAmount,
        mintAmount
      );
      const txReceipt = await transaction.wait(1);
      const poolAddress = txReceipt.logs[11].args.pool;
      const poolContract = await ethers.getContractAt(
        "LiquidityPool",
        poolAddress
      );
      expect(await poolContract.assetOneAddress()).to.equal(token1.target);
      expect(await poolContract.assetTwoAddress()).to.equal(token2.target);
    });
    it("Sets the deployer as the owner of the liquidity pool", async () => {
      await token1.approve(poolTracker.target, approveAmount);
      await token2.approve(poolTracker.target, approveAmount);
      const transaction = await poolTracker.createPool(
        token1.target,
        token2.target,
        mintAmount,
        mintAmount
      );
      const txReceipt = await transaction.wait(1);
      const poolAddress = txReceipt.logs[11].args.pool;
      const poolContract = await ethers.getContractAt(
        "LiquidityPool",
        poolAddress
      );
      expect(await poolContract.owner()).to.equal(poolTracker.target);
    });
    it("Populates the mappings and arrays", async () => {
      await token1.approve(poolTracker.target, approveAmount);
      await token2.approve(poolTracker.target, approveAmount);
      const transaction = await poolTracker.createPool(
        token1.target,
        token2.target,
        mintAmount,
        mintAmount
      );
      const txReceipt = await transaction.wait(1);
      const poolAddress = txReceipt.logs[11].args.pool;

      expect(await poolTracker.poolPairs(token1.target, 0)).to.equal(
        token2.target
      );
      expect(await poolTracker.poolPairs(token2.target, 0)).to.equal(
        token1.target
      );
      expect(await poolTracker.tokens(0)).to.equal(token1.target);
      expect(await poolTracker.tokens(1)).to.equal(token2.target);
      expect(
        await poolTracker.pairToPool(token1.target, token2.target)
      ).to.equal(poolAddress);
      expect(
        await poolTracker.pairToPool(token2.target, token1.target)
      ).to.equal(poolAddress);
      expect((await poolTracker.tokenList())[0]).to.equal(token1.target);
      expect((await poolTracker.tokenList())[1]).to.equal(token2.target);
      expect((await poolTracker.tokenList()).length).to.equal(2);
    });
    it("Revert if pool pair exists", async () => {
      await token1.approve(poolTracker.target, approveAmount);
      await token2.approve(poolTracker.target, approveAmount);
      const transaction = await poolTracker.createPool(
        token1.target,
        token2.target,
        mintAmount,
        mintAmount
      );
      await transaction.wait(1);
      await expect(
        poolTracker.createPool(
          token1.target,
          token2.target,
          mintAmount,
          mintAmount
        )
      ).to.be.reverted;
      await expect(
        poolTracker.createPool(
          token2.target,
          token1.target,
          mintAmount,
          mintAmount
        )
      ).to.be.reverted;
    });
  });
  describe("Routing", () => {
    it("Add a routing token", async () => {
      await poolTracker.addRoutingAddress(deployer, deployer);
      expect((await poolTracker.routingAddresses(0)).tokenAddress).to.equal(
        deployer
      );
      expect((await poolTracker.routingAddresses(0)).priceFeed).to.equal(
        deployer
      );
      await poolTracker.addRoutingAddress(deployer, token1);
      expect((await poolTracker.routingAddresses(0)).tokenAddress).to.equal(
        deployer
      );
      expect((await poolTracker.routingAddresses(0)).priceFeed).to.equal(
        token1.target
      );
    });
    it("Reverts if user not an owner", async () => {
      const userConnected = await poolTracker.connect(user);
      await expect(userConnected.addRoutingAddress(deployer, deployer)).to.be
        .reverted;
    });
  });
  describe("Swap", () => {
    it("Swaps directly between the test tokens", async () => {
      await token1.approve(poolTracker.target, approveAmount);
      await token2.approve(poolTracker.target, approveAmount);
      await poolTracker.createPool(
        token1.target,
        token2.target,
        ethers.parseEther("50"),
        ethers.parseEther("50")
      );
      // console.log(`Swap fee ${await poolContract.swapFee()}`);
      await token1.approve(swapRouter.target, ethers.parseEther("10"));
      const gas = ethers.parseEther("10");
      await await swapRouter.swapAsset(
        token1.target,
        token2.target,
        ethers.parseEther("10"),
        { value: gas }
      );
    });
    it("Checks mocks", async () => {
      expect((await priceAggregator.latestRoundData()).answer).to.equal(
        INITIAL_ANSWER
      );
    });
    it("Routes the best option", async () => {
      await token1.approve(poolTracker.target, approveAmount);
      await token3.approve(poolTracker.target, approveAmount);
      await poolTracker.createPool(
        token1.target,
        token3.target,
        ethers.parseEther("50"),
        ethers.parseEther("50")
      );
      await token2.approve(poolTracker.target, approveAmount);
      await token3.approve(poolTracker.target, approveAmount);
      await poolTracker.createPool(
        token2.target,
        token3.target,
        ethers.parseEther("50"),
        ethers.parseEther("50")
      );
      await poolTracker.addRoutingAddress(
        token3.target,
        priceAggregator.target
      );
      expect((await poolTracker.routingAddresses(0)).tokenAddress).to.equal(
        token3.target
      );
      expect((await poolTracker.routingAddresses(0)).priceFeed).to.equal(
        priceAggregator.target
      );
      expect(
        await poolTracker.tokenToRoute(token2.target, token1.target)
      ).to.equal(token3.target);
      expect(
        await poolTracker.tokenToRoute(token1.target, token2.target)
      ).to.equal(token3.target);
      expect(
        await poolTracker.tokenToRoute(token3.target, token1.target)
      ).to.equal("0x0000000000000000000000000000000000000000");
      await expect(poolTracker.tokenToRoute(token1.target, token1.target)).to.be
        .reverted;
    });
    it("Gets the routing price", async () => {
      await token1.approve(poolTracker.target, approveAmount);
      await token3.approve(poolTracker.target, approveAmount);
      await poolTracker.createPool(
        token1.target,
        token3.target,
        ethers.parseEther("50"),
        ethers.parseEther("50")
      );
      await token2.approve(poolTracker.target, approveAmount);
      await token3.approve(poolTracker.target, approveAmount);
      await poolTracker.createPool(
        token2.target,
        token3.target,
        ethers.parseEther("50"),
        ethers.parseEther("50")
      );
      await poolTracker.addRoutingAddress(
        token3.target,
        priceAggregator.target
      );
      expect((await poolTracker.routingAddresses(0)).tokenAddress).to.equal(
        token3.target
      );
      expect((await poolTracker.routingAddresses(0)).priceFeed).to.equal(
        priceAggregator.target
      );
      //Direct swap
      const pool13 = await poolTracker.pairToPool(token1.target, token3.target);
      const pool13Contract = await ethers.getContractAt(
        "LiquidityPool",
        pool13
      );
      async function returnPrice(token, poolContract, inputAmount) {
        const price = await poolContract.getSwapQuantity(
          token.target,
          inputAmount
        );
        return price;
      }
      expect(
        await swapRouter.getSwapAmount(
          token1.target,
          token3.target,
          ethers.parseEther("1")
        )
      ).to.equal(
        await returnPrice(token1, pool13Contract, ethers.parseEther("1"))
      );
      const pool23 = await poolTracker.pairToPool(token2.target, token3.target);
      const pool23Contract = await ethers.getContractAt(
        "LiquidityPool",
        pool23
      );
      expect(
        await swapRouter.getSwapAmount(
          token2.target,
          token3.target,
          ethers.parseEther("1")
        )
      ).to.equal(
        await returnPrice(token2, pool23Contract, ethers.parseEther("1"))
      );
      // Routing through token3
      const price12 = await returnPrice(
        token3,
        pool23Contract,
        await returnPrice(token1, pool13Contract, ethers.parseEther("1"))
      );
      expect(
        await swapRouter.getSwapAmount(
          token1.target,
          token2.target,
          ethers.parseEther("1")
        )
      ).to.equal(price12);
    });
    it("Swaps indirectly between the test tokens", async () => {
      await token1.approve(poolTracker.target, approveAmount);
      await token3.approve(poolTracker.target, approveAmount);
      await poolTracker.createPool(
        token1.target,
        token3.target,
        ethers.parseEther("50"),
        ethers.parseEther("50")
      );
      await token2.approve(poolTracker.target, approveAmount);
      await token3.approve(poolTracker.target, approveAmount);
      await poolTracker.createPool(
        token2.target,
        token3.target,
        ethers.parseEther("50"),
        ethers.parseEther("50")
      );
      await poolTracker.addRoutingAddress(
        token3.target,
        priceAggregator.target
      );
      expect((await poolTracker.routingAddresses(0)).tokenAddress).to.equal(
        token3.target
      );
      expect((await poolTracker.routingAddresses(0)).priceFeed).to.equal(
        priceAggregator.target
      );
      //Indirect swap
      async function getBalance(token) {
        const balance = await token.balanceOf(deployer);
        return balance;
      }
      //Balances before the swap
      expect(await getBalance(token1)).to.equal(ethers.parseEther("950"));
      expect(await getBalance(token2)).to.equal(ethers.parseEther("950"));
      expect(await getBalance(token3)).to.equal(ethers.parseEther("900"));
      const swap1Output = await swapRouter.getSwapAmount(
        token1.target,
        token3.target,
        ethers.parseEther("1")
      );
      const swap2Output = await swapRouter.getSwapAmount(
        token1.target,
        token3.target,
        swap1Output
      );
      await token1.approve(swapRouter.target, ethers.parseEther("1"));
      await swapRouter.swapAsset(
        token1.target,
        token2.target,
        ethers.parseEther("1"),
        { value: ethers.parseEther("1") }
      );
      //Balances after the swap
      expect(await getBalance(token1)).to.equal(
        ethers.parseEther("950") - ethers.parseEther("1")
      );
      expect(await getBalance(token2)).to.equal(
        ethers.parseEther("950") + swap2Output
      );
      expect(await getBalance(token3)).to.equal(ethers.parseEther("900"));
      expect(await token1.balanceOf(token1)).to.equal("0");
      expect(await token2.balanceOf(token2)).to.equal("0");
      expect(await token3.balanceOf(token3)).to.equal("0");
      //Pool balances
      const pool13 = await poolTracker.pairToPool(token1.target, token3.target);
      const pool23 = await poolTracker.pairToPool(token2.target, token3.target);

      expect(await token1.balanceOf(pool13)).to.equal(ethers.parseEther("51"));
      expect(await token3.balanceOf(pool13)).to.equal(
        ethers.parseEther("50") - swap1Output
      );
      expect(await token3.balanceOf(pool23)).to.equal(
        ethers.parseEther("50") + swap1Output
      );
      expect(await token2.balanceOf(pool23)).to.equal(
        ethers.parseEther("50") - swap2Output
      );
      // Reverts if user wants to trade same token
      await expect(
        swapRouter.swapAsset(
          token1.target,
          token1.target,
          ethers.parseEther("1")
        )
      ).to.be.reverted;
      await expect(
        swapRouter.getSwapAmount(
          token1.target,
          token1.target,
          ethers.parseEther("1")
        )
      ).to.be.reverted;
    });
  });
});
