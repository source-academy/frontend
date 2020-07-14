import React from 'react';
import Inferencer from '../utils/Inferencer';
import { Icon } from '@blueprintjs/core';
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
    displayModal
  } = props;

  const { title, ability, release, backgroundImageUrl } = inferencer.getAchievementItem(id);

  const exp = inferencer.getExp(id);
  const furthestDeadline = inferencer.getFurthestDeadline(id);
  const progressFrac = inferencer.getProgressFrac(id);

  const hasDropdown: boolean = inferencer.getImmediateChildren(id).size > 0;

  return (
    <div
      className="achievement-card"
      style={{
        opacity: shouldPartiallyRender ? '20%' : '100%',
        background: `url(${backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
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
          <h3>{title.toUpperCase()}</h3>
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
    </div>
  );
}

export default AchievementCard;
