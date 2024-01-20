// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Voting {
    bytes32[] public candidateList;
    mapping(bytes32 => uint256) public votesReceived;
    mapping(address => bool) public voters;

    constructor(bytes32[] memory initialCandidates) public {
        for (uint256 i = 0; i < initialCandidates.length; i++) {
            candidateList.push(initialCandidates[i]);
        }
    }

    function voteForCandidate(bytes32 candidate) public {
        require(!voters[msg.sender], "Already voted.");
        require(validCandidate(candidate));
        votesReceived[candidate] += 1;
        voters[msg.sender] = true;
    }

    function totalVotesFor(bytes32 candidate) public view returns (uint256) {
        require(validCandidate(candidate));
        return votesReceived[candidate];
    }

    function validCandidate(bytes32 candidate) public view returns (bool) {
        for (uint256 i = 0; i < candidateList.length; i++) {
            if (candidateList[i] == candidate) {
                return true;
            }
        }
        return false;
    }

    function getCandidates() public view returns (bytes32[] memory) {
        return candidateList;
    }

    function getTotalVotes() public view returns (uint256) {
        uint256 totalVotes = 0;
        for (uint256 i = 0; i < candidateList.length; i++) {
            totalVotes += votesReceived[candidateList[i]];
        }
        return totalVotes;
    }

    function getWinnerDetails() public view returns (bytes32, uint256) {
        uint256 winningVoteCount = 0;
        bytes32 winner;
        for (uint256 i = 0; i < candidateList.length; i++) {
            if (votesReceived[candidateList[i]] > winningVoteCount) {
                winningVoteCount = votesReceived[candidateList[i]];
                winner = candidateList[i];
            }
        }
        return (winner, winningVoteCount);
    }
}