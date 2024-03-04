const { ethers, getNamedAccounts } = require("hardhat");

async function checkSwapRouterAddress() {
  console.log("Connecting to the contracts...");
  const { deployer } = await getNamedAccounts();
  const borrowingTracker = await ethers.getContract(
    "BorrowingTracker",
    deployer
  );
  console.log("Connected to the contract!");

  console.log(
    `This is the borrowing tracker swap Router address ${await borrowingTracker.swapRouter()}`
  );
}

checkSwapRouterAddress()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
