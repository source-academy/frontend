import React from 'react';

import { Card } from '@blueprintjs/core';
import { AchievementModalItem } from '../../../../commons/achievements/AchievementTypes';

type AchievementModalProps = {
  title: string;
  achievementModalList: AchievementModalItem[];
};

function AchievementModal(props: AchievementModalProps) {
  const { title, achievementModalList } = props;

  if (title === '') return null;

  const result = achievementModalList.filter(modal => modal.title === title);
  if (result.length === 0) return null;
  const { modalImageUrl, description } = result[0];

  return (
    <div className="modal">
      <Card className="modal-container">
        <h1>{title}</h1>
        <img src={modalImageUrl} alt={title} />
        <p>{description}</p>
      </Card>
    </div>
  );
}

export default AchievementModal;
