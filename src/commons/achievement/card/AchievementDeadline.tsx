import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import {
  isExpired,
  prettifyDeadline,
  timeFromExpired
} from 'src/commons/achievement/utils/DateHelper';
import { DeadlineColors } from 'src/features/achievement/AchievementConstants';

type AchievementDeadlineProps = {
  deadline?: Date;
};

const twoDays = new Date(0, 0, 2).getTime() - new Date(0, 0, 0).getTime();

const AchievementDeadline: React.FC<AchievementDeadlineProps> = ({ deadline }) => {
  // red deadline color for core achievements that are expiring in less than 2 days
  const deadlineColor =
    deadline !== undefined && !isExpired(deadline) && timeFromExpired(deadline) <= twoDays
      ? DeadlineColors.RED
      : DeadlineColors.BLACK;

  return (
    <div className="deadline">
      <Icon color={deadlineColor} icon={IconNames.STOPWATCH} />
      <p style={{ color: deadlineColor }}>{prettifyDeadline(deadline)}</p>
    </div>
  );
};

export default AchievementDeadline;
