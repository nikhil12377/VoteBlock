// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VoteBlock
 * @dev A smart contract for managing elections and voting.
 */
contract VoteBlock is Ownable {
    /////////////////////
    //     Events     //
    /////////////////////

    event CandidateRegistered(address _address, string _name, uint256 _id);
    event VotingStarted(uint256 _timestamp);
    event VotingEnded(uint256 _timestamp);

    /////////////////////
    //     Errors     //
    /////////////////////

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

    /////////////////////
    // Global Variables //
    /////////////////////

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

    /**
     * @dev Contract constructor, initializes registration and voting status to CLOSED.
     */
    constructor() {
        registrationStatus = RegistrationStatus.CLOSED;
        votingStatus = VotingStatus.CLOSED;
    }

    /////////////////////
    // Main Functions //
    /////////////////////

    /**
     * @dev Ends the current election and resets all related data.
     * Accessible only by the owner.
     * Revert NotOwner() If the caller is not the owner.
     */
    function startNewElection() public onlyOwner {
        registrationStatus = RegistrationStatus.CLOSED;
        votingStatus = VotingStatus.CLOSED;
        for (uint256 i = 0; i < numberOfCandidates; i++) {
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

    /**
     * @dev Registers a candidate for the election.
     * @param _id The unique identifier for the candidate.
     * @param _name The name of the candidate.
     * Revert AlreadyRegistered() If the candidate is already registered.
     * Revert NotUniqueID() If the candidate ID is not unique.
     * Revert RegistrationIsClosed() If candidate registration is closed.
     */
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

    /**
     * @dev Registers a voter for the election.
     * Revert AlreadyRegistered() If the voter is already registered.
     */
    function registerVoter() public {
        if (voters[msg.sender] == true) {
            revert AlreadyRegistered();
        }

        voters[msg.sender] = true;
        allVoters.push(msg.sender);
    }

    /**
     * @dev Opens the candidate registration period. Accessible only by the owner.
     * Revert CannotRegisterInVotingPeriod() If voting is already open.
     */
    function registrationStart() public onlyOwner {
        if (votingStatus == VotingStatus.OPEN) {
            revert CannotRegisterInVotingPeriod();
        }
        registrationStatus = RegistrationStatus.OPEN;
    }

    /**
     * @dev Closes the candidate registration period. Accessible only by the owner.
     */
    function registrationStop() public onlyOwner {
        registrationStatus = RegistrationStatus.CLOSED;
    }

    /**
     * @dev Opens the voting period. Accessible only by the owner.
     * Revert NotEnoughCandidates() If there are less than 2 candidates.
     */
    function votingStart() public onlyOwner {
        if (numberOfCandidates < 2) {
            revert NotEnoughCandidates();
        }
        if (registrationStatus == RegistrationStatus.OPEN) {
            registrationStop();
        }
        votingStatus = VotingStatus.OPEN;
    }

    /**
     * @dev Closes the voting period. Accessible only by the owner.
     */
    function votingStop() public onlyOwner {
        votingStatus = VotingStatus.CLOSED;
    }

    /**
     * @dev Records a vote for a specific candidate.
     * @param _candidateId The unique identifier of the candidate.
     * Revert AlreadyVoted() If the caller has already voted.
     * Revert VotingIsClosed() If the voting period is closed.
     */
    function vote(uint256 _candidateId) public isVotingOpen {
        if (alreadyVoted[msg.sender]) {
            revert AlreadyVoted();
        }

        alreadyVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        totalVotes++;
    }

    /**
     * @dev Declares the result of the election. Accessible only by the owner.
     * Revert NotEnoughCandidates() If there are less than 2 candidates.
     * Revert NotEnoughVotes() If there are no votes cast.
     */
    function declareResult() public onlyOwner {
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

        for (uint256 i = 0; i < numberOfCandidates; i++) {
            uint256 id = indexToId[i];
            if (candidates[id].voteCount == mostVotes) {
                winners.push(candidates[id]);
                numberOfWinners++;
            }
        }
        registrationStatus = RegistrationStatus.CLOSED;
        votingStatus = VotingStatus.CLOSED;
    }

    /////////////////////
    // Getter Functions //
    /////////////////////

    /**
     * @dev Retrieves the list of winners in the election.
     * @return An array containing the winners.
     */
    function getWinners() public view returns (Candidate[] memory) {
        return winners;
    }

    /**
     * @dev Retrieves all candidates registered for the election.
     * @return An array containing all registered candidates.
     */
    function getCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](numberOfCandidates);
        for (uint256 i = 0; i < numberOfCandidates; i++) {
            uint256 id = indexToId[i];
            allCandidates[i] = candidates[id];
        }
        return (allCandidates);
    }

    /**
     * @dev Retrieves information about a specific candidate.
     * @param _candidateId The unique identifier of the candidate.
     * @return A struct containing information about the candidate.
     */
    function getCandidate(
        uint256 _candidateId
    ) public view returns (Candidate memory) {
        return candidates[_candidateId];
    }

    /**
     * @dev Retrieves the total number of candidates registered for the election.
     * @return The total number of candidates.
     */
    function getNumberOfCandidates() public view returns (uint256) {
        return numberOfCandidates;
    }

    /**
     * @dev Retrieves the total number of votes cast in the election.
     * @return The total number of votes.
     */
    function getTotalVotes() public view returns (uint256) {
        return totalVotes;
    }

    /**
     * @dev Retrieves the current registration status of the election.
     * @return The current registration status.
     */
    function getRegistrationStatus() public view returns (RegistrationStatus) {
        return registrationStatus;
    }

    /**
     * @dev Retrieves the current voting status of the election.
     * @return The current voting status.
     */
    function getVotingStatus() public view returns (VotingStatus) {
        return votingStatus;
    }

    /**
     * @dev Retrieves the owner of the contract.
     * @return The address of the contract owner.
     */
    function getOwner() public view returns (address) {
        return owner();
    }

    /**
     * @dev Checks if the caller is a valid voter.
     * @return A boolean indicating whether the caller is a valid voter.
     */
    function checkVoterIsValidOrNot() public view returns (bool) {
        return voters[msg.sender];
    }

    /**
     * @dev Checks if the caller has already voted.
     * @return A boolean indicating whether the caller has already voted.
     */
    function checkVoterAlreadyVotedOrNot() public view returns (bool) {
        return alreadyVoted[msg.sender];
    }

    /**
     * @dev Checks if the caller is already registered as a candidate.
     * @return A boolean indicating whether the caller is already a registered candidate.
     */
    function checkCandidateAlreadyRegisteredOrNot() public view returns (bool) {
        return alreadyRegisteredCandidate[msg.sender];
    }

    //////////////////////////
    // Modifier Functions //
    //////////////////////////

    /**
     * @dev Modifier to check if candidate registration is open.
     * Revert RegistrationIsClosed() If candidate registration is closed.
     */
    modifier isCandidateRegistrationOpen() {
        if (registrationStatus == RegistrationStatus.CLOSED) {
            revert RegistrationIsClosed();
        }
        _;
    }

    /**
     * @dev Modifier to check if voting is open.
     * Revert VotingIsClosed() If the voting period is closed.
     */
    modifier isVotingOpen() {
        if (votingStatus == VotingStatus.CLOSED) {
            revert VotingIsClosed();
        }
        _;
    }
}
