import { Button, Card, Classes, Collapse, Elevation, Icon, Pre } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ContestEntry } from '../assessment/AssessmentTypes';

export type SideContentContestVotingProps = DispatchProps & StateProps;

type DispatchProps = {
  handleContestEntryClick: (submissionId: number, answer: string) => void;
};

type StateProps = {
  canSave: boolean;
  isValid: boolean;
  handleVotingSubmissionChange: (entryId: number, score: number) => void;
  contestEntries: ContestEntry[];
};

const TIERS = [
  { name: 'S', color: 'rgb(255, 127, 127)', score: 10 },
  { name: 'A', color: 'rgb(255, 223, 127)', score: 7 },
  { name: 'B', color: 'rgb(255, 255, 127)', score: 4 },
  { name: 'C', color: 'rgb(191, 255, 127)', score: 2 },
  { name: 'D', color: 'rgb(127, 191, 255)', score: 1 }
];

const SideContentContestVoting: React.FunctionComponent<SideContentContestVotingProps> = props => {
  const {
    contestEntries,
    canSave,
    isValid,
    handleContestEntryClick,
    handleVotingSubmissionChange
  } = props;
  const [showContestEntries, setShowContestEntries] = useState<boolean>(true);
  const [currentDraggedItem, setCurrentDraggedItem] = useState<HTMLElement | null>(null);
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  const sortedContestEntries = useMemo(() => {
    return [...contestEntries].sort((a, b) => a.submission_id - b.submission_id);
  }, [contestEntries]);

  const handleDragStart: React.DragEventHandler = e => {
    setCurrentDraggedItem(e.currentTarget as HTMLElement);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = useCallback(
    (contestEntry: ContestEntry): React.DragEventHandler =>
      e => {
        const tierElement = (e.currentTarget as HTMLElement).closest('.tier');
        if (tierElement) {
          const tierName = tierElement.id.split('-')[1];
          const tier = TIERS.find(t => t.name.toLowerCase() === tierName);
          handleVotingSubmissionChange(contestEntry.submission_id, tier?.score || 0);
        }
        setHoveredTier(null);
      },
    [handleVotingSubmissionChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent): void => {
    // Added setTimeout here to give handleDragLeave time to execute if a dragenter event is about to be fired
    setTimeout(() => {
      const tierElement = (e.target as HTMLElement).closest('.tier');
      if (tierElement) {
        setHoveredTier(tierElement.id);
      }
    }, 0);
  }, []);

  const handleDragLeave = useCallback(
    (e: React.DragEvent): void => {
      const tierElement = (e.target as HTMLElement).closest('.tier');
      if (tierElement && tierElement.id === hoveredTier) {
        setHoveredTier(null);
      }
    },
    [hoveredTier]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent): void => {
      e.preventDefault();
      const container = (e.target as HTMLElement).closest('.item-container');
      if (container) {
        container.appendChild(currentDraggedItem as Node);
      }
    },
    [currentDraggedItem]
  );

  const tierBoard = useMemo(() => {
    return TIERS.map(tier => (
      <div
        className={classNames('tier', {
          'hovered-tier': hoveredTier === `tier-${tier.name.toLowerCase()}`
        })}
        key={`tier-${tier.name.toLowerCase()}`}
        id={`tier-${tier.name.toLowerCase()}`}
      >
        <h2 style={{ backgroundColor: tier.color }}>{tier.name}</h2>
        <div
          className="item-container"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDragEnter={handleDragEnter}
          onDrop={handleDrop}
        />
      </div>
    ));
  }, [hoveredTier, handleDragOver, handleDragLeave, handleDragEnter, handleDrop]);

  const contestEntryCards = useMemo(
    () => (
      <div className="tier-list">
        {tierBoard}
        {sortedContestEntries.length > 0 ? (
          <div className="tier" id="bank">
            <div
              className="item-container"
              id="items"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDragEnter={handleDragEnter}
              onDrop={handleDrop}
            >
              {sortedContestEntries.map((contestEntry: ContestEntry, index) => (
                <div
                  className={classNames('item', { wrong: !isValid })}
                  draggable={canSave}
                  key={`item-${index + 1}`}
                  id={`item-${index + 1}`}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd(contestEntry)}
                >
                  <Card
                    className={Classes.INTERACTIVE}
                    elevation={Elevation.ONE}
                    onClick={() =>
                      handleContestEntryClick(
                        contestEntry.submission_id,
                        contestEntry.answer.code ?? ''
                      )
                    }
                  >
                    <Pre className="contestentry-entryid">{index + 1}</Pre>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="noResults">There are no eligible entries for voting found.</div>
        )}
      </div>
    ),
    [
      isValid,
      canSave,
      sortedContestEntries,
      handleContestEntryClick,
      handleDragEnd,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      tierBoard
    ]
  );

  // Function for mapping legacy (and current) contest votes to the new tier system
  const mapTier = (entryScore: number) => {
    if (entryScore < 2) {
      return (tierScore: number) => tierScore === 1;
    }
    if (entryScore >= 2 && entryScore < 4) {
      return (tierScore: number) => tierScore === 2;
    }
    if (entryScore >= 4 && entryScore < 7) {
      return (tierScore: number) => tierScore === 4;
    }
    if (entryScore >= 7 && entryScore < 10) {
      return (tierScore: number) => tierScore === 7;
    }
    if (entryScore >= 10) {
      return (tierScore: number) => tierScore === 10;
    }
    return (tierScore: number) => false;
  };

  // Renders contest entries in the correct tier using saved score upon initial render
  useEffect(() => {
    sortedContestEntries.forEach((entry, index) => {
      if (entry.score !== undefined && entry.score !== null) {
        const entryScore = entry.score as number;
        const tierIndex = TIERS.findIndex(tier => mapTier(entryScore)(tier.score));
        if (tierIndex !== -1) {
          const tierElement = document.querySelector(
            `#tier-${TIERS[tierIndex].name.toLowerCase()} .item-container`
          );
          const bankElement = document.querySelector(`#bank .item-container #item-${index + 1}`);
          if (tierElement && bankElement) {
            tierElement.appendChild(bankElement);
          }
        }
      }
    });
  }, [contestEntryCards, sortedContestEntries]);

  return (
    <div className="ContestEntryVoting">
      <Button
        className="collapse-button"
        icon={showContestEntries ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT}
        minimal={true}
        onClick={() => setShowContestEntries(!showContestEntries)}
      >
        <span>Contest Voting</span>
        <Tooltip2
          content={
            <span>Rank your favourite contest entries from tiers D (worst) to S (best)!</span>
          }
        >
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
