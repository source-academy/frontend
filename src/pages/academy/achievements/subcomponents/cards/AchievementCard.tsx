import React from 'react';
import Inferencer from '../utils/Inferencer';
import { Card, Icon } from '@blueprintjs/core';
import AchievementHints from '../utils/AchievementHints';
import { IconNames } from '@blueprintjs/icons';
import AchievementDeadline from '../utils/AchievementDeadline';
import AchievementExp from '../utils/AchievementExp';
import AchievementProgressBar from '../utils/AchievementProgressBar';

type AchievementCardProps = {
  id: number;
  inferencer: Inferencer;
  shouldPartiallyRender: boolean;
  isDropdownOpen: boolean;
  toggleDropdown: any;
  displayModal: any;
};

function AchievementCard(props: AchievementCardProps) {
  const {
    id,
    inferencer,
    shouldPartiallyRender,
    isDropdownOpen,
    toggleDropdown,
    displayModal
  } = props;

  const { title, ability, release } = inferencer.getAchievementItem(id);

  const totalExp = inferencer.getTotalExp(id);
  const furthestDeadline = inferencer.getFurthestDeadline(id);
  const collectiveProgress = inferencer.getCollectiveProgress(id);

  const hasDropdown: boolean = inferencer.getImmediateChildren(id).size > 0;

  return (
    <Card
      className="achievement"
      style={{ opacity: shouldPartiallyRender ? '20%' : '100%' }}
      onClick={() => displayModal(id)}
      onClickCapture={toggleDropdown}
    >
      <AchievementHints release={release} />

      <div className="main">
        {hasDropdown ? (
          <div className="dropdown">
            <Icon icon={isDropdownOpen ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT} />
          </div>
        ) : null}

        <div className="icon">
          <Icon icon={IconNames.PREDICTIVE_ANALYSIS} iconSize={28} />
        </div>

        <div className="display">
          <div>
            <h1>{title}</h1>
          </div>

          <div className="details">
            <div className="ability">
              <p>{ability}</p>
            </div>

            <AchievementDeadline deadline={furthestDeadline} />

            <AchievementExp exp={totalExp} />
          </div>
        </div>
      </div>

      <AchievementProgressBar
        progress={collectiveProgress}
        shouldAnimate={!shouldPartiallyRender}
      />
    </Card>
  );
}

export default AchievementCard;
