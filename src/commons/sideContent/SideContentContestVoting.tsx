import { Button, Collapse, Icon, PopoverPosition, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useMemo, useState } from 'react';

import { ContestEntry, ContestVotingSubmission } from '../assessment/AssessmentTypes';
import SideContentContestEntryCard from './SideContentContestEntryCard';

export type SideContentContestVotingProps = DispatchProps & StateProps;

type DispatchProps = {
  handleContestEntryClick: (studentUsername: string, program: string) => void;
};

type StateProps = {
  handleVotingSubmissionChange: (entryId: string, rank: number) => void;
  votingSubmission: ContestVotingSubmission;
  contestEntries: ContestEntry[];
};

/*
Contest voting inner components
*/
const columnHeader = (colClass: string, colTitle: string) => (
  <div className={colClass}>
    {colTitle}
    <Icon icon={IconNames.CARET_DOWN} />
  </div>
);

const contestEntryHeader = (
  <div className="contestentries-header">
    {columnHeader('header-entryid', 'Entry Id')}
    {columnHeader('header-entryrank', 'Rank')}
  </div>
);

const contestEntryTooltipContent = (numOfEntries: number) => (
  <span>Rank your favourite contest entries from 1 to {numOfEntries}!</span>
);

/**
 * Main contest voting tab
 * @param props contestEntries for student to vote for : ContestEntry[],
 * and behaviour for onClick: entryId => void
 */
const SideContentContestVoting: React.FunctionComponent<SideContentContestVotingProps> = props => {
  const {
    contestEntries,
    votingSubmission,
    handleContestEntryClick,
    handleVotingSubmissionChange
  } = props;
  const [showContestEntries, setShowContestEntries] = useState<boolean>(true);

  const contestEntryCards = useMemo(
    () => (
      <div>
        {contestEntryHeader}
        {contestEntries.map((contestEntry: ContestEntry) => (
          <SideContentContestEntryCard
            key={contestEntry.studentUsername}
            handleContestEntryClick={handleContestEntryClick}
            votingSubmission={votingSubmission}
            handleVotingSubmissionChange={handleVotingSubmissionChange}
            contestEntry={contestEntry}
            maxRank={contestEntries.length}
          />
        ))}
      </div>
    ),
    [contestEntries, handleContestEntryClick, handleVotingSubmissionChange, votingSubmission]
  );

  return (
    <div className="ContestEntryVoting">
      <Button
        className="collapse-button"
        icon={showContestEntries ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT}
        minimal={true}
        onClick={() => setShowContestEntries(!showContestEntries)}
      >
        <span>Contest Voting</span>
        <Tooltip
          content={contestEntryTooltipContent(contestEntries.length)}
          position={PopoverPosition.LEFT}
          boundary={'window'}
        >
          <Icon icon={IconNames.HELP} />
        </Tooltip>
      </Button>
      <Collapse isOpen={showContestEntries} keepChildrenMounted>
        {contestEntryCards}
      </Collapse>
    </div>
  );
};

export default SideContentContestVoting;
