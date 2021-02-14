import { Card, Classes, Elevation, NumericInput, Pre } from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';

import { ContestEntry, ContestVotingSubmission } from '../assessment/AssessmentTypes';

type SideContentConstestEntryCardProps = DispatchProps & StateProps;

type DispatchProps = {
  handleContestEntryClick: (submission_id: number, answer: string) => void;
};

type StateProps = {
  handleVotingSubmissionChange: (entryId: number, rank: number) => void;
  contestEntry: ContestEntry;
  entryNumber: number;
  votingSubmission: ContestVotingSubmission;
  maxRank: number;
};

const SideContentContestEntryCard: React.FunctionComponent<SideContentConstestEntryCardProps> = props => {
  const {
    handleContestEntryClick,
    handleVotingSubmissionChange,
    votingSubmission,
    contestEntry,
    entryNumber,
    maxRank
  } = props;

  return (
    <div className={classNames('ContestEntryCard')}>
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
            value={votingSubmission[contestEntry.submission_id] ?? contestEntry.score}
            onValueChange={(rank: number) =>
              handleVotingSubmissionChange(contestEntry.submission_id, rank)
            }
            min={1}
            max={maxRank}
            placeholder={`Enter rank for entry ${contestEntry.submission_id}`}
            allowNumericCharactersOnly
            fill
          />
        </Pre>
      </Card>
    </div>
  );
};

export default SideContentContestEntryCard;
