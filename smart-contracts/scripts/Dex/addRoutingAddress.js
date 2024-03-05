const { ethers, getNamedAccounts } = require("hardhat");

async function addRoutingAddress() {
  console.log("Connecting to the contracts...");
  const { deployer } = await getNamedAccounts();
  const poolTracker = await ethers.getContract("PoolTracker", deployer);
  const routingToken = await ethers.getContract("TestToken1", deployer);
  const priceFeed = await ethers.getContract("MockV3Aggregator", deployer);
  console.log("Connected to the contract!");

  console.log("Adding a token to the route Addresses...");
  const tx = await poolTracker.addRoutingAddress(
    routingToken.target,
    priceFeed.target
  );
  await tx.wait(1);
  console.log("Token Added!");
}

addRoutingAddress()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
