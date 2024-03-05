const { network } = require("hardhat");

const FRONT_END_ADDRESSES_LOCATION = "../my-app/constants/contractAddress.json";
const FRONT_END_ABI_LOCATION = "../my-app/constants/abi.json";

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
};

async function updateABI(supercoin) {
  fs.writeFileSync(
    `${FRONT_END_ABI_LOCATION}Supercoin.json`,
    JSON.stringify(supercoin.abi)
  );
}

async function updateContractAddresses(supercoin) {
  const chainId =
    network.config.chainId.toString() || "31337";
  let contractAddresses = JSON.parse(
    fs.readFileSync(FRONT_END_ADDRESSES_LOCATION, "utf8")
  );

  if (chainId in contractAddresses) {
    if (!contractAddresses[chainId]) {
      contractAddresses[chainId] = { Supercoin: [supercoin.address] };
    } else if (!contractAddresses[chainId]["Supercoin"].includes(supercoin.address)) {
      contractAddresses[chainId]["Supercoin"].push(supercoin.address);
    }
  } else {
    contractAddresses[chainId] = { Supercoin: [supercoin.address] };
  }

  fs.writeFileSync(FRONT_END_ADDRESSES_LOCATION, JSON.stringify(contractAddresses));
}

module.exports.tags = ["all"];
