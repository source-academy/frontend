import { Intent } from '@blueprintjs/core';
import React from 'react';

import { abilityBackground } from '../../../../features/achievement/AchievementConstants';
import { AchievementStatus } from '../../../../features/achievement/AchievementTypes';
import AchievementModalCompletion from './modal/AchievementModalCompletion';
import AchievementModalGoal from './modal/AchievementModalGoal';
import AchievementInferencer from './utils/AchievementInferencer';
import AchievementWeek from './utils/AchievementWeek';
import { prettifyDate } from './utils/DateHelper';

type AchievementModalProps = {
  id: number;
  inferencer: AchievementInferencer;
  handleGlow: any;
};

function AchievementModal(props: AchievementModalProps) {
  const { id, inferencer, handleGlow } = props;

  if (id < 0) return null;

  const achievement = inferencer.getAchievementItem(id);
  const { title, ability, deadline, goals, modal } = achievement;
  const { modalImageUrl, description, completionText } = modal;

  const status = inferencer.getStatus(id);
  const awardedExp = inferencer.getStudentExp(id);

  return (
    <div className="modal" style={{ ...handleGlow(id), ...abilityBackground(ability) }}>
      <div
        className="canvas"
        style={{
          backgroundImage: `url(${modalImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <h1>{title.toUpperCase()}</h1>
        {deadline !== undefined ? (
          <div className="deadline">
            <p>{`Deadline: ${prettifyDate(deadline)}`}</p>
            <AchievementWeek week={deadline} intent={Intent.DANGER} />
          </div>
        ) : null}
        <div className="description">
          <p>{description}</p>
        </div>
      </div>
      <AchievementModalGoal goals={goals} />
      <hr />
      {status === AchievementStatus.COMPLETED ? (
        <AchievementModalCompletion awardedExp={awardedExp} completionText={completionText} />
      ) : null}
    </div>
  );
}

export default AchievementModal;
