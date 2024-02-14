import { Card, Classes, Elevation, Pre } from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';

import { ContestEntry } from '../assessment/AssessmentTypes';
import { SideContentType } from './SideContentTypes';

type SideContentLeaderboardCardProps = DispatchProps & StateProps;

type DispatchProps = {
  handleContestEntryClick: (submissionId: number, answer: string) => void;
};

type StateProps = {
  contestEntry: ContestEntry;
  rank: number;
  leaderboardType: SideContentType;
};

const SideContentLeaderboardCard: React.FunctionComponent<
  SideContentLeaderboardCardProps
> = props => {
  const { handleContestEntryClick, contestEntry, rank, leaderboardType } = props;

  let score;
  switch (leaderboardType) {
    case SideContentType.scoreLeaderboard:
      score = contestEntry.final_calculated_score;
      break;
    case SideContentType.popularVoteLeaderboard:
      score = contestEntry.final_popularity_score;
      break;
    default:
      score = 0;
  }

  return (
    <div className={classNames('LeaderboardCard')}>
      <Card
        className={Classes.INTERACTIVE}
        elevation={Elevation.ONE}
        onClick={() =>
          handleContestEntryClick(contestEntry.submission_id, contestEntry.answer.code ?? '')
        }
        data-testid="SideContentLeaderboardCard"
      >
        <Pre className="contestentry-entryid">{contestEntry.student_name}</Pre>
        <Pre className="contestentry-rank">{rank}</Pre>
        <Pre className="contestentry-score" data-testid="contestentry-score">
          {score}
        </Pre>
      </Card>
    </div>
  );
};

export default SideContentLeaderboardCard;
