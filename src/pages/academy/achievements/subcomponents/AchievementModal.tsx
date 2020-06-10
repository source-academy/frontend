import React from 'react';

import { Card } from '@blueprintjs/core';
import { AchievementModalOverview } from '../../../../commons/achievements/AchievementTypes';

type AchievementModalProps = {
  title: string;
  modalOverviews: AchievementModalOverview[];
};

function AchievementModal(props: AchievementModalProps) {
  const { title, modalOverviews } = props;

  if (title === '') return null;

  const result = modalOverviews.filter(modal => modal.title === title);
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
