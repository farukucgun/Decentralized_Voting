import { useState, useEffect } from 'react';
import Web3 from 'web3';
import Voting from '../../VoteBackend/build/contracts/Voting.json';
import './App.css';

const App = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState([[], []]);
  const [loading, setLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);
  const [votedCandidate, setVotedCandidate] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [topCandidates, setTopCandidates] = useState([]);
  const [electionEnd, setElectionEnd] = useState(false);
  const [endTime, setEndTime] = useState(0);

  useEffect(() => {
    const loadWeb3 = async () => {
      try {
        if (window.ethereum) {
          window.web3 = new Web3(window.ethereum);
          await window.ethereum.enable();
        } else if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider);
        } else {
          window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
        }
      } catch (error) {
        console.error('Error loading Web3:', error);
      }
    };
    loadWeb3();
  }, []);

  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        
        const networkId = await web3.eth.net.getId();
        const networkData = Voting.networks[networkId];

        if (!networkData) {
          window.alert('Voting contract not deployed to detected network.');
          return;
        }

        const contract = new web3.eth.Contract(Voting.abi, networkData.address);
        setContract(contract);
                
        const candidates = await contract.methods.getCandidates().call();
        setCandidates(candidates);

        const totalVotes = await contract.methods.getTotalVotes().call();
        setTotalVotes(Number(totalVotes));

        if (web3.utils.isAddress(account)) {
          const hasVoted = await contract.methods.voters(account).call();
          setHasVoted(hasVoted);
        }

        const endTimeStamp = await contract.methods.endTime().call();
        const endTime = new Date(Number(endTimeStamp) * 1000);
        setEndTime(endTime);
      } catch (error) {
        console.error('Error loading blockchain data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBlockchainData();
  }, [account]);

  useEffect(() => {
    const getTopCandidates = async () => {
      try {
        if (!hasVoted || !contract) return;

        setLoading(true);
        const topCandidatesData = await contract.methods.getTopCandidates().call();
        setTopCandidates(topCandidatesData);
      } catch (error) {
        console.error('Error getting top candidates:', error);
      } finally {
        setLoading(false);
      }
    };
    getTopCandidates();
  }, [hasVoted, contract]);

  useEffect(() => {
    const getElectionEnd = async () => {
      try {
        setLoading(true);
        if (!contract) return;

        const endTimeStamp = await contract.methods.endTime().call();
        const endTime = new Date(Number(endTimeStamp) * 1000);
        setEndTime(endTime);

        const now = new Date();
        if (now > endTime) {
          setElectionEnd(true);
        }
      } catch (error) {
        console.error('Error checking election end:', error);
      } finally {
        setLoading(false);
      }
    };
    getElectionEnd();

    const intervalId = setInterval(getElectionEnd, 60000);

    return () => clearInterval(intervalId);
  }, [contract]); 

  const voteHandler = async (candidate) => {
    try {
      setLoading(true);
      if (!contract) return;

      await contract.methods.voteForCandidate(candidate).send({
        from: account,
        gas: 1000000,
        gasPrice: await window.web3.eth.getGasPrice(),
        timeout: 1500,
      });

      const updatedTotalVotes = await contract.methods.getTotalVotes().call();
      setTotalVotes(Number(updatedTotalVotes));

      const votedCandidateName = Web3.utils.hexToUtf8(candidate).replace(/\0+$/, '');
      setVotedCandidate(votedCandidateName);

      if (window.web3.utils.isAddress(account)) {
        const hasVoted = await contract.methods.voters(account).call();
        setHasVoted(hasVoted);
      }
    } catch (error) {
      console.error('Error voting for candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  const TopCandidatesEl = () => (
    <div>
      <h2>Top Candidates</h2>
      {topCandidates[0] &&
        topCandidates[0].map((candidate, key) => (
          <div key={key} className="candidate">
            <h3>
              #{key + 1} {Web3.utils.hexToUtf8(candidate).replace(/\0+$/, '')}{' '}
              {key === 0 && 'is the WINNER 🏆'}
            </h3>
            <p>{Number(topCandidates[1][key])} votes</p>
          </div>
        ))}
    </div>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (electionEnd) {
    return (
      <div>
        <h1>Election Ended</h1>
        <TopCandidatesEl />
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div>
        <h1>Thanks for voting!</h1>
        <p>Your vote has been recorded for {votedCandidate}.</p>
        <p>There are {totalVotes} votes in total.</p>
        <p>Election ends on {endTime.toLocaleString()}</p>
        <TopCandidatesEl />
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Vote Your Candidate</h1>
      <p>There are {totalVotes} votes in total.</p>
      <p>Election ends on {endTime.toLocaleString()}</p>
      <div className="candidates">
        {candidates.map((candidate, key) => (
          <div key={key} className="candidate">
            <h2>{Web3.utils.hexToUtf8(candidate).replace(/\0+$/, '')}</h2>
            <button onClick={() => voteHandler(candidate)}>Vote</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;