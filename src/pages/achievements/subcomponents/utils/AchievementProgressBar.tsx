import { ProgressBar } from '@blueprintjs/core';
import React from 'react';

type AchievementProgressBarProps = {
  progressFrac: number;
  shouldAnimate: boolean;
};

function AchievementProgressBar(props: AchievementProgressBarProps) {
  const { progressFrac, shouldAnimate } = props;

  return (
    <div>
      <ProgressBar
        className="progress"
        intent={progressFrac === 1 ? 'success' : undefined}
        value={progressFrac}
        animate={shouldAnimate}
      />
    </div>
  );
}

export default AchievementProgressBar;
