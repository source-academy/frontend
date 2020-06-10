import React from 'react';
import { Card, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { AchievementPath } from 'src/commons/achievements/AchievementTypes';

type AchievementCardProps = {
  title: string;
  subachievements: any[];
  isDropdownOpen: boolean;
  toggleDropdown: any;
  displayModal: any;
  path: AchievementPath;
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
    path,
    exp,
    deadline
  } = props;

  const hasDropdown = subachievements.length > 0;

  const getTimeRemaining = () => {
    if (deadline) {
      if (deadline.getTime() >= new Date().getTime()) {
        const hoursLeft = Math.floor(
          (deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60)
        );
        return `${hoursLeft} hours`;
      }

      return 'Expired';
    }

    return '';
  };

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
          <div>
            <p>{path}</p>
          </div>

          <div>
            <p>{getTimeRemaining()}</p>
          </div>

          <div>
            <p>{`${exp} XP`}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default AchievementCard;
