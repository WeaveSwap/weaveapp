const { developmentChains } = require("../helper-hardhat-config");
const { network, getNamedAccounts, deployments } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async () => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  const lendingTracker = await ethers.getContract("LendingTracker", deployer);
  const lendingTrackerAddress = lendingTracker.target;
  const swapRouter = await ethers.getContract("SwapRouter", deployer);
  const swapRouterAddress = swapRouter.target;
  args = [lendingTrackerAddress, swapRouterAddress];

  const blockConfirmations = developmentChains.includes(network.name) ? 0 : 6;
  log("Deploying...");
  const borrowingTracker = await deploy("BorrowingTracker", {
    log: true,
    from: deployer,
    waitConfirmations: blockConfirmations,
    args: args,
  });
  log("Deployed!!!");

  if (!developmentChains.includes(network.name)) {
    log("Verifying...");
    await verify(
      borrowingTracker.address,
      args,
      "contracts/Lending/BorrowingTracker.sol:BorrowingTracker"
    );
  }
};

module.exports.tags = ["all", "borrowingTracker", "tracker", "lending"];
