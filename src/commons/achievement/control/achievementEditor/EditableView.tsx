import { Button, Dialog, EditableText, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useState } from 'react';
import { AchievementView } from 'src/features/achievement/AchievementTypes';
type EditableViewProps = {
  view: AchievementView;
  changeView: any;
};

function EditableView(props: EditableViewProps) {
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
    <>
      <Tooltip content="Edit View">
        <Button icon={IconNames.WIDGET_HEADER} onClick={toggleOpen} />
      </Tooltip>

      <Dialog title="Edit View" icon={IconNames.WIDGET_HEADER} isOpen={isOpen} onClose={toggleOpen}>
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
    </>
  );
}

export default EditableView;
