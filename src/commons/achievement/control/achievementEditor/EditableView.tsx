import { Button, Dialog, EditableText, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useState } from 'react';
import { AchievementView } from 'src/features/achievement/AchievementTypes';

type Props = {
  changeView: (view: AchievementView) => void;
  view: AchievementView;
};

const EditableView: React.FC<Props> = ({ changeView, view }) => {
  const { coverImage, description, completionText } = view;

  const [isOpen, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!isOpen);

  const changeCoverImage = (coverImage: string) => changeView({ ...view, coverImage });

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
