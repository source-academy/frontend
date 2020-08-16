import { Button, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import { showSuccessMessage, showWarningMessage } from 'src/commons/utils/NotificationsHelper';

type ItemSaverProps = {
  discardChanges: () => void;
  saveChanges: () => void;
};

function ItemSaver(props: ItemSaverProps) {
  const { discardChanges, saveChanges } = props;

  const handleSaveChanges = () => {
    saveChanges();
    showSuccessMessage('Saved changes locally');
  };

  const handleDiscardChanges = () => {
    discardChanges();
    showWarningMessage('Discarded changes');
  };

  return (
    <>
      <Tooltip content="Save Changes">
        <Button icon={IconNames.FLOPPY_DISK} intent="primary" onClick={handleSaveChanges} />
      </Tooltip>

      <Tooltip content="Discard Changes">
        <Button icon={IconNames.CROSS} intent="danger" onClick={handleDiscardChanges} />
      </Tooltip>
    </>
  );
}

export default ItemSaver;
