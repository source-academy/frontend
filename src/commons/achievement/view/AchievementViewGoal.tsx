import { ProgressBar } from '@blueprintjs/core';

import { AchievementGoal } from '../../../features/achievement/AchievementTypes';

type AchievementViewGoalProps = {
  goals: AchievementGoal[];
};

/**
 * Maps an array of goalUuid to Goal component
 *
 * @param goal an array of goalUuid
 */
const mapGoalToJSX = (goal: AchievementGoal) => {
  const { uuid, text, targetCount, count, completed } = goal;
  const frac = Math.min(targetCount === 0 ? 0 : count / targetCount, 1);
  return (
    <div className="goal" key={uuid}>
      <div className="goal-badge">
        <span className="goal-icon" />
        <p>
          {count} / {targetCount}
        </p>
      </div>
      <div className="goal-progress">
        <p>{text}</p>
        <ProgressBar
          animate={false}
          className="progress"
          intent={completed ? 'success' : undefined}
          stripes={false}
          value={frac}
        />
      </div>
    </div>
  );
};

function AchievementViewGoal(props: AchievementViewGoalProps) {
  const { goals } = props;

  return (
    <>
      <h1 className="progress-header">Progress</h1>
      {goals.map(goal => mapGoalToJSX(goal))}
    </>
  );
}

export default AchievementViewGoal;
