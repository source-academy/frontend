import { AnchorButton, Button, Classes, Dialog, Intent } from '@blueprintjs/core';
import classNames from 'classnames';

export type GitHubMissionSaveDialogResolution = {
  confirmSave: boolean;
  commitMessage: string;
};

export type GitHubMissionSaveDialogProps = {
  repoName: string;
  changedFiles: string[];
  resolveDialog: (arg: GitHubMissionSaveDialogResolution) => void;
};

export const GitHubMissionSaveDialog: React.FC<GitHubMissionSaveDialogProps> = props => {
  return (
    <Dialog className="missionBrowser" isOpen={true}>
      <div className={classNames('githubDialogHeader', Classes.DIALOG_HEADER)}>
        <h3>MAKE SAV TO CHNAGE???!??</h3>
      </div>

      <div className={classNames(Classes.DIALOG_FOOTER)}>
        <div className={classNames(Classes.DIALOG_FOOTER_ACTIONS)}>
          <Button onClick={handleClose}>Close</Button>
          <AnchorButton onClick={handleConfirm} intent={Intent.PRIMARY}>
            Confirm
          </AnchorButton>
        </div>
      </div>
    </Dialog>
  );

  function handleClose() {
    props.resolveDialog({
      confirmSave: false,
      commitMessage: ''
    });
  }

  function handleConfirm() {
    props.resolveDialog({
      confirmSave: true,
      commitMessage: ''
    });
  }
};
