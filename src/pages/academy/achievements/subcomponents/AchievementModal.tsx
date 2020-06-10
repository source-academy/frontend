import React from 'react';

import { Card } from '@blueprintjs/core';

type AchievementModalProps = {
  title: string;
  modalOverview: any[];
};

function AchievementModal(props: AchievementModalProps) {
  const { title, modalOverview } = props;

  if (title === '') return null;

  const result = modalOverview.filter(modal => modal.title === title);
  const { modalImageUrl, description } = result[0];

  return (
    <div className="modal">
      <Card className="modal-container">
        <h1>{title}</h1>
        <img src={modalImageUrl} alt={title}/>
        <p>{description}</p>
      </Card>
    </div>
  );
}

export default AchievementModal;
