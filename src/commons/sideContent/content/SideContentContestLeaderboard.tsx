import { Button, Collapse, Icon, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('sideContent', { keyPrefix: 'contestLeaderboard' });
  const { orderedContestEntries, handleContestEntryClick, leaderboardType } = props;
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  /**
   * Contest Leaderboard inner components
   */

  const leaderboardTitle = useMemo(() => {
    return leaderboardType === SideContentType.scoreLeaderboard
      ? t('titles.score')
      : leaderboardType === SideContentType.popularVoteLeaderboard
        ? t('titles.popularVote')
        : t('titles.default');
  }, [leaderboardType, t]);

  const contestLeaderboardTooltipContent = useMemo(() => {
    return leaderboardType === SideContentType.scoreLeaderboard
      ? t('tooltips.score')
      : leaderboardType === SideContentType.popularVoteLeaderboard
        ? t('tooltips.popularVote')
        : t('tooltips.default');
  }, [leaderboardType, t]);

  const columnHeader = (colClass: string, colTitle: string) => (
    <div className={colClass}>
      {colTitle}
      <Icon icon={IconNames.CARET_DOWN} />
    </div>
  );

  const contestEntryHeader = useMemo(() => {
    return (
      <div className="leaderboard-header">
        {columnHeader('header-entryid', t('headers.studentName'))}
        {columnHeader('header-entryrank', t('headers.rank'))}
        {columnHeader(
          'header-score',
          leaderboardType === SideContentType.scoreLeaderboard
            ? t('headers.score.calculated')
            : leaderboardType === SideContentType.popularVoteLeaderboard
              ? t('headers.score.popularity')
              : t('headers.score.default')
        )}
      </div>
    );
  }, [leaderboardType, t]);

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
              rank={contestEntry.rank ?? index + 1}
            />
          ))
        ) : (
          <div className="noResults">{t('noEntries')}</div>
        )}
      </div>
    ),
    [handleContestEntryClick, orderedContestEntries, contestEntryHeader, t]
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
