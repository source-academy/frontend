import React from 'react';

import Inferencer from './utils/Inferencer';
import AchievementHints from './utils/AchievementHints';
import AchievementModalGoal from './modal/AchievementModalGoal';
import { AchievementStatus } from 'src/commons/achievements/AchievementTypes';
import AchievementModalCompletion from './modal/AchievementModalCompletion';

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
  const prettifyDeadline = (deadline: Date) => {
    const day = deadline.getDate();
    const year = deadline.getFullYear();

    switch (deadline.getMonth()) {
      case 0:
        return day + ' January ' + year;
      case 1:
        return day + ' February ' + year;
      case 2:
        return day + ' March ' + year;
      case 3:
        return day + ' April ' + year;
      case 4:
        return day + ' May ' + year;
      case 5:
        return day + ' June ' + year;
      case 6:
        return day + ' July ' + year;
      case 7:
        return day + ' August ' + year;
      case 8:
        return day + ' September ' + year;
      case 9:
        return day + ' October ' + year;
      case 10:
        return day + ' November ' + year;
      case 11:
        return day + ' December ' + year;
      default:
        return deadline.toLocaleDateString();
    }
  };

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
            <p>{`Deadline: ${prettifyDeadline(deadline)}`}</p>
            <div className="hints">
              <AchievementHints release={deadline} />
            </div>
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
