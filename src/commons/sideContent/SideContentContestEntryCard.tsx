import { Card, Classes, Elevation, NumericInput, Pre } from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';

import { ContestEntry, ContestVotingSubmission } from '../assessment/AssessmentTypes';

type SideContentConstestEntryCardProps = DispatchProps & StateProps;

type DispatchProps = {
  handleContestEntryClick: (studentUsername: string, program: string) => void;
};

type StateProps = {
  handleVotingSubmissionChange: (entryId: string, rank: number) => void;
  contestEntry: ContestEntry;
  votingSubmission: ContestVotingSubmission;
  maxRank: number;
};

const SideContentContestEntryCard: React.FunctionComponent<SideContentConstestEntryCardProps> = props => {
  const {
    handleContestEntryClick,
    handleVotingSubmissionChange,
    votingSubmission,
    contestEntry,
    maxRank
  } = props;

  return (
    <div className={classNames('ContestEntryCard')}>
      <Card
        className={Classes.INTERACTIVE}
        elevation={Elevation.ONE}
        onClick={() => handleContestEntryClick(contestEntry.studentUsername, contestEntry.program)}
      >
        <Pre className="contestentry-entryid">{contestEntry.studentUsername}</Pre>
        <Pre className="contestentry-rank">
          <NumericInput
            value={votingSubmission[contestEntry.studentUsername]}
            onValueChange={(rank: number) =>
              handleVotingSubmissionChange(contestEntry.studentUsername, rank)
            }
            min={1}
            max={maxRank}
            placeholder={`Enter rank for ${contestEntry.studentUsername}`}
            allowNumericCharactersOnly
            fill
          />
        </Pre>
      </Card>
    </div>
  );
};

export default SideContentContestEntryCard;
