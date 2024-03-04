const networkConfig = {
  default: {
    name: "hardhat",
  },
  11155111: {
    name: "sepolia",
  },
  5: {
    name: "goerli",
  },
  31337: {
    name: "localhost",
  },
  97: {
    name: "bscTestnet",
  },
  mocha: {
    timeout: 200000,
  },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 5000000000;

module.exports = {
  DECIMALS,
  INITIAL_ANSWER,
  networkConfig,
  developmentChains,
};
