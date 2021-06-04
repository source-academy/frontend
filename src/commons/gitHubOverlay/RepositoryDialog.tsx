import {
  AnchorButton,
  Button,
  Classes,
  Dialog,
  Intent,
  Radio,
  RadioGroup
} from '@blueprintjs/core';
import classNames from 'classnames';
import React, { useState } from 'react';

import { showWarningMessage } from '../utils/NotificationsHelper';

export type RepositoryDialogProps = {
  userRepos: any[];
  onSubmit: (repoName: string) => void;
};

const RepositoryDialog: React.FC<RepositoryDialogProps> = props => {
  const [repoName, setRepoName] = useState('');

  return (
    <Dialog className="githubDialog" isOpen={true} onClose={handleClose}>
      <div className={classNames('githubDialogHeader', Classes.DIALOG_HEADER)}>
        <h3>Select a Repository</h3>
      </div>
      <div className={Classes.DIALOG_BODY}>
        <RadioGroup
          className="RepositoryRadioGroup"
          onChange={handleSelect}
          selectedValue={repoName}
        >
          {props.userRepos.map((repo: any) => (
            <Radio label={repo.name} key={repo.id} value={repo.name} />
          ))}
        </RadioGroup>
      </div>
      <div className={classNames(Classes.DIALOG_FOOTER)}>
        <div className={classNames(Classes.DIALOG_FOOTER_ACTIONS)}>
          <Button onClick={handleClose}>Close</Button>
          <AnchorButton onClick={handleSubmit} intent={Intent.PRIMARY}>
            Select
          </AnchorButton>
        </div>
      </div>
    </Dialog>
  );

  function handleSelect(e: any) {
    setRepoName(e.target.value);
  }

  function handleClose() {
    props.onSubmit('');
  }

  function handleSubmit() {
    if (repoName === '') {
      showWarningMessage('No repository selected!', 1000);
    } else {
      props.onSubmit(repoName);
    }
  }
};

export default RepositoryDialog;
