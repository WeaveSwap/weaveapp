const { developmentChains } = require("../helper-hardhat-config");
const { network, getNamedAccounts, deployments } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async () => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  const token1 = await ethers.getContract("TestToken1", deployer);

  args = [token1.target];

  const blockConfirmations = developmentChains.includes(network.name) ? 0 : 6;
  log("Deploying...");
  const pool = await deploy("Pool", {
    log: true,
    from: deployer,
    waitConfirmations: blockConfirmations,
    args: args,
  });
  log("Deployed!!!");

  if (!developmentChains.includes(network.name)) {
    log("Verifying...");
    await verify(pool.address, args, "contracts/Lending/pool.sol:pool");
  }
};

module.exports.tags = ["Lending", "Lendingpool"];
