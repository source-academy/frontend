import React from 'react';
import { Button } from '@blueprintjs/core';
import { AchievementItem } from 'src/commons/achievements/AchievementTypes';

type EditableAchievementActionProps = {
  achievement: AchievementItem;
  hasChanges: boolean;
  saveChanges: any;
  discardChanges: any;
  pendingUpload: boolean;
  uploadChanges: any;
};

function EditableAchievementAction(props: EditableAchievementActionProps) {
  const {
    achievement,
    hasChanges,
    saveChanges,
    discardChanges,
    pendingUpload,
    uploadChanges
  } = props;

  return (
    <>
      {hasChanges ? (
        <>
          <Button
            icon={'floppy-disk'}
            text={'Save'}
            intent={'primary'}
            outlined={true}
            onClick={() => saveChanges(achievement)}
          />
          <Button
            icon={'cross'}
            text={'Discard'}
            intent={'danger'}
            outlined={true}
            onClick={discardChanges}
          />
        </>
      ) : pendingUpload ? (
        <Button
          icon={'export'}
          text={'Submit'}
          intent={'primary'}
          onClick={() => uploadChanges(achievement)}
        />
      ) : null}
    </>
  );
}

export default EditableAchievementAction;
