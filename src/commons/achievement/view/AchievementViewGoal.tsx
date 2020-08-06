import React from 'react';

import { AchievementGoal, GoalType } from '../../../features/achievement/AchievementTypes';
import { Role, UserSimpleState } from '../../application/ApplicationTypes';
import AchievementViewGoalEditor from './AchievementViewGoalEditor';

type AchievementViewGoalProps = {
  userToEdit: UserSimpleState | null;
  role?: Role;
  goals: AchievementGoal[];

  updateGoalProgress: any;
};

function AchievementViewGoal(props: AchievementViewGoalProps) {
  const { userToEdit, role, goals, updateGoalProgress } = props;

  const mapGoalToJSX = (goal: AchievementGoal) => {
    const { id, text, maxExp, exp, type } = goal;
    return (
      <div className="goal" key={id}>
        <div className="goal-badge">
          <span className="goal-icon" />
          <p>
            {exp} / {maxExp} XP
          </p>
        </div>
        <p>{text}</p>
        {role !== Role.Student && type === GoalType.MANUAL && (
          <AchievementViewGoalEditor
            updateGoalProgress={updateGoalProgress}
            userToEdit={userToEdit}
            goal={goal}
          />
        )}
      </div>
    );
  };

  return <>{goals.map(goal => mapGoalToJSX(goal))}</>;
}

export default AchievementViewGoal;
