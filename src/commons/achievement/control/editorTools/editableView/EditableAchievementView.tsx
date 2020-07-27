import { Button, Card, Dialog } from '@blueprintjs/core';
import React, { useState } from 'react';

import { AchievementViewItem } from '../../../../../features/achievement/AchievementTypes';
import EditableViewDescription from './EditableViewDescription';
import EditableViewImage from './EditableViewImage';
import EditableViewText from './EditableViewText';

type EditableAchievementViewProps = {
  title: string;
  view: AchievementViewItem;
  changeView: any;
};

function EditableAchievementView(props: EditableAchievementViewProps) {
  const { title, view, changeView } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

  const [viewData, setViewData] = useState<AchievementViewItem>(view);

  const { canvasUrl, description, completionText } = viewData;

  const setDescription = (newDescription: string) => {
    setViewData({
      ...viewData,
      description: newDescription
    });
    changeView(viewData);
  };

  const setCompletionText = (newCompletionText: string) => {
    setViewData({
      ...viewData,
      completionText: newCompletionText
    });
    changeView(viewData);
  };

  const setCanvasUrl = (newCanvasUrl: string) => {
    setViewData({
      ...viewData,
      canvasUrl: newCanvasUrl
    });
    changeView(viewData);
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
        <div className="view-editor">
          <Card className="background-card">
            <h1>{title} </h1>

            <EditableViewImage canvasUrl={canvasUrl} title={title} setCanvasUrl={setCanvasUrl} />
            <EditableViewDescription description={description} setDescription={setDescription} />
            <EditableViewText goalText={completionText} setGoalText={setCompletionText} />
          </Card>
        </div>
      </Dialog>
    </div>
  );
}

export default EditableAchievementView;
