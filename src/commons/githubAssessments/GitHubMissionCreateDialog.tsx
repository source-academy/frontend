import { AnchorButton, Button, Classes, Dialog, InputGroup, Intent } from '@blueprintjs/core';
import classNames from 'classnames';
import React, { useState } from 'react';
import classes from 'src/styles/GithubAssessments.module.scss';

import { showWarningMessage } from '../utils/notifications/NotificationsHelper';

export type GitHubMissionCreateDialogResolution = {
  confirmSave: boolean;
  repoName: string;
};

export type GitHubMissionCreateDialogProps = {
  filesToCreate: string[];
  userLogin: string;
  resolveDialog: (arg: GitHubMissionCreateDialogResolution) => void;
};

export const GitHubMissionCreateDialog: React.FC<GitHubMissionCreateDialogProps> = props => {
  const [repositoryName, setrepositoryName] = useState('sa-new-mission-repository');

  return (
    <Dialog className={classes['missionBrowser']} isOpen={true}>
      <div className={classNames('githubDialogHeader', Classes.DIALOG_HEADER)}>
        <h3>Please confirm your save</h3>
      </div>
      <div className={classNames('githubDialogBody', Classes.DIALOG_BODY)}>
        <div>
          <h4>This will create a repository owned by {props.userLogin} with the title:</h4>
          <InputGroup
            onChange={handleTitleChange}
            placeholder={'Enter Repository Title'}
            value={repositoryName}
          />
        </div>
        <div>
          <h4>This repository will be created with following files:</h4>
          {props.filesToCreate.map(filepath => (
            <li key={filepath}>{filepath}</li>
          ))}
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

  function handleTitleChange(event: any) {
    setrepositoryName(event.target.value);
  }

  function handleClose() {
    props.resolveDialog({
      confirmSave: false,
      repoName: ''
    });
  }

  function handleConfirm() {
    if (repositoryName === '') {
      showWarningMessage('Cannot create repository without title!', 2000);
      return;
    }

    props.resolveDialog({
      confirmSave: true,
      repoName: repositoryName
    });
  }
};
