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
  const { title, ability, deadline, goals, modal } = achievement;
  const { modalImageUrl, description, completionText } = modal;

  return (
    <div className="modal">
      <Card
        className="modal-container"
        style={{
          background: `${generateBackgroundGradient(ability)}`
        }}
      >
        <div className="sample">
          <img src={modalImageUrl} alt={title} />
          <div className="modal-title">
            {' '}
            <h3>{title}</h3>
          </div>
          <div className="modal-deadline">
            <p>{`Deadline: ${deadline?.toLocaleDateString()} ${deadline?.toLocaleTimeString()}`}</p>
          </div>
          <AchievementModalDescription description={description} />
        </div>

        <ul>
          <AchievementModalGoal goals={goals} />
        </ul>

        <hr />
        <AchievementModalCompletion completionText={completionText} />
      </Card>
    </div>
  );
}

export default AchievementModal;
