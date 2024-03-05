const { ethers } = require("hardhat");

async function register() {
  const candidate = await ethers.getContract("VoteBlock");

  // console.log(candidate.address);

  const candidates = [
    { id: 69, name: "Nikhil" },
    { id: 999, name: "Sahil" },
    { id: 666, name: "Ashish" },
  ];

  // const str = "abc";
  // await candidate.setVoterFace(str);
  // const getFace = await candidate.getVoterFace();
  // console.log(getFace);

  // register status will open
  await candidate.registrationStart();

  // connecting signers to register candidates
  const signers = await ethers.getSigners();
  for (var i = 0; i < candidates.length; i++) {
    await candidate
      .connect(signers[i])
      .registerCandidate(candidates[i].id, candidates[i].name);
  }
  // for (var i = 4; i < 8; i++) {
  //   await candidate.connect(signers[i]).registerVoter();
  // }

  // voting status will open
  // await candidate.votingStart();

  // connecting signers to register voters and vote
  // for (var i = 4; i < 6; i++) {
  //   await candidate.connect(signers[i]).vote(69);
  // }
  // for (var i = 6; i < 8; i++) {
  //   await candidate.connect(signers[i]).vote(666);
  // }

  // // Declaring results
  // await candidate.declareResult();
  // const winners = await candidate.getWinners();
  // console.log(winners);

  // This function will reset all data to null
  // And will start a new fresh election
  // await candidate.startNewElection();

  // const nums = await candidate.getNumberOfCandidates();
  // console.log(nums);

  // // get single candidate
  // var cand = await candidate.getCandidate(3);
  // console.log(cand);

  // Get all the candidates
  var cands = await candidate.getCandidates();
  console.log(cands);
}

register()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
