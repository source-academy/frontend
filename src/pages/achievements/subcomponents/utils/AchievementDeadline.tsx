import React from 'react';
import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { prettifyDeadline } from './DateHelper';

type AchievementDeadlineProps = {
  deadline?: Date;
};

function AchievementDeadline(props: AchievementDeadlineProps) {
  const { deadline } = props;

  return (
    <div className="deadline">
      <Icon icon={IconNames.STOPWATCH} />
      <p>{prettifyDeadline(deadline)}</p>
    </div>
  );
}

export default AchievementDeadline;
