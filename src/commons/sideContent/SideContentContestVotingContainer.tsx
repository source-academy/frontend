import React, { useEffect, useState } from 'react';
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
const SideContentContestVotingContainer: React.FunctionComponent<
  SideContentContestVotingContainerProps
> = props => {
  const { canSave, contestEntries, handleSave, handleContestEntryClick } = props;
  const [isValid, setIsValid] = useState<boolean>(true);
  const [votingSubmission, setVotingSubmission] = useState<ContestEntry[]>([]);
  const minScore = 11 - contestEntries.length;
  const maxScore = 10;

  useEffect(() => {
    setVotingSubmission(contestEntries);
  }, [contestEntries]);

  /**
   * Validates input value and clamps the value within the min-max range [1, number of entries].
   * @param votingSubmission voting scores by user for each contest entry.
   * @returns boolean value for whether the scores are within the min-max range.
   */
  const isSubmissionValid = (votingSubmission: ContestEntry[]) => {
    return votingSubmission.reduce((isValid, vote) => {
      const score = vote.score!;
      return isValid && score >= minScore && score <= maxScore;
    }, true);
  };

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
    const noDuplicates =
      new Set(updatedSubmission.map(vote => vote.score)).size === updatedSubmission.length;
    // validate that scores are unique
    const noNull = submissionHasNoNull(updatedSubmission);
    if (noDuplicates && noNull && isSubmissionValid(updatedSubmission)) {
      handleSave(updatedSubmission);

      setIsValid(true);
    } else if (noDuplicates && noNull) {
      showWarningMessage(
        `Vote rankings invalid. Please input scores between ${minScore} - ${maxScore}.`
      );
      setIsValid(false);
    } else if (!noDuplicates && noNull) {
      showWarningMessage('Vote scores are not unique. Please input unique rankings.');
      setIsValid(false);
    } else {
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
      minScore={minScore}
      maxScore={maxScore}
    />
  );
};

export default SideContentContestVotingContainer;
