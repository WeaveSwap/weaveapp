const { ethers, getNamedAccounts } = require("hardhat");

async function addTokenPool(tokenAddress, priceFeed) {
  console.log("Connecting to the contracts...");
  const { deployer } = await getNamedAccounts();
  const lendingTracker = await ethers.getContract("LendingTracker", deployer);
  console.log("Connected to the contract!");

  console.log("Deploying the pool...");
  await lendingTracker.addTokenPool(tokenAddress, priceFeed);
  console.log("Pool deployed!");
}

addTokenPool()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
