const { ethers, getNamedAccounts } = require("hardhat");

async function tokenList() {
  console.log("Connecting to the contracts...");
  const { deployer } = await getNamedAccounts();
  const poolTracker = await ethers.getContract("PoolTracker", deployer);
  const token1 = await ethers.getContract("TestToken1", deployer);
  const token2 = await ethers.getContract("TestToken2", deployer);
  const swapRouter = await ethers.getContract("SwapRouter", deployer);
  // const token3 = await ethers.getContract("TestToken2", deployer);
  console.log(`This is the pool tracker address ${poolTracker.target}`);
  console.log(`This is the swap router address ${swapRouter.target}`);
  console.log(`This is the token1 address ${token1.target}`);
  console.log(`This is the token2 address ${token2.target}`);
  console.log("Connected to the contract!");

  console.log("Deploying the pool...");
  console.log("Approving token...");
  console.log(poolTracker.target);
  console.log(
    `This is the deployer token1 balance ${await token1.balanceOf(deployer)}`
  );
  console.log(
    `This is the deployer token2 balance ${await token2.balanceOf(deployer)}`
  );
  console.log(`These are the tokens on dex ${await poolTracker.tokenList()}`);
}

tokenList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
