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
  const { uuid, text, maxXp, xp } = goal;
  return (
    <div className="goal" key={uuid}>
      <div className="goal-badge">
        <span className="goal-icon" />
        <p>
          {xp} / {maxXp} XP
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
