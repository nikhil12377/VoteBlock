//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract VoteSession {
    event CandidateRegistered(address _address, string _name, uint256 _id);
    event VotingStarted(uint256 _timestamp);
    event VotingEnded(uint256 _timestamp);

    error NotOwner();
    error NotEnoughCandidates();
    error NotEnoughVotes();
    error AlreadyVoted();
    error CandidateDoesNotExist();
    error AlreadyRegistered();
    error RegistrationIsClosed();
    error VotingIsClosed();
    error CannotRegisterInVotingPeriod();
    error NotUniqueID();

    struct Candidate {
        string name;
        uint256 id;
        uint256 voteCount;
        address candAddress;
    }

    enum RegistrationStatus {
        OPEN,
        CLOSED
    }

    enum VotingStatus {
        OPEN,
        CLOSED
    }

    RegistrationStatus public registrationStatus;
    VotingStatus public votingStatus;
    mapping(uint256 => Candidate) public candidates;
    mapping(uint256 => uint256) public indexToId;
    mapping(address => bool) public alreadyVoted;
    mapping(address => bool) public alreadyRegisteredCandidate;
    mapping(address => bool) public voters;
    address[] public allVoters;
    Candidate[] public winners;
    uint256 public numberOfCandidates;
    uint256 public numberOfWinners;
    uint256 public totalVotes;
    address public owner;

    constructor() {
        registrationStatus = RegistrationStatus.CLOSED;
        votingStatus = VotingStatus.CLOSED;
        owner = msg.sender;
    }

    function startNewElection() public checkOwner {
        registrationStatus = RegistrationStatus.CLOSED;
        votingStatus = VotingStatus.CLOSED;
        for (uint256 i = 0; i <= numberOfCandidates; i++) {
            uint256 ID = indexToId[i];
            address candidateAddress = candidates[ID].candAddress;
            alreadyRegisteredCandidate[candidateAddress] = false;
            address tempAddress;
            candidates[ID] = Candidate({
                name: "",
                id: 0,
                voteCount: 0,
                candAddress: tempAddress
            });
            indexToId[i] = 0;
        }
        for (uint256 i = 0; i < allVoters.length; i++) {
            alreadyVoted[allVoters[i]] = false;
            voters[allVoters[i]] = false;
        }
        allVoters = new address[](0);
        for (uint256 i = 0; i < numberOfWinners; i++) {
            winners.pop();
        }
        numberOfCandidates = 0;
        totalVotes = 0;
        numberOfWinners = 0;
    }

    function registerCandidate(
        uint256 _id,
        string memory _name
    ) public isCandidateRegistrationOpen {
        if (alreadyRegisteredCandidate[msg.sender]) {
            revert AlreadyRegistered();
        }
        if (candidates[_id].id > 0) {
            revert NotUniqueID();
        }

        indexToId[numberOfCandidates] = _id;
        candidates[_id] = Candidate({
            name: _name,
            id: _id,
            voteCount: 0,
            candAddress: msg.sender
        });
        numberOfCandidates++;
        alreadyRegisteredCandidate[msg.sender] = true;

        emit CandidateRegistered(msg.sender, _name, numberOfCandidates);
    }

    function registerVoter() public {
        if (voters[msg.sender] == true) {
            revert AlreadyRegistered();
        }

        voters[msg.sender] = true;
        allVoters.push(msg.sender);
    }

    function registrationStart() public checkOwner {
        if (votingStatus == VotingStatus.OPEN) {
            revert CannotRegisterInVotingPeriod();
        }
        registrationStatus = RegistrationStatus.OPEN;
    }

    function registrationStop() public checkOwner {
        registrationStatus = RegistrationStatus.CLOSED;
    }

    function votingStart() public checkOwner {
        if (numberOfCandidates < 2) {
            revert NotEnoughCandidates();
        }
        if (registrationStatus == RegistrationStatus.OPEN) {
            registrationStop();
        }
        votingStatus = VotingStatus.OPEN;
    }

    function votingStop() public checkOwner {
        registrationStatus = RegistrationStatus.CLOSED;
    }

    function vote(uint256 _candidateId) public isVotingOpen {
        if (alreadyVoted[msg.sender]) {
            revert AlreadyVoted();
        }

        alreadyVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        totalVotes++;
    }

   

    function declareResult() public checkOwner {
        if (numberOfCandidates < 2) {
            revert NotEnoughCandidates();
        }
        if (totalVotes < 1) {
            revert NotEnoughVotes();
        }
        uint256 mostVotes;
        for (uint256 i = 0; i < numberOfCandidates; i++) {
            uint256 id = indexToId[i];
            if (candidates[id].voteCount > mostVotes) {
                mostVotes = candidates[id].voteCount;
            }
        }

        // if size of winners is greater than 1
        // then its a draw
        // Candidate[] memory winners = new Candidate[](numberOfCandidates);
        for (uint256 i = 0; i < numberOfCandidates; i++) {
            uint256 id = indexToId[i];
            if (candidates[id].voteCount == mostVotes) {
                // winners[i] = candidates[id];
                winners.push(candidates[id]);
                numberOfWinners++;
            }
        }
        registrationStatus = RegistrationStatus.CLOSED;
        votingStatus = VotingStatus.CLOSED;
    }

    function getWinners() public view returns (Candidate[] memory) {
        return winners;
    }

    function getCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](numberOfCandidates);
        for (uint256 i = 0; i < numberOfCandidates; i++) {
            uint256 id = indexToId[i];
            allCandidates[i] = candidates[id];
        }
        return (allCandidates);
    }

    function getCandidate(
        uint256 _candidateId
    ) public view returns (Candidate memory) {
        return candidates[_candidateId];
    }

    function getNumberOfCandidates() public view returns (uint256) {
        return numberOfCandidates;
    }


    function getTotalVotes() public view returns (uint256) {
        return totalVotes;
    }

    function getRegistrationStatus() public view returns (RegistrationStatus) {
        return registrationStatus;
    }

    function getVotingStatus() public view returns (VotingStatus) {
        return votingStatus;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function checkVoterIsValidOrNot() public view returns (bool) {
        return voters[msg.sender];
    }

    function checkVoterAlreadyVotedOrNot() public view returns (bool) {
        return alreadyVoted[msg.sender];
    }

    function checkCandidateAlreadyRegisteredOrNot() public view returns (bool) {
        return alreadyRegisteredCandidate[msg.sender];
    }

    modifier isCandidateRegistrationOpen() {
        if (registrationStatus == RegistrationStatus.CLOSED) {
            revert RegistrationIsClosed();
        }
        _;
    }

    modifier isVotingOpen() {
        if (votingStatus == VotingStatus.CLOSED) {
            revert VotingIsClosed();
        }
        _;
    }

    modifier checkOwner() {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }
}
