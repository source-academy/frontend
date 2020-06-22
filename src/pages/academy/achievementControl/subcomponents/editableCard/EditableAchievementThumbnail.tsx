import React, { useState } from 'react';
import { IconName, IconNames } from '@blueprintjs/icons';
import { Dialog, Icon } from '@blueprintjs/core';
import { AchievementIconSelect } from '../controlPanelTools/AchievementIconSelect';

type EditableAchievementThumbnailProps = {
  thumbnail: IconName | undefined;
  changeThumbnail: any;
};

function EditableAchievementThumbnail(props: EditableAchievementThumbnailProps) {
  const { thumbnail, changeThumbnail } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <div className="icon">
      <Icon icon={thumbnail === undefined ? IconNames.CONFIRM : thumbnail} onClick={() => setDialogOpen(!isDialogOpen)} />
      <Dialog
          onClose={() => setDialogOpen(!isDialogOpen)}
          isOpen={isDialogOpen}
          title="Change Your Icon"
      >
        <AchievementIconSelect iconName={thumbnail} onChange={changeThumbnail} />
      </Dialog>
    </div>
  );
}

export default EditableAchievementThumbnail;
