import React, { useState } from 'react';
import { Button, Dialog, EditableText } from '@blueprintjs/core';

type EditableAchievementBackgroundProps = {
  backgroundImageUrl: string;
  setBackgroundImageUrl: any;
};

function EditableAchievementBackground(props: EditableAchievementBackgroundProps) {
  const { backgroundImageUrl, setBackgroundImageUrl } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <div>
      <div>
        <Button text={'Edit Background'} onClick={() => setDialogOpen(!isDialogOpen)} />
      </div>
      <Dialog
        onClose={() => setDialogOpen(!isDialogOpen)}
        isOpen={isDialogOpen}
        title={'Edit Background'}
        usePortal={false}
      >
        <EditableText
          placeholder={`Enter your image URL here`}
          value={backgroundImageUrl}
          onChange={setBackgroundImageUrl}
          multiline={true}
        />
      </Dialog>
    </div>
  );
}

export default EditableAchievementBackground;
