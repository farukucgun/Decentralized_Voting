import { useState, useEffect } from 'react';
import Web3 from 'web3';
import Voting from '../../VoteBackend/build/contracts/Voting.json';
import Candidates from './components/candidates/Candidates';
import Loading from './components/UI/Loading';
import { useAlert } from './contexts/AlertContext';
import Voted from './components/Voted';
import ElectionEnd from './components/ElectionEnd';

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

  const { setTimedAlert } = useAlert();

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
        setTimedAlert('Error loading Web3', 'error', 3000);
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
          setTimedAlert('Contract not deployed to detected network', 'error', 3000);
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
        setTimedAlert('Error loading blockchain data', 'error', 3000);
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
        setTimedAlert('Error getting election end', 'error', 3000);
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
      setTimedAlert('Error voting for candidate', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (electionEnd) {
    return <ElectionEnd topCandidates={topCandidates} />;
  }

  if (hasVoted) {
    return <Voted votedCandidate={votedCandidate} totalVotes={totalVotes} endTime={endTime} topCandidates={topCandidates} />;
  }

  return <Candidates candidates={candidates} voteHandler={voteHandler} />;
};

export default App;