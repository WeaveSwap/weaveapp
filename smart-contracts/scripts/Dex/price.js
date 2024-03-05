const { ethers, getNamedAccounts } = require("hardhat");

async function getPrice() {
  console.log("Connecting to the contracts...");
  const { deployer } = await getNamedAccounts();

  const swapRouter = await ethers.getContract("SwapRouter", deployer);
  const token1 = await ethers.getContract("TestToken2", deployer);
  const token2 = await ethers.getContract("TestToken3", deployer);
  console.log(`This is the swap router address ${swapRouter.target}`);
  console.log(`This is the token1 address ${token1.target}`);
  console.log(`This is the token2 address ${token2.target}`);
  console.log("Connected to the contract!");
  console.log("Fetching the price...");
  const price = await swapRouter.getSwapAmount(
    token1.target,
    token2.target,
    ethers.parseEther("1")
  );
  console.log(`This is the price! ${price}`);
}

getPrice()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
