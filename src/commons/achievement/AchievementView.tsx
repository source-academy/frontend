import React from 'react';

import { getAbilityBackground } from '../../features/achievement/AchievementConstants';
import { AchievementStatus } from '../../features/achievement/AchievementTypes';
import AchievementInferencer from './utils/AchievementInferencer';
import { prettifyDate } from './utils/DateHelper';
import AchievementViewCompletion from './view/AchievementViewCompletion';
import AchievementViewGoal from './view/AchievementViewGoal';

type AchievementViewProps = {
  id: number;
  inferencer: AchievementInferencer;
  handleGlow: any;
};

function AchievementView(props: AchievementViewProps) {
  const { id, inferencer, handleGlow } = props;

  if (id < 0) return <div className="view"></div>;

  const achievement = inferencer.getAchievementItem(id);
  const { title, ability, deadline, goals, view } = achievement;
  const { canvasUrl, description, completionText } = view;

  const status = inferencer.getStatus(id);
  const awardedExp = inferencer.getStudentExp(id);

  return (
    <div className="view" style={{ ...handleGlow(id), ...getAbilityBackground(ability) }}>
      <div
        className="canvas"
        style={{
          background: `url(${canvasUrl}) center/cover`
        }}
      >
        <h1>{title.toUpperCase()}</h1>
        {deadline && (
          <div className="deadline">
            <p>{`Deadline: ${prettifyDate(deadline)}`}</p>
          </div>
        )}
        <div className="description">
          <p>{description}</p>
        </div>
      </div>
      <AchievementViewGoal goals={goals} />
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
