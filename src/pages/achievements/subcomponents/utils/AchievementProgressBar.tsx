import React from 'react';
import { ProgressBar } from '@blueprintjs/core';

type AchievementProgressBarProps = {
  progress: number;
  shouldAnimate: boolean;
};

function AchievementProgressBar(props: AchievementProgressBarProps) {
  const { progress, shouldAnimate } = props;

  return (
    <div className="progress">
      <ProgressBar
        intent={progress === 1 ? 'success' : undefined}
        value={progress}
        animate={shouldAnimate}
      />
    </div>
  );
}

export default AchievementProgressBar;
