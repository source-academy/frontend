import React, { useState } from 'react';
import { showWarningMessage } from 'src/commons/utils/NotificationsHelper';

import { ContestEntry, ContestVotingSubmission } from '../assessment/AssessmentTypes';
import SideContentContestVoting from './SideContentContestVoting';

export type SideContentContestVotingContainerProps = DispatchProps & StateProps;

type DispatchProps = {
  handleContestEntryClick: (submissionId: number, answer: string) => void;
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
  const generateSavedVotes = (savedContestEntries: ContestEntry[]): ContestVotingSubmission => {
    return savedContestEntries.reduce((acc, entry) => {
      return { ...acc, [entry.submission_id]: entry.score };
    }, {});
  };

  const { canSave, contestEntries, handleSave, handleContestEntryClick } = props;
  const [isValid, setIsValid] = useState<boolean>(true);
  const [votingSubmission, setVotingSubmission] = useState<ContestVotingSubmission>(
    generateSavedVotes(contestEntries)
  );

  /**
   * Validates input value and clamps the value within the min-max range [1, number of entries].
   * @param votingSubmission voting scores by user for each contest entry.
   * @returns boolean value for whether the scores are within the min-max range.
   */
  const isValidVotingSubmission = (votingSubmission: ContestVotingSubmission) => {
    return Object.values(votingSubmission).reduce((isValid, score) => {
      return isValid && score >= 1 && score <= contestEntries.length;
    }, true);
  };

  const handleVotingSubmissionChange = (submissionId: number, rank: number): void => {
    const updatedSubmission = { ...votingSubmission, [submissionId]: rank };
    // only save if valid - else trigger error in UI
    if (isValidVotingSubmission(updatedSubmission)) {
      setVotingSubmission(updatedSubmission);
      const noDuplicates =
        new Set(Object.values(updatedSubmission)).size === Object.values(updatedSubmission).length;
      // valid that scores are unique
      if (noDuplicates) {
        setIsValid(true);
        handleSave(updatedSubmission);
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
      votingSubmission={votingSubmission}
      contestEntries={contestEntries}
    />
  );
};

export default SideContentContestVotingContainer;
