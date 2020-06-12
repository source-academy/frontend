import React from 'react';

import { Card } from '@blueprintjs/core';
import { AchievementModalItem } from '../../../../commons/achievements/AchievementTypes';

type AchievementModalProps = {
  modalID: number;
  achievementModalDict: { [id: number]: AchievementModalItem };
};

function AchievementModal(props: AchievementModalProps) {
  const { modalID, achievementModalDict } = props;

  const modal = achievementModalDict[modalID];
  if (modal === undefined) return null;
  const { title, modalImageUrl, description, exp, goal, completionText } = modal;

  return (
    <div className="modal">
      <Card className="modal-container">
        <h1>{title}</h1>
        <img src={modalImageUrl} alt={title} />
        <p>{description}</p>
        <p>{exp}</p>
        <p>{goal}</p>
        <p>{completionText}</p>
      </Card>
    </div>
  );
}

export default AchievementModal;
