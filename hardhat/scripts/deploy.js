const hre = require("hardhat");

async function main() {
  const VoteSessionContract = await hre.ethers.getContractFactory(
    "VoteSession"
  );
  const VoteSession = await VoteSessionContract.deploy();
  await VoteSession.deployed();

  console.log("VoteSessionManager deployed to address:", VoteSession.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
