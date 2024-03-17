import react from 'react';
import TopCandidates from './candidates/TopCandidates';
import ElectionStatus from './ElectionStatus';

const Voted = ({ votedCandidate, totalVotes, endTime, topCandidates }) => {
    return (
        <div>
          <h1>Thanks for voting!</h1>
          <p>Your vote has been recorded for {votedCandidate}.</p>
          <ElectionStatus totalVotes={totalVotes} endTime={endTime} />
          <TopCandidates topCandidates={topCandidates} />
        </div>
      );
}

export default Voted;