import React from 'react';
import { ProgressBar } from '@blueprintjs/core';

type AchievementProgressBarProps = {
  value: number;
  shouldAnimate: boolean;
};

function AchievementProgressBar(props: AchievementProgressBarProps) {
  const { value, shouldAnimate } = props;

  return (
    <div>
      <ProgressBar
        intent={value === 1 ? 'success' : undefined}
        value={value}
        animate={shouldAnimate}
      />
    </div>
  );
}

export default AchievementProgressBar;
