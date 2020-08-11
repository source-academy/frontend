import { Button, Dialog, EditableText } from '@blueprintjs/core';
import React, { useState } from 'react';

type EditableAchievementBackgroundProps = {
  cardBackground: string;
  changeCardBackground: any;
  title: string;
};

function EditableAchievementBackground(props: EditableAchievementBackgroundProps) {
  const { cardBackground, changeCardBackground, title } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const toggleDialog = () => setDialogOpen(!isDialogOpen);

  return (
    <div className="editable-background">
      <Button text={'Edit Background'} onClick={toggleDialog} />

      <Dialog title={`${title} Card Background`} isOpen={isDialogOpen} onClose={toggleDialog}>
        <EditableText
          placeholder={'Enter image URL here'}
          multiline={true}
          onChange={changeCardBackground}
          value={cardBackground}
        />
      </Dialog>
    </div>
  );
}

export default EditableAchievementBackground;
