import { AnchorButton, Button, Classes, Dialog, InputGroup, Intent } from '@blueprintjs/core';
import classNames from 'classnames';
import React, { useState } from 'react';

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
  const [commitMessage, setCommitMessage] = useState('');

  return (
    <Dialog className="missionBrowser" isOpen={true}>
      <div className={classNames('githubDialogHeader', Classes.DIALOG_HEADER)}>
        <h3>Please confirm your save</h3>
      </div>
      <div className={classNames('githubDialogBody', Classes.DIALOG_BODY)}>
        <div>
          <h4>You are about to make changes to the following files:</h4>
          {props.changedFiles.map(filepath => (
            <li key={filepath}>{filepath}</li>
          ))}
        </div>
        <div>
          <InputGroup
            onChange={handleCommitMessageChange}
            placeholder={'Enter Commit Message'}
            value={commitMessage}
          />
        </div>
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
      commitMessage: commitMessage
    });
  }

  function handleCommitMessageChange(event: any) {
    setCommitMessage(event.target.value);
  }
};
