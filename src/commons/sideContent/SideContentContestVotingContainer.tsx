import React, { memo, useState } from 'react';

import { ContestEntry, ContestVotingSubmission } from '../assessment/AssessmentTypes';
import SideContentContestVoting from './SideContentContestVoting';

export type SideContentContestVotingContainerProps = DispatchProps & StateProps;

type DispatchProps = {
  handleContestEntryClick: (submission_id: number, answer: string) => void;
  handleSave: (votingSubmission: ContestVotingSubmission) => void;
};

type StateProps = {
  canSave: boolean;
  contestEntries: ContestEntry[];
};

/**
 * Container to separate behaviour concerns from rendering concerns
 * Stores component-level voting ranking state
 */
const SideContentContestVotingContainer: React.FunctionComponent<SideContentContestVotingContainerProps> = props => {
  const { canSave, contestEntries, handleSave, handleContestEntryClick } = props;
  const [votingSubmission, setVotingSubmission] = useState<ContestVotingSubmission>({});

  const handleVotingSubmissionChange = (submission_id: number, rank: number): void => {
    const updatedSubmission = { ...votingSubmission, [submission_id]: rank };
    setVotingSubmission(updatedSubmission);
    handleSave(updatedSubmission);
  };

  console.log('rerender');

  return (
    <SideContentContestVoting
      canSave={canSave}
      handleContestEntryClick={handleContestEntryClick}
      handleVotingSubmissionChange={handleVotingSubmissionChange}
      votingSubmission={votingSubmission}
      contestEntries={contestEntries}
    />
  );
};

export default memo(SideContentContestVotingContainer);
