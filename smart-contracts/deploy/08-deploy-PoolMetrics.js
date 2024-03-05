const { developmentChains } = require("../helper-hardhat-config");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async () => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  log("Getting the addresses of tokens...");
  //GET THE TOKENS AND ADDRESSES
  const ethPriceFeedAddress = "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7";
  const poolTracker = await ethers.getContract("PoolTracker", deployer);

  args = [poolTracker.target, ethPriceFeedAddress];

  const blockConfirmations = developmentChains.includes(network.name) ? 0 : 6;
  log("Deploying...");
  const poolMetrics = await deploy("PoolMetrics", {
    log: true,
    from: deployer,
    waitConfirmations: blockConfirmations,
    args: args,
  });
  log("Deployed!!!");

  if (!developmentChains.includes(network.name)) {
    log("Verifying...");
    await verify(
      poolMetrics.address,
      args,
      "contracts/Dex/PoolMetrics.sol:PoolMetrics"
    );
  }
};

module.exports.tags = ["all", "onChainMetrics", "poolMetrics", "bsc"];
