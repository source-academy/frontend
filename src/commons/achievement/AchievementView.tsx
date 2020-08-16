import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useContext } from 'react';

import {
  AchievementContext,
  getAbilityBackground,
  getAbilityGlow
} from '../../features/achievement/AchievementConstants';
import { AchievementStatus } from '../../features/achievement/AchievementTypes';
import { prettifyDate } from './utils/DateHelper';
import AchievementViewCompletion from './view/AchievementViewCompletion';
import AchievementViewGoal from './view/AchievementViewGoal';

type AchievementViewProps = {
  focusId: number;
};

function AchievementView(props: AchievementViewProps) {
  const { focusId } = props;

  const inferencer = useContext(AchievementContext);

  if (isNaN(focusId)) {
    return (
      <div className="no-view">
        <Icon icon={IconNames.MOUNTAIN} iconSize={60} />
        <h2>Select an achievement</h2>
      </div>
    );
  }

  const achievement = inferencer.getAchievement(focusId);
  const { ability, deadline, title, view } = achievement;
  const { canvasUrl, completionText, description } = view;
  const awardedXp = inferencer.getAchievementXp(focusId);
  const goals = inferencer.listGoals(focusId);
  const prereqGoals = inferencer.listPrerequisiteGoals(focusId);
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
          <AchievementViewCompletion awardedXp={awardedXp} completionText={completionText} />
        </>
      )}
    </div>
  );
}

export default AchievementView;
