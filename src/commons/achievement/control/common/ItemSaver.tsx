import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

type ItemSaverProps = {
  discardChanges: any;
  saveChanges: any;
};

function ItemSaver(props: ItemSaverProps) {
  const { discardChanges, saveChanges } = props;

  return (
    <div className="saver">
      <Button icon={IconNames.FLOPPY_DISK} text={'Save'} intent={'primary'} onClick={saveChanges} />
      <Button icon={IconNames.CROSS} text={'Discard'} intent={'danger'} onClick={discardChanges} />
    </div>
  );
}

export default ItemSaver;
