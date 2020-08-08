import React from 'react';

import {
  getAbilityBackground,
  getAbilityGlow
} from '../../features/achievement/AchievementConstants';
import { AchievementStatus } from '../../features/achievement/AchievementTypes';
import AchievementInferencer from './utils/AchievementInferencer';
import { prettifyDate } from './utils/DateHelper';
import AchievementViewCompletion from './view/AchievementViewCompletion';
import AchievementViewGoal from './view/AchievementViewGoal';

type AchievementViewProps = {
  inferencer: AchievementInferencer;
  focusId: number;
};

function AchievementView(props: AchievementViewProps) {
  const { inferencer, focusId } = props;

  if (focusId < 0) return null;

  const achievement = inferencer.getAchievementItem(focusId);
  const { ability, deadline, title, view } = achievement;
  const { canvasUrl, completionText, description } = view;

  const awardedExp = inferencer.getExp(focusId);
  const goals = inferencer.getGoals(focusId);
  const prereqGoals = inferencer.getPrerequisiteGoals(focusId);
  const status = inferencer.getStatus(focusId);

  return (
    <div className="view" style={{ ...getAbilityGlow(ability), ...getAbilityBackground(ability) }}>
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
      <AchievementViewGoal goals={goals} />
      {prereqGoals.length > 0 && (
        <>
          <hr />
          <AchievementViewGoal goals={prereqGoals} />
        </>
      )}
      {status === AchievementStatus.COMPLETED && (
        <>
          <hr />
          <AchievementViewCompletion awardedExp={awardedExp} completionText={completionText} />
        </>
      )}
    </div>
  );
}

export default AchievementView;
