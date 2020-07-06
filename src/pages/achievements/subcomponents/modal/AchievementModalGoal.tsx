import React from 'react';
import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

type AchievementModalGoalProps = {
  goalText: string;
};

function AchievementModalGoal(props: AchievementModalGoalProps) {
  const { goalText } = props;

  return (
    <div className="goal">
      <div className="goal-medal">
        <Icon color="#F0E68C" className="goal-award" iconSize={44} icon={IconNames.BADGE} />
        <div>100 / 100 XP</div>
      </div>
      <div className="goal-text">{goalText}</div>
    </div>
  );
}

export default AchievementModalGoal;
