require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainID: 31337,
      blockConformations: 1,
    },
    mumbai: {
      chainID: 80001,
      blockConformations: 6,
      url: process.env.PROVIDER,
      accounts: [process.env.PRIVATE_KEY],
    },
    sepolia: {
      chainID: 11155111,
      blockConformations: 6,
      url: process.env.SEPOLIA_PROVIDER,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
};
