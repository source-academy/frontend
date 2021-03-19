import React, { useState } from 'react';

import {
  AssessmentStatus,
  ContestEntry,
  ContestVotingSubmission
} from '../assessment/AssessmentTypes';
import SideContentContestVoting from './SideContentContestVoting';

export type SideContentContestVotingContainerProps = DispatchProps & StateProps;

type DispatchProps = {
  handleContestEntryClick: (submission_id: number, answer: string) => void;
  handleSave: (votingSubmission: ContestVotingSubmission) => void;
};

type StateProps = {
  assessmentStatus?: AssessmentStatus;
  contestEntries: ContestEntry[];
};

/**
 * Container to separate behaviour concerns from rendering concerns
 * Stores component-level voting ranking state
 */
const SideContentContestVotingContainer: React.FunctionComponent<SideContentContestVotingContainerProps> = props => {
  const { assessmentStatus, contestEntries, handleSave, handleContestEntryClick } = props;
  const [votingSubmission, setVotingSubmission] = useState<ContestVotingSubmission>({});

  const handleVotingSubmissionChange = (submission_id: number, rank: number): void => {
    const updatedSubmission = { ...votingSubmission, [submission_id]: rank };
    setVotingSubmission(updatedSubmission);
    handleSave(updatedSubmission);
  };

  return (
    <SideContentContestVoting
      assessmentStatus={assessmentStatus}
      handleContestEntryClick={handleContestEntryClick}
      handleVotingSubmissionChange={handleVotingSubmissionChange}
      votingSubmission={votingSubmission}
      contestEntries={contestEntries}
    />
  );
};

export default SideContentContestVotingContainer;
