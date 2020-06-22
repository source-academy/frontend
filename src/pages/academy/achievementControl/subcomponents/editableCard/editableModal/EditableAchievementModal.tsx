import React, { useState } from 'react';
import { Button, Dialog, Card } from '@blueprintjs/core';
import { AchievementModalItem } from 'src/commons/achievements/AchievementTypes';
import { modalTemplate } from '../EditableTemplates';
import EditableAchievementModalDescription from './EditableAchievementModalDescription';
import EditableAchievementModalGoalText from './EditableAchievementModalGoalText';
import EditableAchievementModalImage from './EditableAchievementModalImage';

type EditableAchievementModalProps = {
  modal: AchievementModalItem;
};

function EditableAchievementModal(props: EditableAchievementModalProps) {
  const { modal } = props;

  const renderModal = modal === undefined ? modalTemplate : modal;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

  const [modalData, setModalData] = useState<AchievementModalItem>(renderModal);

  const { title, modalImageUrl, description, goalText } = modalData;

  const setDescription = (description: string) => {
    setModalData({
      ...modalData,
      description: description
    });
  };

  const setGoalText = (goalText: string) => {
    setModalData({
      ...modalData,
      goalText: goalText
    });
  };

  const setModalImageUrl = (modalImageUrl: string) => {
    setModalData({
      ...modalData,
      modalImageUrl: modalImageUrl
    });
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
          {/* TODO: make modal editable */}
          <Card className="background-card">
            <h1>{title} </h1>

            <EditableAchievementModalImage
              modalImageUrl={modalImageUrl}
              title={title}
              setModalImageUrl={setModalImageUrl}
            />

            <EditableAchievementModalDescription
              description={description}
              setDescription={setDescription}
            />
            <EditableAchievementModalGoalText goalText={goalText} setGoalText={setGoalText} />
          </Card>
        </div>
      </Dialog>
    </div>
  );
}

export default EditableAchievementModal;
