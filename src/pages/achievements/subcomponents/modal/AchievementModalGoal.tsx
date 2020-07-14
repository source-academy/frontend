import React from 'react';
import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { AchievementGoal } from 'src/commons/achievements/AchievementTypes';

type AchievementModalGoalProps = {
  goals: AchievementGoal[];
};

function AchievementModalGoal(props: AchievementModalGoalProps) {
  const { goals } = props;

  const mapGoalToJSX = (goal: AchievementGoal) => {
    const { goalId, goalText, goalProgress, goalTarget } = goal;
    return (
      <div className="goal" key={goalId}>
        <div className="goal-medal">
          <Icon color="#F0E68C" iconSize={28} icon={IconNames.BADGE} />
          <div className="medal-text">
            {goalProgress} / {goalTarget} XP
          </div>
        </div>
        <div className="goal-text">{goalText}</div>
      </div>
    );
  };

  return <>{goals.map(goal => mapGoalToJSX(goal))}</>;
}

export default AchievementModalGoal;
