const { developmentChains } = require("../helper-hardhat-config");
const { network, getNamedAccounts, deployments } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async () => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  log("Getting the addresses of tokens...");
  //GET THE TOKENS AND ADDRESSES
  const simpleToken = await ethers.getContract("TestToken1", deployer);
  const sampleToken = await ethers.getContract("TestToken2", deployer);
  const simpleTokenAddress = simpleToken.target;
  const sampleTokenAddress = sampleToken.target;

  args = [simpleTokenAddress, sampleTokenAddress];

  const blockConfirmations = developmentChains.includes(network.name) ? 0 : 6;
  log("Deploying...");
  const liquidityPool = await deploy("LiquidityPool", {
    log: true,
    from: deployer,
    waitConfirmations: blockConfirmations,
    args: args,
  });
  log("Deployed!!!");

  if (!developmentChains.includes(network.name)) {
    log("Verifying...");
    await verify(
      liquidityPool.address,
      args,
      "contracts/Dex/LiquidityPool.sol:LiquidityPool"
    );
  }
};

module.exports.tags = ["all", "liquidityPool", "pool"];
