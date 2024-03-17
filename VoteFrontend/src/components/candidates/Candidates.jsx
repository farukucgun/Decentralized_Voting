import React from 'react';
import Web3 from 'web3';
import '../../App.css';

const Candidates = ({ candidates, voteHandler }) => {
  return (
    <div className="candidates">
      {candidates.map((candidate, key) => (
        <div key={key} className="candidate">
          <h2>{Web3.utils.hexToUtf8(candidate).replace(/\0+$/, '')}</h2>
          <button onClick={() => voteHandler(candidate)}>Vote</button>
        </div>
      ))}
    </div>
  );
};

export default Candidates;
