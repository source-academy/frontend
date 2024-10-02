import { Button, Collapse, Icon, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useMemo, useState } from 'react';

import { ContestEntry } from '../../assessment/AssessmentTypes';
import { SideContentType } from '../SideContentTypes';
import SideContentLeaderboardCard from './SideContentLeaderboardCard';

export type SideContentContestLeaderboardProps = DispatchProps & StateProps;

type DispatchProps = {
  handleContestEntryClick: (submissionId: number, answer: string) => void;
};

type StateProps = {
  orderedContestEntries: ContestEntry[];
  leaderboardType: SideContentType;
};

/**
 * Renders the contest leaderboard entries as a SideContentTab for Contest Voting questions.
 * Note that the prop is named 'orderedContestEntries' as the responsibility to sort
 * in desc score order is left to the backend.
 *
 * @param props {orderedContestEntries: an ordered list by desc score of leaderboard entries to display,
 *  handleContestEntryClick: displays contest entry answer in assessment workspace editor}
 */
const SideContentContestLeaderboard: React.FC<SideContentContestLeaderboardProps> = props => {
  const { orderedContestEntries, handleContestEntryClick, leaderboardType } = props;
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  /**
   * Contest Leaderboard inner components
   */

  const leaderboardTitle = useMemo(() => {
    return leaderboardType === SideContentType.scoreLeaderboard
      ? 'Score Leaderboard'
      : leaderboardType === SideContentType.popularVoteLeaderboard
        ? 'Popular Vote Leaderboard'
        : 'Contest Leaderboard';
  }, [leaderboardType]);

  const contestLeaderboardTooltipContent = useMemo(() => {
    return leaderboardType === SideContentType.scoreLeaderboard
      ? 'View the highest scoring contest entries!'
      : leaderboardType === SideContentType.popularVoteLeaderboard
        ? 'View the most popular contest entries!'
        : 'View the top-rated contest entries!';
  }, [leaderboardType]);

  const columnHeader = (colClass: string, colTitle: string) => (
    <div className={colClass}>
      {colTitle}
      <Icon icon={IconNames.CARET_DOWN} />
    </div>
  );

  const contestEntryHeader = useMemo(() => {
    return (
      <div className="leaderboard-header">
        {columnHeader('header-entryid', 'Student Name')}
        {columnHeader('header-entryrank', 'Rank')}
        {columnHeader(
          'header-score',
          leaderboardType === SideContentType.scoreLeaderboard
            ? 'Calculated Score'
            : leaderboardType === SideContentType.popularVoteLeaderboard
              ? 'Popularity Score'
              : 'Metric'
        )}
      </div>
    );
  }, [leaderboardType]);

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
    [handleContestEntryClick, orderedContestEntries, contestEntryHeader]
  );

  return (
    <div className="ContestLeaderboard">
      <Button
        className="collapse-button"
        icon={showLeaderboard ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT}
        minimal={true}
        onClick={() => setShowLeaderboard(!showLeaderboard)}
      >
        <span>{leaderboardTitle}</span>
        <Tooltip content={contestLeaderboardTooltipContent}>
          <Icon icon={IconNames.HELP} />
        </Tooltip>
      </Button>
      <Collapse isOpen={showLeaderboard} keepChildrenMounted>
        {contestEntryCards}
      </Collapse>
    </div>
  );
};

export default SideContentContestLeaderboard;
