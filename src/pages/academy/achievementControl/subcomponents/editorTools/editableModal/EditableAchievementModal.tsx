import React, { useState } from 'react';
import { Button, Dialog, Card } from '@blueprintjs/core';
import { AchievementModalItem } from '../../../../../../commons/achievements/AchievementTypes';
import EditableModalDescription from './EditableModalDescription';
import EditableModalGoalText from './EditableModalGoalText';
import EditableModalImage from './EditableModalImage';
import { modalTemplate } from '../AchievementTemplate';

type EditableAchievementModalProps = {
  title: string;
  modal: AchievementModalItem;
  changeModal: any;
};

function EditableAchievementModal(props: EditableAchievementModalProps) {
  const { title, modal, changeModal } = props;

  const renderModal = modal === undefined ? modalTemplate : modal;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

  const [modalData, setModalData] = useState<AchievementModalItem>(renderModal);

  const { modalImageUrl, description, goalText } = modalData;

  const setDescription = (description: string) => {
    setModalData({
      ...modalData,
      description: description
    });
    changeModal(modalData);
  };

  const setGoalText = (goalText: string) => {
    setModalData({
      ...modalData,
      goalText: goalText
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
            <EditableModalGoalText goalText={goalText} setGoalText={setGoalText} />
          </Card>
        </div>
      </Dialog>
    </div>
  );
}

export default EditableAchievementModal;
