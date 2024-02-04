// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Voting {
    bytes32[] public candidateList;
    mapping(bytes32 => uint256) public votesReceived;
    mapping(address => bool) public voters;
    uint256 public endTime;

    constructor(bytes32[] memory initialCandidates, uint256 durationHour) public {
        for (uint256 i = 0; i < initialCandidates.length; i++) {
            candidateList.push(initialCandidates[i]);
        }

        endTime = block.timestamp + durationHour * 1 minutes;
    }

    modifier onlyBefore() {
        require(block.timestamp < endTime, "Voting has ended.");
        _;
    }

    function voteForCandidate(bytes32 candidate) public onlyBefore {
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

    function getTopCandidates() public view returns (bytes32[3] memory, uint256[3] memory) {
        bytes32[3] memory topNames;
        uint256[3] memory topVotes;

        for (uint256 i = 0; i < candidateList.length; i++) {
            uint256 votes = votesReceived[candidateList[i]];

            for (uint256 j = 0; j < 3; j++) {
                if (votes >= topVotes[j]) {
                    for (uint256 k = 2; k > j; k--) {
                        topVotes[k] = topVotes[k - 1];
                        topNames[k] = topNames[k - 1];
                    }

                    topVotes[j] = votes;
                    topNames[j] = candidateList[i];

                    break;
                }
            }
        }

        return (topNames, topVotes);
    }
}