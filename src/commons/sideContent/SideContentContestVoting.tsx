import { Button, Card, Classes, Collapse, Elevation, Icon, Pre } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import classNames from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';

import { ContestEntry } from '../assessment/AssessmentTypes';

export type SideContentContestVotingProps = DispatchProps & StateProps;

type DispatchProps = {
  handleContestEntryClick: (submissionId: number, answer: string) => void;
};

type StateProps = {
  canSave: boolean;
  isValid: boolean;
  handleVotingSubmissionChange: (entryId: number, score: number) => void;
  contestEntries: ContestEntry[]
};

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
  const [currentDraggedItem, setCurrentDraggedItem] = useState<HTMLElement | null>(null);
  const [placeholder, setPlaceholder] = useState<HTMLElement | null>(null);

  const handleDragStart: React.DragEventHandler = (e) => {
    console.log('Drag Start');
    setCurrentDraggedItem(e.currentTarget as HTMLElement);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = useCallback((contestEntry: ContestEntry): React.DragEventHandler => (e) => {
    console.log('Drag End');
    (e.currentTarget as HTMLElement).style.opacity = '';

    let tierElement: HTMLElement | null = e.currentTarget as HTMLElement;
    while (tierElement && !tierElement.classList.contains('tier')) {
      tierElement = tierElement.parentElement;
    }

    if (tierElement) {
      const tierMapping = {
        'tier-d': 1,
        'tier-c': 2,
        'tier-b': 4,
        'tier-a': 7,
        'tier-s': 10
      };
      handleVotingSubmissionChange(contestEntry.submission_id, tierMapping[tierElement.id]);
      console.log(tierMapping[tierElement.id]);
    } else {
      handleVotingSubmissionChange(contestEntry.submission_id, 0);
    }
  }, [handleVotingSubmissionChange]);

  const handleDragOver: React.DragEventHandler = (e) => {
    console.log('Drag Over');
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const createPlaceholder = (): HTMLElement => {
    console.log('create placeholder');
    const el = document.createElement('div');
    el.classList.add('placeholder');
    setPlaceholder(el); // update the placeholder state with the new element
    return el;
  };

  const handleDragEnter = useCallback((e: React.DragEvent): void => {
    console.log('Drag Enter');
    if (e.currentTarget.classList.contains('item-container')) {
      if (!placeholder) {
        setPlaceholder(createPlaceholder());
      }

      let insertBeforeElement: HTMLElement | null = null;

      for (const child of Array.from((e.currentTarget as HTMLElement).children)) {
        if (child === currentDraggedItem || child === placeholder) continue;

        const childRect = (child as HTMLElement).getBoundingClientRect();
        const childCenter = (childRect.left + childRect.right) / 2;

        if (e.clientX < childCenter) {
          insertBeforeElement = child as HTMLElement;
          break;
        }
      }
      if (insertBeforeElement && placeholder) {
        e.currentTarget.insertBefore(placeholder as Node, insertBeforeElement);
      } else if (placeholder) {
        e.currentTarget.appendChild(placeholder as Node);
      }
    }
  }, [placeholder, currentDraggedItem]);

  const handleDragLeave = useCallback((e: React.DragEvent): void => {
    console.log('Drag Leave');
    const container = e.currentTarget as HTMLElement;
    if (
      container.classList.contains('item-container') &&
      !currentDraggedItem?.contains(e.relatedTarget as Node) &&
      !placeholder?.contains(e.relatedTarget as Node) &&
      container.contains(placeholder as Node)
    ) {
      container.removeChild(placeholder as Node);
    }
  }, [placeholder, currentDraggedItem]);

  const handleDrop = useCallback((e: React.DragEvent): void => {
    console.log('Drop');
    e.preventDefault();
    const container = (e.currentTarget as HTMLElement).closest('.item-container');
    if (container && container.contains(placeholder)) {
      container.insertBefore(currentDraggedItem as Node, placeholder as Node);
      container.removeChild(placeholder as Node);
    }
  }, [currentDraggedItem, placeholder]);

  const tierBoard = (
    ['S', 'A', 'B', 'C', 'D'].map((tier) => (
      <div className={"tier"} key={`tier-${tier.toLowerCase()}`} id={`tier-${tier.toLowerCase()}`}>
        <h2>{tier}</h2>
        <div className="item-container" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDragEnter={handleDragEnter} onDrop={handleDrop}></div>
      </div>
    ))
  );

  const contestEntryCards = useMemo(
    () => (
      <div className="tier-list">
        {tierBoard}
        {contestEntries.length > 0 ? (
          <div className="tier" id="bank">
            <div className="item-container" id="items" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDragEnter={handleDragEnter} onDrop={handleDrop}>
              {contestEntries.map((contestEntry: ContestEntry, index) => (
                <div className={classNames('item', { wrong: !isValid })} draggable={canSave} key={`item-${index + 1}`} id={`item-${index + 1}`} onDragStart={handleDragStart} onDragEnd={handleDragEnd(contestEntry)}>
                  <Card
                    className={Classes.INTERACTIVE}
                    elevation={Elevation.ONE}
                    onClick={() =>
                      handleContestEntryClick(contestEntry.submission_id, contestEntry.answer.code ?? '')
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
    // determines when to re-render
    [
      isValid,
      canSave,
      contestEntries,
      handleContestEntryClick,
      handleDragEnter,
      handleDragLeave,
      handleDrop,
      handleDragEnd,
      tierBoard
    ]
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
        <Tooltip2
          content={
            <span>
              Rank your favourite contest entries from tiers D (worst) to S (best)!
            </span>
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