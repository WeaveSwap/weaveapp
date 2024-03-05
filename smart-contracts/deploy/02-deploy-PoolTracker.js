const { developmentChains } = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  const yieldCalculator = await ethers.getContract("YieldCalculator");
  let args = [yieldCalculator.target];

  const blockConfirmations = developmentChains.includes(network.name) ? 0 : 6;

  log("Deploying the contract...");
  const poolTracker = await deploy("PoolTracker", {
    args: args,
    log: true,
    waitConfirmations: blockConfirmations,
    from: deployer,
  });
  log("The contract has been deployed!");

  if (!developmentChains.includes(network.name)) {
    await verify(
      poolTracker.address,
      args,
      "contracts/Dex/PoolTracker.sol:PoolTracker"
    );
  }
};

module.exports.tags = ["PoolTracker", "all", "dex", "bsc"];
