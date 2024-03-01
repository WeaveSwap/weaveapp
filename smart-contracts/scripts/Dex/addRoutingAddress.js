const { ethers, getNamedAccounts } = require("hardhat");

async function addRoutingAddress(tokenAddress, priceFeed) {
  console.log("Connecting to the contracts...");
  const { deployer } = await getNamedAccounts();
  const poolTracker = await ethers.getContract("PoolTracker", deployer);
  console.log("Connected to the contract!");

  console.log("Adding a token to the route Addresses...");
  await poolTracker.addRoutingAddress(tokenAddress, priceFeed);
  console.log("Token Added!");
}

addRoutingAddress()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
