import React, { useState } from 'react';
import { Button, Dialog, Card } from '@blueprintjs/core';
import { AchievementModalItem } from 'src/commons/achievements/AchievementTypes';
import { modalTemplate } from './EditableTemplates';

type EditableAchievementModalProps = {
  modal: AchievementModalItem;
};

function EditableAchievementModal(props: EditableAchievementModalProps) {
  const { modal } = props;

  const renderModal = modal === undefined ? modalTemplate : modal;

  const { title, modalImageUrl, description, goalText } = renderModal;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <div>
      <div>
        <Button text={'Edit Modal'} onClick={() => setDialogOpen(!isDialogOpen)} />
      </div>
      <Dialog
        onClose={() => setDialogOpen(!isDialogOpen)}
        isOpen={isDialogOpen}
        title={'Edit Modal'}
        usePortal={false}
      >
        <div className="modal-editor">
          {/* TODO: make modal editable */}
          <Card className="background-card">
            <h1>{title} </h1>

            <div>
              <img className="modal-img" src={modalImageUrl} alt={title} />
            </div>

            <h3> {description} </h3>
            <p> {goalText} </p>
          </Card>
        </div>
      </Dialog>
    </div>
  );
}

export default EditableAchievementModal;
