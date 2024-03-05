const { ethers, getNamedAccounts } = require("hardhat");

async function transferTokens(address, amount) {
  console.log("Connecting to the contracts...");
  const { deployer } = await getNamedAccounts();
  const token = await ethers.getContract("TestToken1", deployer);
  const token2 = await ethers.getContract("TestToken2", deployer);
  const token3 = await ethers.getContract("TestToken3", deployer);
  console.log("Connected to the contract!");

  console.log(`Transfering token ${token.target} to the address ${address}`);
  await token.transfer(address, ethers.parseEther(amount));
  await token2.transfer(address, ethers.parseEther(amount));
  await token3.transfer(address, ethers.parseEther(amount));
  console.log(`Successfully sent ${amount} tokens!`);
}

transferTokens("0xe586ACAd58A2322779C5a62294e59C13FAD8B8A1", "20")
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
