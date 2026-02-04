import {
  AnchorButton,
  Button,
  Classes,
  Dialog,
  DialogBody,
  DialogFooter,
  Intent,
  Radio,
  RadioGroup
} from '@blueprintjs/core';
import classNames from 'classnames';
import React, { useState } from 'react';

import { showWarningMessage } from '../utils/notifications/NotificationsHelper';

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
      <DialogBody>
        <RadioGroup
          className="RepositoryRadioGroup"
          onChange={handleSelect}
          selectedValue={repoName}
        >
          {props.userRepos.map((repo: any) => (
            <Radio label={repo.name} key={repo.id} value={repo.name} />
          ))}
        </RadioGroup>
      </DialogBody>
      <DialogFooter
        actions={
          <>
            <Button onClick={handleClose}>Close</Button>
            <AnchorButton onClick={handleSubmit} intent={Intent.PRIMARY}>
              Select
            </AnchorButton>
          </>
        }
      />
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
