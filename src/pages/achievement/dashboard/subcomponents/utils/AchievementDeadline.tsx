import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import { AchievementAbility } from 'src/features/achievement/AchievementTypes';

import { prettifyDeadline } from './DateHelper';

type AchievementDeadlineProps = {
  deadline?: Date;
  ability: AchievementAbility;
};

function AchievementDeadline(props: AchievementDeadlineProps) {
  const { deadline, ability } = props;

  const oneDay = 86400000;
  const now = new Date();
  // red deadline color for core achievements that are expiring in less than 2 days
  const deadlineColor =
    ability === AchievementAbility.CORE &&
    deadline !== undefined &&
    now < deadline &&
    deadline.getTime() - now.getTime() <= 2 * oneDay
      ? '#ff0000'
      : '#000000';

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
