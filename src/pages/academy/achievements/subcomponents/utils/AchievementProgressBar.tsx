import React from 'react';
import { ProgressBar } from '@blueprintjs/core';

type AchievementProgressBarProps = {
  value: number;
};

function AchievementProgressBar(props: AchievementProgressBarProps) {
  const { value } = props;

  return (
    <div>
      <ProgressBar value={value} />
    </div>
  );
}

export default AchievementProgressBar;
