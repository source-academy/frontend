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
  focusUuid: string;
};

function AchievementView(props: AchievementViewProps) {
  const { focusUuid } = props;

  const inferencer = useContext(AchievementContext);

  // NOTE: was originally isNaN, not sure how this should change for uuid
  if (focusUuid === '') {
    return (
      <div className="no-view">
        <Icon icon={IconNames.MOUNTAIN} iconSize={60} />
        <h2>Select an achievement</h2>
      </div>
    );
  }

  const achievement = inferencer.getAchievement(focusUuid);
  const { ability, deadline, title, view } = achievement;
  const { coverImage, completionText, description } = view;
  const awardedXp = inferencer.getAchievementXp(focusUuid);
  const goals = inferencer.listGoals(focusUuid);
  const prereqGoals = inferencer.listPrerequisiteGoals(focusUuid);
  const status = inferencer.getStatus(focusUuid);

  return (
    <div className="view" style={{ ...getAbilityGlow(ability), ...getAbilityBackground(ability) }}>
      <div
        className="cover"
        style={{
          background: `url(${coverImage}) center/cover`
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
