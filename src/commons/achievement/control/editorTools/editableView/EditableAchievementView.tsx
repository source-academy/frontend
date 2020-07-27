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

  const setDescription = (newDescription: string) => {
    const newView = {
      description: newDescription,
      canvasUrl: view.canvasUrl,
      completionText: view.completionText
    };
    changeView(newView);
  };

  const setCompletionText = (newCompletionText: string) => {
    const newView = {
      description: view.description,
      canvasUrl: view.canvasUrl,
      completionText: newCompletionText
    };
    changeView(newView);
  };

  const setCanvasUrl = (newCanvasUrl: string) => {
    const newView = {
      description: view.description,
      canvasUrl: newCanvasUrl,
      completionText: view.completionText
    };
    changeView(newView);
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

            <EditableViewImage
              canvasUrl={view.canvasUrl}
              title={title}
              setCanvasUrl={setCanvasUrl}
            />
            <EditableViewDescription
              description={view.description}
              setDescription={setDescription}
            />
            <EditableViewText goalText={view.completionText} setGoalText={setCompletionText} />
          </Card>
        </div>
      </Dialog>
    </div>
  );
}

export default EditableAchievementView;
