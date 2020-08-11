import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

type AchievementSaverProps = {
  discardChanges: any;
  saveChanges: any;
};

function AchievementSaver(props: AchievementSaverProps) {
  const { discardChanges, saveChanges } = props;

  return (
    <div className="saver">
      <Button icon={IconNames.FLOPPY_DISK} text={'Save'} intent={'primary'} onClick={saveChanges} />
      <Button icon={IconNames.CROSS} text={'Discard'} intent={'danger'} onClick={discardChanges} />
    </div>
  );
}

export default AchievementSaver;
