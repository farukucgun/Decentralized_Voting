import react from 'react';
import TopCandidates from './candidates/TopCandidates';

const ElectionEnd = ({ topCandidates }) => {
    return (
        <div>
          <h1>Election has ended!</h1>
          <TopCandidates topCandidates={topCandidates} />
        </div>
      );
}

export default ElectionEnd;