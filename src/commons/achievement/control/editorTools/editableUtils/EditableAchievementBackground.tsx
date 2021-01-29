import { Button, Dialog, EditableText } from '@blueprintjs/core';
import { useState } from 'react';

type EditableAchievementBackgroundProps = {
  cardTileUrl: string;
  setcardTileUrl: any;
};

function EditableAchievementBackground(props: EditableAchievementBackgroundProps) {
  const { cardTileUrl, setcardTileUrl } = props;

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
          value={cardTileUrl}
          onChange={setcardTileUrl}
          multiline={true}
        />
      </Dialog>
    </div>
  );
}

export default EditableAchievementBackground;
