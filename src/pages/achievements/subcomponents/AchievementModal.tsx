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

  const modal = inferencer.getModalItem(id);

  if (modal === undefined) return null;

  const { title, ability, deadline } = inferencer.getAchievementItem(id);
  const { modalImageUrl, description, goalText, completionText } = modal;

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

        <AchievementModalGoal goalText={goalText} />

        <hr />
        <AchievementModalCompletion completionText={completionText} />
      </Card>
    </div>
  );
}

export default AchievementModal;
