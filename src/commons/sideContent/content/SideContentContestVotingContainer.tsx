import React, { useEffect, useState } from 'react';
import { showWarningMessage } from 'src/commons/utils/notifications/NotificationsHelper';

import { ContestEntry } from '../../assessment/AssessmentTypes';
import SideContentContestVoting from './SideContentContestVoting';

export type SideContentContestVotingContainerProps = DispatchProps & StateProps;

type DispatchProps = {
  handleContestEntryClick: (submissionId: number, answer: string) => void;
  handleSave: (votingSubmission: ContestEntry[]) => void;
};

type StateProps = {
  canSave: boolean;
  contestEntries: ContestEntry[];
};

/**
 * Container to separate behaviour concerns from rendering concerns
 * Stores component-level voting ranking state
 */
const SideContentContestVotingContainer: React.FC<SideContentContestVotingContainerProps> = ({
  canSave,
  contestEntries,
  handleSave,
  handleContestEntryClick
}) => {
  const [isValid, setIsValid] = useState(true);
  const [votingSubmission, setVotingSubmission] = useState<ContestEntry[]>([]);

  useEffect(() => {
    setVotingSubmission(contestEntries);
  }, [contestEntries]);

  const submissionHasNoNull = (votingSubmission: ContestEntry[]) => {
    return votingSubmission.reduce((noNull, vote) => {
      return noNull && vote.score !== undefined && vote.score !== null;
    }, true);
  };

  const handleVotingSubmissionChange = (submissionId: number, score: number): void => {
    // update the votes
    const updatedSubmission = votingSubmission.map(vote =>
      vote.submission_id === submissionId ? { ...vote, score: score } : vote
    );
    setVotingSubmission(updatedSubmission);
    const noNull = submissionHasNoNull(updatedSubmission);
    if (noNull) {
      handleSave(updatedSubmission);
      setIsValid(true);
    } else {
      showWarningMessage(`Please assign every entry to a tier.`);
      setIsValid(false);
    }
  };

  return (
    <SideContentContestVoting
      isValid={isValid}
      canSave={canSave}
      handleContestEntryClick={handleContestEntryClick}
      handleVotingSubmissionChange={handleVotingSubmissionChange}
      contestEntries={votingSubmission}
    />
  );
};

export default SideContentContestVotingContainer;
