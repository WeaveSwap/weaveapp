const { ethers, getNamedAccounts } = require("hardhat");

async function stakeCollateral() {
  console.log("Connecting to the contracts...");
  const { deployer } = await getNamedAccounts();
  const borrowingTracker = await ethers.getContract(
    "BorrowingTracker",
    deployer
  );
  const token = await ethers.getContract("TestToken1", deployer);
  console.log("Connected to the contract!");

  console.log("Staking collateral...");
  const approve = await token.approve(
    borrowingTracker.target,
    ethers.parseEther("20")
  );
  await approve.wait(1);
  const stakeCollateralTx = await borrowingTracker.stakeCollateral(
    token.target,
    ethers.parseEther("20")
  );
  await stakeCollateralTx.wait(1);
  console.log("Collateral staked!");
}

stakeCollateral()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
