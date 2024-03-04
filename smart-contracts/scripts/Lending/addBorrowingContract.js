const { ethers, getNamedAccounts } = require("hardhat");

async function addBorrowingContract() {
  console.log("Connecting to the contracts...");
  const { deployer } = await getNamedAccounts();
  const borrowingTracker = await ethers.getContract(
    "BorrowingTracker",
    deployer
  );
  const lendingTracker = await ethers.getContract("LendingTracker", deployer);
  console.log("Connected to the contract!");

  console.log("Storing the borrowing contract to the lending tracker...");
  await lendingTracker.addBorrowingContract(borrowingTracker.target);
  const borrowingContract = await lendingTracker.borrowingContract();
  console.log(
    `The borrowing tracker successfuly store in lending tracker at ${borrowingContract}!`
  );
}

addBorrowingContract()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
