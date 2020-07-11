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
  handleGlow: any;
};

function AchievementCard(props: AchievementCardProps) {
  const {
    id,
    inferencer,
    shouldPartiallyRender,
    isDropdownOpen,
    toggleDropdown,
    displayModal,
    handleGlow
  } = props;

  const { title, ability, release, backgroundImageUrl } = inferencer.getAchievementItem(id);

  const exp = inferencer.getExp(id);
  const furthestDeadline = inferencer.getFurthestDeadline(id);
  const progressFrac = inferencer.getProgressFrac(id);

  const hasDropdown: boolean = inferencer.getImmediateChildren(id).size > 0;

  return (
    <Card
      className="achievement-card"
      style={{
        ...handleGlow(id),
        opacity: shouldPartiallyRender ? '20%' : '100%',
        background: `url(${backgroundImageUrl})`
      }}
      interactive={true}
      onClick={() => displayModal(id)}
      onClickCapture={toggleDropdown}
    >
      {hasDropdown ? (
        <div className="dropdown-button">
          <Icon icon={isDropdownOpen ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT} />
        </div>
      ) : (
        <div className="dropdown-button"></div>
      )}

      <div className="content">
        <div className="heading">
          <div className="title">
            <h3>{title}</h3>
          </div>
          <AchievementHints release={release} />
        </div>

        <div className="details">
          <div className="ability">
            <p>{ability}</p>
          </div>
          <AchievementDeadline deadline={furthestDeadline} />
          <AchievementExp exp={exp} />
        </div>

        <AchievementProgressBar
          progressFrac={progressFrac}
          shouldAnimate={!shouldPartiallyRender}
        />
      </div>
    </Card>
  );
}

export default AchievementCard;
