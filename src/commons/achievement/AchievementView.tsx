import React from 'react';

import { getAbilityBackground } from '../../features/achievement/AchievementConstants';
import { AchievementStatus } from '../../features/achievement/AchievementTypes';
import { Role, UserSimpleState } from '../application/ApplicationTypes';
import AchievementInferencer from './utils/AchievementInferencer';
import { prettifyDate } from './utils/DateHelper';
import AchievementViewCompletion from './view/AchievementViewCompletion';
import AchievementViewGoal from './view/AchievementViewGoal';

type AchievementViewProps = {
  users: UserSimpleState[];
  id: number;
  role?: Role;
  inferencer: AchievementInferencer;
  handleGlow: any;

  updateGoalProgress: any;
};

function AchievementView(props: AchievementViewProps) {
  const { id, role, users, inferencer, handleGlow, updateGoalProgress } = props;

  if (id < 0) return null;

  const achievement = inferencer.getAchievementItem(id);
  const { title, ability, deadline, view } = achievement;
  const { canvasUrl, description, completionText } = view;

  const userToEdit = users.length === 0 ? null : users[0];

  const awardedExp = inferencer.getExp(id);
  const goals = inferencer.getGoals(id);
  const prereqGoals = inferencer.getPrerequisiteGoals(id);
  const status = inferencer.getStatus(id);

  return (
    <div className="view" style={{ ...handleGlow(id), ...getAbilityBackground(ability) }}>
      <div
        className="canvas"
        style={{
          background: `url(${canvasUrl}) center/cover`
        }}
      >
        <h1>{title.toUpperCase()}</h1>
        {deadline && <p>{`Deadline: ${prettifyDate(deadline)}`}</p>}
        <span className="description">
          <p>{description}</p>
        </span>
      </div>
      <AchievementViewGoal
        updateGoalProgress={updateGoalProgress}
        role={role}
        userToEdit={userToEdit}
        goals={goals}
      />
      {prereqGoals.length > 0 ? (
        <>
          <hr />
          <AchievementViewGoal
            updateGoalProgress={updateGoalProgress}
            role={role}
            userToEdit={userToEdit}
            goals={prereqGoals}
          />
        </>
      ) : null}
      {status === AchievementStatus.COMPLETED ? (
        <>
          <hr />
          <AchievementViewCompletion awardedExp={awardedExp} completionText={completionText} />
        </>
      ) : null}
    </div>
  );
}

export default AchievementView;
