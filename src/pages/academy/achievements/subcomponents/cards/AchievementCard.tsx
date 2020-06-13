import React from 'react';
import { Card, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { AchievementItem } from '../../../../../commons/achievements/AchievementTypes';
import AchievementDeadline from '../utils/AchievementDeadline';
import AchievementExp from '../utils/AchievementExp';
import AchievementHints from '../utils/AchievementHints';
import AchievementProgressBar from '../utils/AchievementProgressBar';

type AchievementCardProps = {
  achievement: AchievementItem;
  exp: number | undefined;
  deadline: Date | undefined;
  hasDropdown: boolean;
  isTranslucent: boolean;
  isDropdownOpen: boolean;
  toggleDropdown: any;
  displayModal: any;
};

function AchievementCard(props: AchievementCardProps) {
  const {
    achievement,
    exp,
    deadline,
    isTranslucent,
    hasDropdown,
    isDropdownOpen,
    toggleDropdown,
    displayModal
  } = props;
  const { id, title, ability, status } = achievement;

  return (
    <Card
      className="achievement"
      style={{ opacity: isTranslucent ? '20%' : '100%' }}
      onClick={displayModal(id)}
      onClickCapture={toggleDropdown}
    >
      <AchievementHints status={status} />

      <div className="main">
        {hasDropdown ? (
          <div className="dropdown">
            <Icon icon={isDropdownOpen ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT} />
          </div>
        ) : (
          <div className="dropdown"></div>
        )}
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

            <AchievementDeadline deadline={deadline} />

            <AchievementExp exp={exp} />
          </div>
        </div>
      </div>

      <AchievementProgressBar value={0.8} />
    </Card>
  );
}

export default AchievementCard;
