import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import { DeadlineColors } from '../../../features/achievement/AchievementConstants';
import { AchievementAbility } from '../../../features/achievement/AchievementTypes';
import { isExpired, prettifyDeadline, timeFromExpired } from './DateHelper';

type AchievementDeadlineProps = {
  deadline?: Date;
  ability: AchievementAbility;
};

const twoDays = new Date(0, 0, 2).getTime() - new Date(0, 0, 0).getTime();

function AchievementDeadline(props: AchievementDeadlineProps) {
  const { deadline, ability } = props;

  // red deadline color for core achievements that are expiring in less than 2 days
  const deadlineColor =
    ability === AchievementAbility.CORE &&
    deadline !== undefined &&
    !isExpired(deadline) &&
    timeFromExpired(deadline) <= twoDays
      ? DeadlineColors.RED
      : DeadlineColors.BLACK;

  return (
    <div className="deadline">
      <Icon icon={IconNames.STOPWATCH} color={deadlineColor} />
      <span style={{ color: deadlineColor }}>
        <p>{prettifyDeadline(deadline)}</p>
      </span>
    </div>
  );
}

export default AchievementDeadline;
