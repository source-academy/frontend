import React from 'react';
import { IconName } from '@blueprintjs/icons';
import { Icon } from '@blueprintjs/core';

type EditableAchievementThumbnailProps = {
  thumbnail: IconName;
  changeThumbnail: any;
};

function EditableAchievementThumbnail(props: EditableAchievementThumbnailProps) {
  const { thumbnail, changeThumbnail } = props;

  return (
    <div className="icon">
      <Icon icon={thumbnail} onClick={changeThumbnail} />
    </div>
  );
}

export default EditableAchievementThumbnail;
