const { ethers, getNamedAccounts } = require("hardhat");

async function balanceOfPool() {
  console.log("Connecting to the contracts...");
  const { deployer } = await getNamedAccounts();
  const lendingTracker = await ethers.getContract("LendingTracker", deployer);
  const token1 = await ethers.getContract("TestToken1", deployer);
  const token2 = await ethers.getContract("TestToken2", deployer);
  const token3 = await ethers.getContract("TestToken3", deployer);
  console.log("Connected to the contract!");

  const pool1 = (await lendingTracker.tokenToPool(token1.target)).poolAddress;
  const pool2 = (await lendingTracker.tokenToPool(token2.target)).poolAddress;
  const pool3 = (await lendingTracker.tokenToPool(token3.target)).poolAddress;

  console.log("Lending pool balances:");
  console.log(`Token1 balance ${await token1.balanceOf(pool1)}`);
  console.log(`Token2 balance ${await token2.balanceOf(pool2)}`);
  console.log(`Token3 balance ${await token3.balanceOf(pool3)}`);
}

balanceOfPool()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
