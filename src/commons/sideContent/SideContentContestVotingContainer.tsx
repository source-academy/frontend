import React, { useState } from 'react';
import { showWarningMessage } from 'src/commons/utils/NotificationsHelper';

import { ContestEntry } from '../assessment/AssessmentTypes';
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
const SideContentContestVotingContainer: React.FunctionComponent<SideContentContestVotingContainerProps> = props => {
  const { canSave, contestEntries, handleSave, handleContestEntryClick } = props;
  const [isValid, setIsValid] = useState<boolean>(true);
  const [votingSubmission, setVotingSubmission] = useState<ContestEntry[]>(contestEntries);

  /**
   * Validates input value and clamps the value within the min-max range [1, number of entries].
   * @param votingSubmission voting scores by user for each contest entry.
   * @returns boolean value for whether the scores are within the min-max range.
   */
  const isValidVotingSubmission = (votingSubmission: ContestEntry[]) => {
    return votingSubmission.reduce((isValid, vote) => {
      return isValid && vote.score! >= 1 && vote.score! <= contestEntries.length;
    }, true);
  };

  const handleVotingSubmissionChange = (submissionId: number, score: number): void => {
    // update the votes
    const updatedSubmission = votingSubmission.map(vote =>
      vote.submission_id === submissionId ? { ...vote, score: score } : vote
    );
    // only save if valid - else trigger error in UI
    if (isValidVotingSubmission(updatedSubmission)) {
      setVotingSubmission(updatedSubmission);
      const noDuplicates =
        new Set(updatedSubmission.map(vote => vote.score)).size === updatedSubmission.length;
      // validate that scores are unique
      if (noDuplicates) {
        handleSave(updatedSubmission);
        setIsValid(true);
      } else {
        showWarningMessage('Vote scores are not unique. Please try again.');
        setIsValid(false);
      }
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
