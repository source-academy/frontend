import React from 'react';

import { AchievementGoal } from '../../../features/achievement/AchievementTypes';

type AchievementViewGoalProps = {
  goals: AchievementGoal[];
};

/**
 * Maps an array of goalId to Goal component
 *
 * @param goal an array of goalId
 */
const mapGoalToJSX = (goal: AchievementGoal) => {
  const { id, text, maxExp, exp } = goal;
  return (
    <div className="goal" key={id}>
      <div className="goal-badge">
        <span className="goal-icon" />
        <p>
          {exp} / {maxExp} XP
        </p>
      </div>
      <p>{text}</p>
    </div>
  );
};

function AchievementViewGoal(props: AchievementViewGoalProps) {
  const { goals } = props;

  return <>{goals.map(goal => mapGoalToJSX(goal))}</>;
}

export default AchievementViewGoal;
