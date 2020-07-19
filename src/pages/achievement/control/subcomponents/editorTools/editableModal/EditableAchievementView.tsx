import { Button, Card, Dialog } from '@blueprintjs/core';
import React, { useState } from 'react';

import { AchievementModalItem } from '../../../../../../features/achievement/AchievementTypes';
import EditableModalDescription from './EditableModalDescription';
import EditableModalImage from './EditableModalImage';
import EditableModalText from './EditableModalText';

type EditableAchievementModalProps = {
  title: string;
  modal: AchievementModalItem;
  changeModal: any;
};

function EditableAchievementView(props: EditableAchievementModalProps) {
  const { title, modal, changeModal } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

  const [modalData, setModalData] = useState<AchievementModalItem>(modal);

  const { modalImageUrl, description, completionText } = modalData;

  const setDescription = (description: string) => {
    setModalData({
      ...modalData,
      description: description
    });
    changeModal(modalData);
  };

  const setCompletionText = (completionText: string) => {
    setModalData({
      ...modalData,
      completionText: completionText
    });
    changeModal(modalData);
  };

  const setModalImageUrl = (modalImageUrl: string) => {
    setModalData({
      ...modalData,
      modalImageUrl: modalImageUrl
    });
    changeModal(modalData);
  };

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
          <Card className="background-card">
            <h1>{title} </h1>

            <EditableModalImage
              modalImageUrl={modalImageUrl}
              title={title}
              setModalImageUrl={setModalImageUrl}
            />

            <EditableModalDescription description={description} setDescription={setDescription} />
            <EditableModalText goalText={completionText} setGoalText={setCompletionText} />
          </Card>
        </div>
      </Dialog>
    </div>
  );
}

export default EditableAchievementView;
