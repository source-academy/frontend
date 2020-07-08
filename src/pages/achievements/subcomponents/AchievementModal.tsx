import React from 'react';

import Inferencer from './utils/Inferencer';
import { Card } from '@blueprintjs/core';
import AchievementModalDescription from './modal/AchievementModalDescription';
import AchievementModalGoal from './modal/AchievementModalGoal';
import AchievementModalCompletion from './modal/AchievementModalCompletion';

type AchievementModalProps = {
  generateBackgroundGradient: any;
  id: number;
  inferencer: Inferencer;
};

function AchievementModal(props: AchievementModalProps) {
  const { generateBackgroundGradient, id, inferencer } = props;

  if (id < 0) return null;

  const achievement = inferencer.getAchievementItem(id);
  const { ability, title, deadline, goals, modal } = achievement;
  const { description, completionText, modalImageUrl } = modal;

  console.log(generateBackgroundGradient(ability));

  return (
    <div
      className="modal"
      style={{
        background: `${generateBackgroundGradient(ability)}`,
        backgroundSize: '80% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}
    >
      <Card
        className="modal-container"
        style={{
          background: `url(${modalImageUrl})`,
          backgroundSize: '100% 20em',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="modal-header">
          <div className="modal-padder"></div>

          <div className="modal-title">
            <h3>{title}</h3>
          </div>

          <div className="modal-deadline">
            <p>{`Deadline: ${deadline?.toLocaleDateString()} ${deadline?.toLocaleTimeString()}`}</p>
          </div>

          <AchievementModalDescription description={description} />
        </div>

        <AchievementModalGoal goals={goals} />

        <hr />

        <AchievementModalCompletion completionText={completionText} />
      </Card>
    </div>
  );
}

export default AchievementModal;
