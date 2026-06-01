import { Card, Classes, Elevation, Pre } from '@blueprintjs/core';
import classNames from 'classnames';

import type { ContestEntry } from '../../assessment/AssessmentTypes';

type Props = {
  handleContestEntryClick: (submissionId: number, answer: string) => void;
  contestEntry: ContestEntry;
  rank: number;
};

function SideContentLeaderboardCard({ handleContestEntryClick, contestEntry, rank }: Props) {
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
          {contestEntry.final_score}
        </Pre>
      </Card>
    </div>
  );
}

export default SideContentLeaderboardCard;
