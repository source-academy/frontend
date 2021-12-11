import { Card, Classes, Elevation, NumericInput, Pre } from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';

import { ContestEntry } from '../assessment/AssessmentTypes';

type SideContentConstestEntryCardProps = DispatchProps & StateProps;

type DispatchProps = {
  handleContestEntryClick: (submissionId: number, answer: string) => void;
};

type StateProps = {
  handleVotingSubmissionChange: (entryId: number, rank: number) => void;
  canSave: boolean;
  isValid: boolean;
  contestEntry: ContestEntry;
  entryNumber: number;
  minScore: number;
  maxScore: number;
};

/**
 * Pure Contest Entry Card to to provide numeric input box for contest entry voting.
 * @param props functions for handling input and contest entry details tied to contest entry card.
 * @returns card which provides numeric input to vote for contest entry.
 */
const SideContentContestEntryCard: React.FunctionComponent<
  SideContentConstestEntryCardProps
> = props => {
  const {
    canSave,
    isValid,
    handleContestEntryClick,
    handleVotingSubmissionChange,
    contestEntry,
    entryNumber,
    minScore,
    maxScore
  } = props;

  return (
    <div className={classNames('ContestEntryCard', { wrong: !isValid })}>
      <Card
        className={Classes.INTERACTIVE}
        elevation={Elevation.ONE}
        onClick={() =>
          handleContestEntryClick(contestEntry.submission_id, contestEntry.answer.code ?? '')
        }
      >
        <Pre className="contestentry-entryid">{entryNumber}</Pre>
        <Pre className="contestentry-rank">
          <NumericInput
            disabled={!canSave}
            value={contestEntry.score}
            onValueChange={(score: number) =>
              handleVotingSubmissionChange(contestEntry.submission_id, score)
            }
            placeholder={`Enter score for entry ${entryNumber}`}
            min={minScore}
            max={maxScore}
            allowNumericCharactersOnly
            fill
            minorStepSize={null} // limits input to integers
          />
        </Pre>
      </Card>
    </div>
  );
};

export default SideContentContestEntryCard;
