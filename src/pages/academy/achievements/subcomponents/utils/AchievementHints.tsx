import React from 'react';
import { IconNames } from '@blueprintjs/icons';
import { Icon } from '@blueprintjs/core';

import { AchievementStatus } from '../../../../../commons/achievements/AchievementTypes';

type AchievementHintsProps = {
  status: AchievementStatus;
};

function AchievementHints(props: AchievementHintsProps) {
  const { status } = props;

  const getIndicatorIconName = () => {
    switch (status) {
      case AchievementStatus.ACTIVE:
        return IconNames.LOCATE;
      case AchievementStatus.COMPLETED:
        return IconNames.ENDORSED;
      case AchievementStatus.EXPIRED:
        return IconNames.DELETE;
      default:
        return IconNames.HELP;
    }
  };

  return (
    <div className="hints">
      <div>
        <Icon icon={getIndicatorIconName()} />
      </div>
      <div>{status}</div>
    </div>
  );
}

export default AchievementHints;
