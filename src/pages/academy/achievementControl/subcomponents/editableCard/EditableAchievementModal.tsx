import React, { useState } from 'react';
import { Button, Dialog, Card } from '@blueprintjs/core';
import { AchievementModalItem } from 'src/commons/achievements/AchievementTypes';

type EditableAchievementModalProps = {
  modal: AchievementModalItem;
};

function EditableAchievementModal(props: EditableAchievementModalProps) {
  const { modal } = props;

  const { title, modalImageUrl, description, goalText } = modal;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <>
      <div>
        <Button text={'Edit Modal'} onClick={() => setDialogOpen(!isDialogOpen)} />
      </div>
      <Dialog
        onClose={() => setDialogOpen(!isDialogOpen)}
        isOpen={isDialogOpen}
        title={'Edit Modal'}
      >
        <div
          style={{ width: '100%', display: 'flex', justifyContent: 'center', textAlign: 'center' }} // TODO: move to css
        >
          {/* TODO: make editable */}
          <Card style={{ backgroundColor: '#333e50' }}>
            <h1>{title} </h1>

            <div>
              <img style={{ maxWidth: '100%' }} src={modalImageUrl} alt={title} />
            </div>

            <h3> {description} </h3>
            <p> {goalText} </p>
          </Card>
        </div>
      </Dialog>
    </>
  );
}

export default EditableAchievementModal;
