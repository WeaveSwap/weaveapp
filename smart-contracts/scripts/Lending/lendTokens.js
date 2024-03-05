const { ethers, getNamedAccounts } = require("hardhat");

async function tokenList() {
  console.log("Connecting to the contracts...");
  const { deployer } = await getNamedAccounts();
  const lendingTracker = await ethers.getContract("LendingTracker", deployer);
  const token = await ethers.getContract("TestToken3", deployer);
  const aggregator = await ethers.getContract("MockV3Aggregator");
  console.log(`This is the price feed aggregator ${aggregator.target}`);
  console.log("Connected to the contract!");

  console.log("Lending tokens...");
  const approveTx = await token.approve(
    lendingTracker.target,
    ethers.parseEther("20")
  );
  await approveTx.wait(1);
  const tx = await lendingTracker.lendToken(
    token.target,
    ethers.parseEther("20")
  );
  await tx.wait(1);
  console.log("Tokens lended!");
}

tokenList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
