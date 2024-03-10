const hre = require("hardhat");

async function main() {
  const VoteBlockContract = await hre.ethers.getContractFactory(
    "VoteBlock"
  );
  const VoteBlock = await VoteBlockContract.deploy();
  await VoteBlock.deployed();

  console.log("VoteBlock deployed to address:", VoteBlock.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
