const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { getBlockTimestamp } = require("./utils");

describe("Vote session manager", function () {
  let contract;
  let owner;
  let accounts;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();

    // Deploy VoteSessionManager contract
    const VoteSessionManager = await ethers.getContractFactory(
      "VoteSessionManager"
    );

    contract = await VoteSessionManager.deploy();
    await contract.deployed();
  });

  it("should initialize", async () => {
    expect(contract).to.be.ok;

    // Check that the manager starts with an empty vote sessions aray
    await expect(contract.voteSessions(0)).to.be.reverted;
  });

  it("should allow creation of new voting sessions", async () => {
    const startDate = (await getBlockTimestamp()) + 300; // NOW + 5 minutes
    const duration = 600; // 10 minutes
    const title = "New voting session";

    const tx = await contract.createVoteSession(title, startDate, duration);
    await tx.wait();

    const voteSessionAddress = await contract.voteSessions(0);

    // Check that vote session has been deployed
    const VoteSession = await ethers.getContractFactory("VoteSession");
    const voteSessionContract = await VoteSession.attach(voteSessionAddress);

    expect(await voteSessionContract.voteStatus()).to.equal(0); // Status.CANDIDATE_REGISTRATION_OPEN == 0
  });
});
