import { Button, Card, Dialog } from '@blueprintjs/core';
import React, { useState } from 'react';

import { AchievementModalItem } from '../../../../../../features/achievement/AchievementTypes';
import EditableViewescription from './EditableViewDescription';
import EditableViewImage from './EditableViewImage';
import EditableViewText from './EditableViewText';

type EditableAchievementViewProps = {
  title: string;
  modal: AchievementModalItem;
  changeView: any;
};

function EditableAchievementView(props: EditableAchievementViewProps) {
  const { title, modal, changeView } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

  const [modalData, setModalData] = useState<AchievementModalItem>(modal);

  const { canvasUrl, description, completionText } = modalData;

  const setDescription = (description: string) => {
    setModalData({
      ...modalData,
      description: description
    });
    changeView(modalData);
  };

  const setCompletionText = (completionText: string) => {
    setModalData({
      ...modalData,
      completionText: completionText
    });
    changeView(modalData);
  };

  const setcanvasUrl = (canvasUrl: string) => {
    setModalData({
      ...modalData,
      canvasUrl: canvasUrl
    });
    changeView(modalData);
  };

  return (
    <div>
      <div>
        <Button text={'Edit View'} onClick={() => setDialogOpen(!isDialogOpen)} />
      </div>
      <Dialog
        onClose={() => setDialogOpen(!isDialogOpen)}
        isOpen={isDialogOpen}
        title={'Edit View'}
        usePortal={false}
      >
        <div className="modal-editor">
          <Card className="background-card">
            <h1>{title} </h1>

            <EditableViewImage canvasUrl={canvasUrl} title={title} setcanvasUrl={setcanvasUrl} />

            <EditableViewescription description={description} setDescription={setDescription} />
            <EditableViewText goalText={completionText} setGoalText={setCompletionText} />
          </Card>
        </div>
      </Dialog>
    </div>
  );
}

export default EditableAchievementView;
