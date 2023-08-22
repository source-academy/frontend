import { Button, Dialog, EditableText } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import React, { useState } from 'react';
import { AchievementView } from 'src/features/achievement/AchievementTypes';
type EditableViewProps = {
  changeView: (view: AchievementView) => void;
  view: AchievementView;
};

const EditableView: React.FC<EditableViewProps> = ({ changeView, view }) => {
  const { coverImage, description, completionText } = view;

  const [isOpen, setOpen] = useState<boolean>(false);
  const toggleOpen = () => setOpen(!isOpen);

  const changeCoverImage = (coverImage: string) => changeView({ ...view, coverImage });

  const changeDescription = (description: string) =>
    changeView({ ...view, description: description });

  const changeCompletionText = (completionText: string) =>
    changeView({ ...view, completionText: completionText });

  return (
    <>
      <Tooltip2 content="Edit View">
        <Button icon={IconNames.WIDGET_HEADER} onClick={toggleOpen} />
      </Tooltip2>

      <Dialog title="Edit View" icon={IconNames.WIDGET_HEADER} isOpen={isOpen} onClose={toggleOpen}>
        <div style={{ padding: '0 0.5em' }}>
          <h3>Cover Image</h3>
          <EditableText
            multiline={true}
            onChange={changeCoverImage}
            placeholder="Enter cover image URL here"
            value={coverImage}
          />
          <h3>Description</h3>
          <EditableText
            multiline={true}
            onChange={changeDescription}
            placeholder="Enter description here"
            value={description}
          />
          <h3>Completion Text</h3>
          <EditableText
            multiline={true}
            onChange={changeCompletionText}
            placeholder="Enter completion text here"
            value={completionText}
          />
        </div>
      </Dialog>
    </>
  );
};

export default EditableView;
