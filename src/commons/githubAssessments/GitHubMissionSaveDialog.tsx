import { AnchorButton, Button, Classes, Dialog, InputGroup, Intent } from '@blueprintjs/core';
import classNames from 'classnames';
import React, { useState } from 'react';
import classes from 'src/styles/GithubAssessments.module.scss';

export type GitHubMissionSaveDialogResolution = {
  confirmSave: boolean;
  commitMessage: string;
};

export type GitHubMissionSaveDialogProps = {
  repoName: string;
  filesToChangeOrCreate: string[];
  filesToDelete: string[];
  resolveDialog: (arg: GitHubMissionSaveDialogResolution) => void;
};

/**
 * A dialog that prompts the user to confirm their save. Displays the files that will change, as well as the prompt for the user to enter a commit message.
 *
 * @param props Component properties
 */
export const GitHubMissionSaveDialog: React.FC<GitHubMissionSaveDialogProps> = props => {
  const [commitMessage, setCommitMessage] = useState('');

  return (
    <Dialog className={classes['missionBrowser']} isOpen={true}>
      <div className={classNames('githubDialogHeader', Classes.DIALOG_HEADER)}>
        <h3>Please confirm your save</h3>
      </div>
      <div className={classNames('githubDialogBody', Classes.DIALOG_BODY)}>
        <div>
          {props.filesToChangeOrCreate.length > 0 && (
            <h4>You are about to create or edit the following files:</h4>
          )}
          {props.filesToChangeOrCreate.map(filepath => (
            <li key={filepath}>{filepath}</li>
          ))}

          {props.filesToDelete.length > 0 && <h4>You are about to delete the following files:</h4>}
          {props.filesToDelete.map(filepath => (
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
