const { network } = require("hardhat");
const { verify } = require("../utils/verify");

const FRONT_END_ADDRESSES_LOCATION = "../../frontend/constants/contractAddress.json";
const FRONT_END_ABI_LOCATION = "../../frontend/constants/abi.json";

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const VoteBlock = await deploy("VoteBlock", {
    from: deployer,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log("Address: ", VoteBlock.address);
  log("-----------------------------------------");
  if (
    process.env.ETHERSCAN_API_KEY
  ) {
    try {
      log("Verifying...");
      await verify(VoteBlock.address);
      log("Verified!");
    } catch (error) {
      log(error);
    }
  }
  log("-----------------------------------------");
  // log("Frontend")
  // log("Updating Contract Address...");
  // await updateContractAddresses(VoteBlock);
  // log("Success.");
  // log("-----------------------------------------");
  // log("Updating Contract Address...");
  // await updateABI(VoteBlock);
  // log("Success.");
  // log("-----------------------------------------");
};

async function updateABI(VoteBlock) {
  fs.writeFileSync(
    `${FRONT_END_ABI_LOCATION}VoteBlock.json`,
    JSON.stringify(VoteBlock.abi)
  );
}

async function updateContractAddresses(VoteBlock) {
  const chainId =
    network.config.chainId.toString() || "31337";
  let contractAddresses = JSON.parse(
    fs.readFileSync(FRONT_END_ADDRESSES_LOCATION, "utf8")
  );

  if (chainId in contractAddresses) {
    if (!contractAddresses[chainId]) {
      contractAddresses[chainId] = { VoteBlock: [VoteBlock.address] };
    } else if (!contractAddresses[chainId]["VoteBlock"].includes(VoteBlock.address)) {
      contractAddresses[chainId]["VoteBlock"].push(VoteBlock.address);
    }
  } else {
    contractAddresses[chainId] = { VoteBlock: [VoteBlock.address] };
  }

  fs.writeFileSync(FRONT_END_ADDRESSES_LOCATION, JSON.stringify(contractAddresses));
}

module.exports.tags = ["all"];
