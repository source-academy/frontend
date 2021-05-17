import { Button, Collapse, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import React, { useMemo, useState } from 'react';

import { ContestEntry } from '../assessment/AssessmentTypes';
import SideContentContestEntryCard from './SideContentContestEntryCard';

export type SideContentContestVotingProps = DispatchProps & StateProps;

type DispatchProps = {
  handleContestEntryClick: (submissionId: number, answer: string) => void;
};

type StateProps = {
  canSave: boolean;
  isValid: boolean;
  handleVotingSubmissionChange: (entryId: number, rank: number) => void;
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
  <span>Rank your favourite contest entries from 1 (best) to {numOfEntries} (worst)!</span>
);

/**
 * Main contest voting tab
 * @param props contestEntries for student to vote for : ContestEntry[],
 * and behaviour for onClick: entryId => void
 */
const SideContentContestVoting: React.FunctionComponent<SideContentContestVotingProps> = props => {
  const {
    contestEntries,
    canSave,
    isValid,
    handleContestEntryClick,
    handleVotingSubmissionChange
  } = props;
  const [showContestEntries, setShowContestEntries] = useState<boolean>(true);

  const contestEntryCards = useMemo(
    () => (
      <div>
        {contestEntryHeader}
        {contestEntries.length > 0 ? (
          contestEntries.map((contestEntry: ContestEntry, index) => (
            <SideContentContestEntryCard
              isValid={isValid}
              canSave={canSave}
              entryNumber={index + 1}
              key={contestEntry.submission_id}
              handleContestEntryClick={handleContestEntryClick}
              handleVotingSubmissionChange={handleVotingSubmissionChange}
              contestEntry={contestEntry}
              maxRank={contestEntries.length}
            />
          ))
        ) : (
          <div className="noResults">There are no eligible entries for voting found.</div>
        )}
      </div>
    ),
    // determines when to re-render
    [isValid, canSave, contestEntries, handleContestEntryClick, handleVotingSubmissionChange]
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
        <Tooltip2 content={contestEntryTooltipContent(contestEntries.length)}>
          <Icon icon={IconNames.HELP} />
        </Tooltip2>
      </Button>
      <Collapse isOpen={showContestEntries} keepChildrenMounted>
        {contestEntryCards}
      </Collapse>
    </div>
  );
};

export default SideContentContestVoting;
