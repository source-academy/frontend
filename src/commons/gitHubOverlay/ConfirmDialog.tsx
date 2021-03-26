import { AnchorButton, Button, Classes, Dialog } from '@blueprintjs/core';

export const ConfirmOpen = (props: any) => {
  const { isOpen, pickerType, overwrite } = props;

  function handleCancel() {
    overwrite(false);
  }

  function handleConfirm() {
    overwrite(true);
  }

  return (
    <Dialog isOpen={isOpen} usePortal={false}>
      {pickerType === 'Open' && (
        <div className={Classes.DIALOG_BODY}>
          <p>Warning: opening this file will overwrite the text data in the editor.</p>
          <p>Please click 'Confirm' to continue, or 'Cancel' to go back.</p>
        </div>
      )}
      {pickerType === 'Save' && (
        <div className={Classes.DIALOG_BODY}>
          <p>Warning: You are saving over an existing file in the repository.</p>
          <p>Please click 'Confirm' to continue, or 'Cancel' to go back.</p>
        </div>
      )}
      <div className={Classes.DIALOG_FOOTER}>
        <Button onClick={handleCancel}>Cancel</Button>
        <AnchorButton intent={'primary'} onClick={handleConfirm}>
          Confirm
        </AnchorButton>
      </div>
    </Dialog>
  );
};
