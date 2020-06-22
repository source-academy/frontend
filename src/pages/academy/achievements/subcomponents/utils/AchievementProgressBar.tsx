import React from 'react';
import { ProgressBar } from '@blueprintjs/core';

type AchievementProgressBarProps = {
  completionProgress: number;
  completionGoal: number;
  shouldAnimate: boolean;
};

function AchievementProgressBar(props: AchievementProgressBarProps) {
  const { completionProgress, completionGoal, shouldAnimate } = props;

  const progressInDecimal: number = Math.min(completionProgress / completionGoal, 1);

  return (
    <div>
      <ProgressBar
        intent={progressInDecimal === 1 ? 'success' : undefined}
        value={progressInDecimal}
        animate={shouldAnimate}
      />
    </div>
  );
}

export default AchievementProgressBar;
