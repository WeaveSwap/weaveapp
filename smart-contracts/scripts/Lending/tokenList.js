const { ethers, getNamedAccounts } = require("hardhat");

async function tokenList() {
  console.log("Connecting to the contracts...");
  const { deployer } = await getNamedAccounts();
  const lendingTracker = await ethers.getContract("LendingTracker", deployer);
  console.log("Connected to the contract!");

  console.log(
    `These are all available tokens to lend, to borrow and to collateralize - ${await lendingTracker.allAvailableTokens()}`
  );
}

tokenList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
