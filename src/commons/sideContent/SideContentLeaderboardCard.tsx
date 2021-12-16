import { Card, Classes, Elevation, Pre } from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';

import { ContestEntry } from '../assessment/AssessmentTypes';

type SideContentLeaderboardCardProps = DispatchProps & StateProps;

type DispatchProps = {
  handleContestEntryClick: (submissionId: number, answer: string) => void;
};

type StateProps = {
  contestEntry: ContestEntry;
  rank: number;
};

const SideContentLeaderboardCard: React.FunctionComponent<
  SideContentLeaderboardCardProps
> = props => {
  const { handleContestEntryClick, contestEntry, rank } = props;

  return (
    <div className={classNames('LeaderboardCard')}>
      <Card
        className={Classes.INTERACTIVE}
        elevation={Elevation.ONE}
        onClick={() =>
          handleContestEntryClick(contestEntry.submission_id, contestEntry.answer.code ?? '')
        }
      >
        <Pre className="contestentry-entryid">{contestEntry.student_name}</Pre>
        <Pre className="contestentry-rank">{rank}</Pre>
        <Pre className="contestentry-score">{contestEntry.final_score}</Pre>
      </Card>
    </div>
  );
};

export default SideContentLeaderboardCard;
