import React from 'react';

import { Card } from '@blueprintjs/core';

type AchievementModalProps = {
  modalImageURL: string;
  resetModal: any;
};

function AchievementModal(props: AchievementModalProps) {
  const { resetModal, modalImageURL } = props;

  return (
    <div className="modal">
      <Card className="modal-container" onClick={resetModal}>
        <img src={modalImageURL} />
      </Card>
    </div>
  );
}

export default AchievementModal;
