const Voting = artifacts.require("Voting");

module.exports = function (deployer) {
  const candidates = ["Rama", "Nick", "Jose"].map(name => web3.utils.asciiToHex(name))
  deployer.deploy(Voting, candidates, 2);
}