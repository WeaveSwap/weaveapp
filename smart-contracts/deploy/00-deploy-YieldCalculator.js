const { developmentChains } = require("../helper-hardhat-config");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async () => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  log("Getting the addresses of tokens...");
  //GET THE TOKENS AND ADDRESSES
  const zkBridge = "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7";

  args = [zkBridge];

  const blockConfirmations = developmentChains.includes(network.name) ? 0 : 6;
  log("Deploying...");
  const yieldCalculator = await deploy("YieldCalculator", {
    log: true,
    from: deployer,
    waitConfirmations: blockConfirmations,
    args: args,
  });
  log("Deployed!!!");

  if (!developmentChains.includes(network.name)) {
    log("Verifying...");
    await verify(
      yieldCalculator.address,
      args,
      "contracts/Router/YieldCalculator.sol:YieldCalculator"
    );
  }
};

module.exports.tags = ["all", "yieldCalculator", "polyhedra", "bridge", "bsc"];
