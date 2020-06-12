import React from 'react';
import { Card, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { AchievementItem, AchievementStatus } from '../../../../commons/achievements/AchievementTypes';
import AchievementDeadline from './AchievementDeadline';
import AchievementExp from './AchievementExp';

type AchievementCardProps = {
  achievement: AchievementItem;
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
    deadline,
    isTranslucent,
    hasDropdown,
    isDropdownOpen,
    toggleDropdown,
    displayModal
  } = props;
  const { title, ability, exp, status } = achievement;

  const getIndicatorIconName = () => {
    switch(status) {
      case AchievementStatus.ACTIVE:
        return IconNames.LOCATE;
      case AchievementStatus.COMPLETED:
        return IconNames.ENDORSED;
      case AchievementStatus.EXPIRED:
        return IconNames.DELETE;
      default: 
        return IconNames.HELP;
    }
  };

  return (
    <Card
      className="achievement"
      style={{ opacity: isTranslucent ? '20%' : '100%' }}
      onClick={displayModal(title)}
      onClickCapture={toggleDropdown}
    >

    <div className='hints'>
      <div>
      <Icon icon={getIndicatorIconName()} />
      </div>
      <div>
        {status}
      </div>
    </div>

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
    </Card>
  );
}

export default AchievementCard;
