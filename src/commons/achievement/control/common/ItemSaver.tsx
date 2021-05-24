import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
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
      <Tooltip2 content="Save Changes">
        <Button icon={IconNames.FLOPPY_DISK} intent="primary" onClick={handleSaveChanges} />
      </Tooltip2>

      <Tooltip2 content="Discard Changes">
        <Button icon={IconNames.CROSS} intent="danger" onClick={handleDiscardChanges} />
      </Tooltip2>
    </>
  );
}

export default ItemSaver;
