import React from 'react';

import { AchievementGoal } from '../../../../../features/achievement/AchievementTypes';

type AchievementViewGoalProps = {
  goals: AchievementGoal[];
};

function AchievementViewGoal(props: AchievementViewGoalProps) {
  const { goals } = props;

  const mapGoalToJSX = (goal: AchievementGoal) => {
    const { goalId, goalText, goalProgress, goalTarget } = goal;
    return (
      <div className="goal" key={goalId}>
        <div className="goal-medal">
          <span className="medal-icon" />
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

export default AchievementViewGoal;
