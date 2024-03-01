const { developmentChains } = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  let args = [];

  const blockConfirmations = developmentChains.includes(network.name) ? 0 : 6;

  log("Deploying the contract...");
  const token1 = await deploy("TestToken1", {
    args: args,
    log: true,
    waitConfirmations: blockConfirmations,
    from: deployer,
  });
  log("The contract has been deployed!");

  if (!developmentChains.includes(network.name)) {
    await verify(
      token1.address,
      args,
      "contracts/Tokens/TestToken1.sol:TestToken1"
    );
  }

  log("Deploying the contract...");
  const token2 = await deploy("TestToken2", {
    args: args,
    log: true,
    waitConfirmations: blockConfirmations,
    from: deployer,
  });
  log("The contract has been deployed!");

  if (!developmentChains.includes(network.name)) {
    await verify(
      token2.address,
      args,
      "contracts/Tokens/TestToken2.sol:TestToken2"
    );
  }

  log("Deploying the contract...");
  const token3 = await deploy("TestToken3", {
    args: args,
    log: true,
    waitConfirmations: blockConfirmations,
    from: deployer,
  });
  log("The contract has been deployed!");

  if (!developmentChains.includes(network.name)) {
    await verify(
      token3.address,
      args,
      "contracts/Tokens/TestToken3.sol:TestToken3"
    );
  }
};

module.exports.tags = ["tokens", "token", "dex"];
