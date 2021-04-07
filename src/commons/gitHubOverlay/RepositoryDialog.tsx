import {
  AnchorButton,
  Button,
  Classes,
  Dialog,
  Intent,
  Radio,
  RadioGroup
} from '@blueprintjs/core';
import React, { useState } from 'react';

import { showWarningMessage } from '../utils/NotificationsHelper';

const RepositoryDialog: React.FC<any> = props => {
  const [repoName, setRepoName] = useState('');

  return (
    <Dialog
      className="RepositoryDialog"
      isCloseButtonShown={true}
      isOpen={true}
      onClose={handleClose}
      title={'Select a Repository'}
      usePortal={false}
    >
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
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
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
