import React from 'react';

const ElectionStatus = ({ totalVotes, endTime }) => {
  return (
    <div>
      <p>There are {totalVotes} votes in total.</p>
      <p>Election ends on {endTime.toLocaleString()}</p>
    </div>
  );
};

export default ElectionStatus;
