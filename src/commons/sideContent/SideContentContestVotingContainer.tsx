import React, { useState } from 'react';

import { ContestEntry, ContestVotingSubmission } from '../assessment/AssessmentTypes';
import SideContentContestVoting from './SideContentContestVoting';

export type SideContentContestVotingContainerProps = DispatchProps & StateProps;

type DispatchProps = {
  handleContestEntryClick: (submission_id: number, answer: string) => void;
  handleSave: (votingSubmission: ContestVotingSubmission) => void;
};

type StateProps = {
  contestEntries: ContestEntry[];
};

/**
 * Container to separate behaviour concerns from rendering concerns
 * Stores component-level voting ranking state
 * (maybe handles API calls?)
 */
const SideContentContestVotingContainer: React.FunctionComponent<SideContentContestVotingContainerProps> = props => {
  const { contestEntries, handleSave, handleContestEntryClick } = props;
  const [votingSubmission, setVotingSubmission] = useState<ContestVotingSubmission>({});

  // TODO: Write Backend API call to submit VotingSubmission { } JSON Data
  // TODO: Write Backend API call to fetch ordered leaderboard entries (with names)
  // TODO: Validate VotingSubmission Data
  // TODO: Find a way to persist and incorportate submission of the data
  // TODO: Conditionally render tabs based on contest state (finished, pending)

  const handleVotingSubmissionChange = (submission_id: number, rank: number): void => {
    const updatedSubmission = { ...votingSubmission, [submission_id]: rank };
    setVotingSubmission(updatedSubmission);
    handleSave(updatedSubmission);
  };

  return (
    <SideContentContestVoting
      handleContestEntryClick={handleContestEntryClick}
      handleVotingSubmissionChange={handleVotingSubmissionChange}
      votingSubmission={votingSubmission}
      contestEntries={contestEntries}
    />
  );
};

export default SideContentContestVotingContainer;
