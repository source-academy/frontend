import React from 'react';

import Inferencer from './utils/Inferencer';
import AchievementWeek from './utils/AchievementWeek';
import AchievementModalGoal from './modal/AchievementModalGoal';
import { AchievementStatus } from 'src/commons/achievements/AchievementTypes';
import AchievementModalCompletion from './modal/AchievementModalCompletion';
import { prettifyDate } from './utils/DateHelper';

type AchievementModalProps = {
  id: number;
  inferencer: Inferencer;
};

function AchievementModal(props: AchievementModalProps) {
  const { id, inferencer } = props;

  if (id < 0) return null;

  const achievement = inferencer.getAchievementItem(id);
  const { title, goals, modal } = achievement;
  const { modalImageUrl, description, completionText } = modal;

  const status = inferencer.getStatus(id);
  const awardedExp = inferencer.getStudentExp(id);
  const deadline = inferencer.getFurthestDeadline(id);

  return (
    <div className="modal">
      <div
        className="canvas"
        style={{
          background: `url(${modalImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <h1>{title.toUpperCase()}</h1>
        {deadline !== undefined ? (
          <div className="deadline">
            <p>{`Deadline: ${prettifyDate(deadline)}`}</p>
            <AchievementWeek week={deadline} />
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
