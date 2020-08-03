import React from 'react';

import { AchievementGoal } from '../../../features/achievement/AchievementTypes';

type AchievementViewGoalProps = {
  goals: AchievementGoal[];
};

function AchievementViewGoal(props: AchievementViewGoalProps) {
  const { goals } = props;

  const mapGoalToJSX = (goal: AchievementGoal) => {
    const { goalId, goalText, goalProgress, goalTarget } = goal;
    return (
      <div className="goal" key={goalId}>
        <div className="goal-badge">
          <span className="goal-icon" />
          <p>
            {goalProgress} / {goalTarget} XP
          </p>
        </div>
        <p>{goalText}</p>
      </div>
    );
  };

  return <>{goals.map(goal => mapGoalToJSX(goal))}</>;
}

export default AchievementViewGoal;
