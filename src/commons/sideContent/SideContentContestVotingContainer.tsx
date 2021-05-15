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
const SideContentContestVotingContainer: React.FunctionComponent<SideContentContestVotingContainerProps> =
  props => {
    const { canSave, contestEntries, handleSave, handleContestEntryClick } = props;
    const [isValid, setIsValid] = useState<boolean>(true);
    const [votingSubmission, setVotingSubmission] = useState<ContestEntry[]>([]);

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
        return isValid && vote.rank! >= 1 && vote.rank! <= contestEntries.length;
      }, true);
    };

    const submissionHasNoNull = (votingSubmission: ContestEntry[]) => {
      return votingSubmission.reduce((noNull, vote) => {
        return noNull && vote.rank !== undefined && vote.rank !== null;
      }, true);
    };

    const handleVotingSubmissionChange = (submissionId: number, rank: number): void => {
      // update the votes
      const updatedSubmission = votingSubmission.map(vote =>
        vote.submission_id === submissionId ? { ...vote, rank: rank } : vote
      );
      setVotingSubmission(updatedSubmission);
      const noDuplicates =
        new Set(updatedSubmission.map(vote => vote.rank)).size === updatedSubmission.length;
      // validate that scores are unique
      const noNull = submissionHasNoNull(updatedSubmission);
      if (noDuplicates && noNull && isSubmissionValid(updatedSubmission)) {
        handleSave(updatedSubmission);

        setIsValid(true);
      } else if (noDuplicates && noNull) {
        showWarningMessage(
          `Vote rankings invalid. Please input rankings between 1 - ${contestEntries.length}.`
        );
        setIsValid(false);
      } else if (!noDuplicates && noNull) {
        showWarningMessage('Vote scores are not unique. Please input unique rankings.');
        setIsValid(false);
      } else {
        showWarningMessage('Something went wrong. Please try again.');
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
