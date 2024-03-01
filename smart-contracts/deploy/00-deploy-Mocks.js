const { network } = require("hardhat");
const { INITIAL_ANSWER } = require("../helper-hardhat-config");

const DECIMALS = 8;

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (chainId == 31337) {
    log("Local network detected! Deploying mocks...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true, // For all the info
      args: [DECIMALS, INITIAL_ANSWER],
    });
    log("Mocks deployed!");
    log("---------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
