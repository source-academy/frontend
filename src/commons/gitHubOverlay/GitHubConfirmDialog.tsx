import { AnchorButton, Button, Classes, Dialog } from '@blueprintjs/core';

import { getGitHubSaveMode, getPickerType } from '../../features/github/GitHubUtils';

const GitHubConfirmDialog = (props: any) => {
  const {
    isOpen,
    handleGitHubCancelConfirmationDialog,
    handleGitHubConfirmOpen,
    handleGitHubConfirmCreatingSave,
    handleGitHubConfirmOverwritingSave
  } = props;

  const pickerType = getPickerType();
  const githubSaveMode = getGitHubSaveMode();

  const confirmHandler = () => {
    if (pickerType === 'Open') {
      handleGitHubConfirmOpen();
    }

    if (pickerType === 'Save') {
      if (githubSaveMode === 'Overwrite') {
        handleGitHubConfirmOverwritingSave();
      }

      if (githubSaveMode === 'Create') {
        handleGitHubConfirmCreatingSave();
      }
    }

    handleGitHubCancelConfirmationDialog();
  };

  const cancelHandler = () => {
    handleGitHubCancelConfirmationDialog();
  };

  return (
    <Dialog isOpen={isOpen} usePortal={false}>
      {pickerType === 'Open' && (
        <div className={Classes.DIALOG_BODY}>
          <p>Warning: opening this file will overwrite the text data in the editor.</p>
          <p>Please click 'Confirm' to continue, or 'Cancel' to go back.</p>
        </div>
      )}
      {pickerType === 'Save' && githubSaveMode === 'Overwrite' && (
        <div className={Classes.DIALOG_BODY}>
          <p>Warning: You are saving over an existing file in the repository.</p>
          <p>Please click 'Confirm' to continue, or 'Cancel' to go back.</p>
        </div>
      )}
      {pickerType === 'Save' && githubSaveMode === 'Create' && (
        <div className={Classes.DIALOG_BODY}>
          <p>Warning: You are creating a new file in the repository.</p>
          <p>Please click 'Confirm' to continue, or 'Cancel' to go back.</p>
        </div>
      )}
      <div className={Classes.DIALOG_FOOTER}>
        <Button onClick={cancelHandler}>Cancel</Button>
        <AnchorButton intent={'primary'} onClick={confirmHandler}>
          Confirm
        </AnchorButton>
      </div>
    </Dialog>
  );
};

export default GitHubConfirmDialog;
