import { Button, Collapse, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import React, { useMemo, useState } from 'react';

import { ContestEntry } from '../assessment/AssessmentTypes';
import SideContentLeaderboardCard from './SideContentLeaderboardCard';

export type SideContentContestLeaderboardProps = DispatchProps & StateProps;

type DispatchProps = {
  handleContestEntryClick: (submissionId: number, answer: string) => void;
};

type StateProps = {
  orderedContestEntries: ContestEntry[];
};

/*
Contest Leaderboard inner components
*/
const columnHeader = (colClass: string, colTitle: string) => (
  <div className={colClass}>
    {colTitle}
    <Icon icon={IconNames.CARET_DOWN} />
  </div>
);

const contestEntryHeader = (
  <div className="leaderboard-header">
    {columnHeader('header-entryid', 'Student Name')}
    {columnHeader('header-entryrank', 'Rank')}
    {columnHeader('header-score', 'Score')}
  </div>
);

const contestLeaderboardTooltipContent = 'View the top-rated contest entries!';

/**
 * Renders the contest leaderboard entries as a SideContentTab for Contest Voting questions.
 * Note that the prop is named 'orderedContestEntries' as the responsibility to sort
 * in desc score order is left to the backend.
 *
 * @param props {orderedContestEntries: an ordered list by desc score of leaderboard entries to display,
 *  handleContestEntryClick: displays contest entry answer in assessment workspace editor}
 */
const SideContentContestLeaderboard: React.FunctionComponent<
  SideContentContestLeaderboardProps
> = props => {
  const { orderedContestEntries, handleContestEntryClick } = props;
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(true);

  const contestEntryCards = useMemo(
    () => (
      <div>
        {contestEntryHeader}
        {orderedContestEntries.length > 0 ? (
          orderedContestEntries.map((contestEntry: ContestEntry, index: number) => (
            <SideContentLeaderboardCard
              key={contestEntry.submission_id}
              handleContestEntryClick={handleContestEntryClick}
              contestEntry={contestEntry}
              rank={index + 1}
            />
          ))
        ) : (
          <div className="noResults">There are no eligible contest leaderboard entries found.</div>
        )}
      </div>
    ),
    [handleContestEntryClick, orderedContestEntries]
  );

  return (
    <div className="ContestLeaderboard">
      <Button
        className="collapse-button"
        icon={showLeaderboard ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT}
        minimal={true}
        onClick={() => setShowLeaderboard(!showLeaderboard)}
      >
        <span>Contest Leaderboard</span>
        <Tooltip2 content={contestLeaderboardTooltipContent}>
          <Icon icon={IconNames.HELP} />
        </Tooltip2>
      </Button>
      <Collapse isOpen={showLeaderboard} keepChildrenMounted>
        {contestEntryCards}
      </Collapse>
    </div>
  );
};

export default SideContentContestLeaderboard;
