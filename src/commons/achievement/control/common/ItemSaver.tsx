import { Button, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';

type ItemSaverProps = {
  discardChanges: any;
  saveChanges: any;
};

function ItemSaver(props: ItemSaverProps) {
  const { discardChanges, saveChanges } = props;

  return (
    <>
      <Tooltip content="Save Changes">
        <Button icon={IconNames.FLOPPY_DISK} intent="primary" onClick={saveChanges} />
      </Tooltip>

      <Tooltip content="Discard Changes">
        <Button icon={IconNames.CROSS} intent="danger" onClick={discardChanges} />
      </Tooltip>
    </>
  );
}

export default ItemSaver;
