const { ethers } = require("hardhat");

const getBlockTimestamp = async () => {
  return (
    await ethers.provider.getBlock(await ethers.provider.getBlockNumber())
  ).timestamp;
};

module.exports = {
  getBlockTimestamp,
};
