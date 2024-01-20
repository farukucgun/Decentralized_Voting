import { useState, useEffect } from 'react'
import Web3 from 'web3'
import Voting from '../../VoteBackend/build/contracts/Voting.json'
import './App.css'

const App = () => {
  const [account, setAccount] = useState('')
  const [contract, setContract] = useState(null)
  const [candidates, setCandidates] = useState([[], []])
  const [loading, setLoading] = useState(true)
  const [totalVotes, setTotalVotes] = useState(0)
  const [votedCandidate, setVotedCandidate] = useState('')
  const [hasVoted, setHasVoted] = useState(false)
  const [winnerDetails, setWinnerDetails] = useState({
    winner: '',
    winnerVote: 0
  })
  const [topCandidates, setTopCandidates] = useState([])

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum)
        await window.ethereum.enable()
      } 
        else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
      } 
        else {
        // window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"))
      }
    }
    loadWeb3()
  }, [])

  useEffect(() => {
    const loadBlockchainData = async () => {

      const web3 = window.web3
      const accounts = await web3.eth.getAccounts()
      setAccount(accounts[0])

      const networkId = await web3.eth.net.getId()
      const networkData = Voting.networks[networkId]

      if (networkData) {        
        const contract = new web3.eth.Contract(Voting.abi, networkData.address)
        setContract(contract)

        const candidates = await contract.methods.getCandidates().call()
        setCandidates(candidates)

        const totalVotes = await contract.methods.getTotalVotes().call()
        setTotalVotes(Number(totalVotes))

        if (web3.utils.isAddress(account)) {
          const hasVoted = await contract.methods.voters(account).call();
          setHasVoted(hasVoted);
        }

        const topCanditates = await contract.methods.getTopCandidates().call();
        setTopCandidates(topCanditates);

        setLoading(false)
        
      } else {
        window.alert('Voting contract not deployed to detected network.')
      }
    }
    loadBlockchainData()
  }, [account])

  useEffect(() => {
    const getWinnerDetails = async () => {
      if (!hasVoted) return;
      try {
        setLoading(true);
        
        const winnerDetails = await contract.methods.getWinnerDetails().call();
        setWinnerDetails({
          winner: Web3.utils.hexToUtf8(winnerDetails[0]).replace(/\0+$/, ''),
          winnerVote: Number(winnerDetails[1])
        });

        const topCanditates = await contract.methods.getTopCandidates().call();
        setTopCandidates(topCanditates);

      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false);
      }
    }
    getWinnerDetails();
  }, [hasVoted])

  const voteHandler = async (candidate) => {
    try {
      setLoading(true);
      
      await contract.methods.voteForCandidate(candidate)
        .send({ 
          from: account,
          gas: 1000000,
          gasPrice: await window.web3.eth.getGasPrice(),
          timeout: 1500
        });
      
      const totalVotes = await contract.methods.getTotalVotes().call();
      setTotalVotes(Number(totalVotes));
      setVotedCandidate(Web3.utils.hexToUtf8(candidate).replace(/\0+$/, ''));

      if (window.web3.utils.isAddress(account)) {
        const hasVoted = await contract.methods.voters(account).call();
        setHasVoted(hasVoted);
      }

    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (hasVoted) {
    return (
      <div>
        <h1>Thanks for voting!</h1>
        <p>Your vote has been recorded for {votedCandidate}.</p>
        <p>There are {totalVotes} votes in total.</p>
        {/* <p>The winner is {winnerDetails.winner} with {winnerDetails.winnerVote} votes.</p> */}

        <h2>Top Candidates</h2>
        {topCandidates[0].map((candidate, key) => (
          <div key={key} className="candidate">
            <h3>#{key+1} {Web3.utils.hexToUtf8(candidate).replace(/\0+$/, '')}</h3>
            <p>{Number(topCandidates[1][key])} votes</p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="App">
      <h1>Vote Your Candidate</h1>
      <p>There are {totalVotes} votes in total.</p>
      <div className="candidates">
        {candidates.map((candidate, key) => (
          <div key={key} className="candidate">
            <h2>{Web3.utils.hexToUtf8(candidate).replace(/\0+$/, '')}</h2>
            <button onClick={() => voteHandler(candidate)}>Vote</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App;
