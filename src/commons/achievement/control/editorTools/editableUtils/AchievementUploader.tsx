import { Button } from '@blueprintjs/core';
import React from 'react';

type AchievementUploaderProps = {
  hasChanges: boolean;
  saveChanges: any;
  discardChanges: any;
};

function AchievementUploader(props: AchievementUploaderProps) {
  const { hasChanges, saveChanges, discardChanges } = props;

  return (
    <>
      {hasChanges && (
        <>
          <Button
            icon={'floppy-disk'}
            text={'Save'}
            intent={'primary'}
            outlined={true}
            onClick={saveChanges}
          />
          <Button
            icon={'cross'}
            text={'Discard'}
            intent={'danger'}
            outlined={true}
            onClick={discardChanges}
          />
        </>
      )}
    </>
  );
}

export default AchievementUploader;
