const { ethers, getNamedAccounts } = require("hardhat");

async function borrow() {
  console.log("Connecting to the contracts...");
  const { deployer } = await getNamedAccounts();
  const borrowingTracker = await ethers.getContract(
    "BorrowingTracker",
    deployer
  );
  const token = await ethers.getContract("TestToken1", deployer);
  console.log("Connected to the contract!");

  console.log("Borrowing funds...");
  const borrowTokenTx = await borrowingTracker.borrowToken(
    token.target,
    ethers.parseEther("2")
  );
  await borrowTokenTx.wait(1);
  console.log("Funds borrowed!");
}

borrow()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
