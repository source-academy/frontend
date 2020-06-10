import React from 'react';
import { Card, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

type AchievementCardProps = {
  title: string;
  subachievements: any[];
  isDropdownOpen: boolean;
  toggleDropdown: any;
  displayModal: any;
};

function AchievementCard(props: AchievementCardProps) {
  const { title, subachievements, isDropdownOpen, toggleDropdown, displayModal } = props;

  const hasDropdown = subachievements.length > 0;

  return (
    <Card className="achievement" onClick={displayModal(title)} onClickCapture={toggleDropdown}>
      {hasDropdown ? (
        <div className="dropdown">
          <Icon
            icon={isDropdownOpen ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT}
          />
        </div>
      ) : (
        <div className="dropdown"></div>
      )}
      <div className="icon">
        <Icon icon={IconNames.PREDICTIVE_ANALYSIS} iconSize={28} />
      </div>
      <h1>{title}</h1>
    </Card>
  );
}

export default AchievementCard;
