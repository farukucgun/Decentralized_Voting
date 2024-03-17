import React from 'react';
import Web3 from 'web3';
import '../../App.css'

const TopCandidates = ({ topCandidates }) => {
  return (
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
};

export default TopCandidates;
