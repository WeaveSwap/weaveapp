const { ethers, getNamedAccounts } = require("hardhat");

async function swapTokens() {
  console.log("Connecting to the contracts...");
  const { deployer } = await getNamedAccounts();

  const swapRouter = await ethers.getContract("SwapRouter", deployer);
  const token1 = await ethers.getContract("TestToken2", deployer);
  const token2 = await ethers.getContract("TestToken3", deployer);
  console.log(`This is the swap router address ${swapRouter.target}`);
  console.log(`This is the token1 address ${token1.target}`);
  console.log(`This is the token2 address ${token2.target}`);
  console.log("Connected to the contract!");
  console.log(`Approving tokens...`);
  const approveTx = await token1.approve(
    swapRouter.target,
    ethers.parseEther("1")
  );
  await approveTx.wait(1);
  console.log(
    `This is the deployer token1 balance before ${await token1.balanceOf(
      deployer
    )}`
  );
  console.log(
    `This is the deployer token2 balance before ${await token2.balanceOf(
      deployer
    )}`
  );
  console.log(
    `This is the deployer token1 allowance ${await token1.allowance(
      deployer,
      swapRouter.target
    )}`
  );
  console.log(`Tokens approved!`);
  const priceBefore = await swapRouter.getSwapAmount(
    token1.target,
    token2.target,
    ethers.parseEther("1")
  );
  const getFee = await swapRouter.getSwapFee(token1.target, token2.target);
  console.log(`This is the price before! ${priceBefore}`);
  console.log("Swapping...");
  const tx = await swapRouter.swapAsset(
    token1.target,
    token2.target,
    ethers.parseEther("1"),
    { value: getFee }
  );
  await tx.wait(1);
  console.log("Swap successful!");
  const priceAfter = await swapRouter.getSwapAmount(
    token1.target,
    token2.target,
    ethers.parseEther("1")
  );
  console.log(`This is the price after! ${priceAfter}`);
  console.log(
    `This is the deployer token1 balance after ${await token1.balanceOf(
      deployer
    )}`
  );
  console.log(
    `This is the deployer token2 balance after ${await token2.balanceOf(
      deployer
    )}`
  );
}

swapTokens()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
