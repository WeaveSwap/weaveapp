const { ethers, getNamedAccounts } = require("hardhat");

async function addTokenPool() {
  console.log("Connecting to the contracts...");
  const { deployer } = await getNamedAccounts();
  const lendingTracker = await ethers.getContract("LendingTracker", deployer);
  const mockPriceFeed = await ethers.getContract("MockV3Aggregator");
  const token = await ethers.getContract("TestToken3", deployer);
  console.log(`Token address ${token.target}`);
  console.log(`Mock price feed address ${mockPriceFeed.target}`);
  console.log("Connected to the contract!");

  console.log("Deploying the pool...");
  await lendingTracker.addTokenPool(token.target, mockPriceFeed.target);
  console.log("Pool deployed!");
}

addTokenPool()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
