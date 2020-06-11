import React from 'react';
import { Card, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { AchievementDetails } from '../../../../commons/achievements/AchievementTypes';
import AchievementDeadline from './AchievementDeadline';
import AchievementExp from './AchievementExp';

type AchievementCardProps = {
  title: string;
  details: AchievementDetails;
  subAchievements?: any[];
  isDropdownOpen: boolean;
  toggleDropdown: any;
  displayModal: any;
};

function AchievementCard(props: AchievementCardProps) {
  const { details, subAchievements, isDropdownOpen, toggleDropdown, title, displayModal } = props;

  const hasDropdown = subAchievements !== undefined && subAchievements.length > 0;

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
            <p>{details.ability}</p>
          </div>

          <AchievementDeadline deadline={details.deadline} />

          <AchievementExp exp={details.exp} />
        </div>
      </div>
    </Card>
  );
}

export default AchievementCard;
