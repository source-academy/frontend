import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

import { AchievementAbility } from '../../../../../features/achievement/AchievementTypes';
import { AchievementColors } from '../../Dashboard';
import { prettifyDeadline } from './DateHelper';

type AchievementDeadlineProps = {
  deadline?: Date;
  ability: AchievementAbility;
};

function AchievementDeadline(props: AchievementDeadlineProps) {
  const { deadline, ability } = props;

  const now = new Date();
  now.setDate(new Date().getDate() + 2);
  // red deadline color for core achievements that are expiring in less than 2 days
  const deadlineColor =
    ability === AchievementAbility.CORE &&
    deadline !== undefined &&
    now < deadline &&
    deadline.getTime() <= now.getTime()
      ? AchievementColors.red
      : AchievementColors.black;

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
