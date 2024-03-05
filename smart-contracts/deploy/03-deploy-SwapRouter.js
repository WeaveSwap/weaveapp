const { developmentChains } = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  const PoolTracker = await ethers.getContract("PoolTracker");

  let args = [PoolTracker.target];

  const blockConfirmations = developmentChains.includes(network.name) ? 0 : 6;

  log("Deploying the contract...");
  const SwapRouter = await deploy("SwapRouter", {
    args: args,
    log: true,
    waitConfirmations: blockConfirmations,
    from: deployer,
  });
  log("The contract has been deployed!");

  if (
    !developmentChains.includes(network.name)
  ) {
    await verify(
      SwapRouter.address,
      args,
      "contracts/Dex/WeaveSwap.sol:SwapRouter"
    );
  }
};

module.exports.tags = ["SwapRouter", "WeaveSwap", "all", "dex", "bsc"];
