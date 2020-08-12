import { Button, Dialog, EditableText } from '@blueprintjs/core';
import React, { useState } from 'react';
import { AchievementView } from 'src/features/achievement/AchievementTypes';

type EditableAchievementViewProps = {
  view: AchievementView;
  changeView: any;
};

function EditableAchievementView(props: EditableAchievementViewProps) {
  const { view, changeView } = props;

  const [isOpen, setOpen] = useState<boolean>(false);
  const toggleOpen = () => setOpen(!isOpen);

  const { canvasUrl, description, completionText } = view;

  const changeCanvasUrl = (canvasUrl: string) => changeView({ ...view, canvasUrl: canvasUrl });

  const changeDescription = (description: string) =>
    changeView({ ...view, description: description });

  const changeCompletionText = (completionText: string) =>
    changeView({ ...view, completionText: completionText });

  return (
    <div className="editable-view">
      <Button text="Edit View" onClick={toggleOpen} />

      <Dialog title="Edit View" isOpen={isOpen} onClose={toggleOpen}>
        <h3>View Image</h3>
        <EditableText
          placeholder="Enter image URL here"
          multiline={true}
          onChange={changeCanvasUrl}
          value={canvasUrl}
        />
        <h3>Description</h3>
        <EditableText
          placeholder="Enter description here"
          multiline={true}
          onChange={changeDescription}
          value={description}
        />
        <h3>Completion Text</h3>
        <EditableText
          placeholder="Enter completion text here"
          multiline={true}
          onChange={changeCompletionText}
          value={completionText}
        />
      </Dialog>
    </div>
  );
}

export default EditableAchievementView;
