import React from 'react';
import { Card, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { AchievementAbility } from 'src/commons/achievements/AchievementTypes';
import AchievementDeadline from './AchievementDeadline';
import AchievementExp from './AchievementExp';

type AchievementCardProps = {
  title: string;
  subachievements: any[];
  isDropdownOpen: boolean;
  toggleDropdown: any;
  displayModal: any;
  ability: AchievementAbility;
  exp: number;
  deadline: Date | undefined;
};

function AchievementCard(props: AchievementCardProps) {
  const {
    title,
    subachievements,
    isDropdownOpen,
    toggleDropdown,
    displayModal,
    ability,
    exp,
    deadline
  } = props;

  const hasDropdown = subachievements.length > 0;

  return (
    <Card className="achievement" onClick={displayModal(title)} onClickCapture={toggleDropdown}>
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
    </Card>
  );
}

export default AchievementCard;
