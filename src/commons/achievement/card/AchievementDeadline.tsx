import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import { DeadlineColors } from '../../../features/achievement/AchievementConstants';
import { isExpired, prettifyDeadline, timeFromExpired } from '../utils/DateHelper';

const twoDays = new Date(0, 0, 2).getTime() - new Date(0, 0, 0).getTime();

type Props = {
  deadline?: Date;
};

const AchievementDeadline: React.FC<Props> = ({ deadline }) => {
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
