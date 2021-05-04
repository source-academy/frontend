import {
  AnchorButton,
  Button,
  Classes,
  Dialog,
  Divider,
  FormGroup,
  InputGroup,
  Intent,
  Label,
  Menu,
  MenuItem
} from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import { Octokit } from '@octokit/rest';
import classNames from 'classnames';
import React, { useState } from 'react';

import {
  showDangerMessage,
  showSuccessMessage,
  showWarningMessage
} from '../utils/NotificationsHelper';

export type GitHubMissionCreateDialogResolution = {
  confirmCreate: boolean;
};

export type GitHubMissionCreateDialogProps = {
  octokit: Octokit;
  resolveDialog: (arg: GitHubMissionCreateDialogResolution) => void;
};

export const GitHubMissionCreateDialog: React.FC<GitHubMissionCreateDialogProps> = props => {
  const [repoName, setRepoName] = useState('');

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [imageLink, setImageLink] = useState('');
  const [version, setVersion] = useState('1');
  const [kind, setKind] = useState('mission');

  return (
    <Dialog className="missionBrowser" isOpen={true}>
      <div className={classNames('githubDialogHeader', Classes.DIALOG_HEADER)}>
        <h3>Creating Mission Repository</h3>
      </div>
      <div className={classNames('githubDialogBody', Classes.DIALOG_BODY)}>
        <FormGroup>
          <Label className="bp3-label .bp3-inline">Repository name: </Label>
          <InputGroup
            onChange={handleRepoNameChange}
            onClick={handleClickRepoNameBox}
            placeholder={'Enter repository name'}
            value={repoName}
          />

          <Divider />

          <Label className="bp3-label .bp3-inline">Title: </Label>
          <InputGroup
            onChange={handleTitleChange}
            placeholder={'Enter mission title'}
            value={title}
          />

          <Label className="bp3-label .bp3-inline">Web Summary: </Label>
          <InputGroup
            onChange={handleSummaryChange}
            placeholder={'Enter web summary'}
            value={summary}
          />

          <Label className="bp3-label .bp3-inline">Cover Image: </Label>
          <InputGroup
            onChange={handleImageLinkChange}
            placeholder={'Enter image link'}
            value={imageLink}
          />

          <Label className="bp3-label .bp3-inline">Source Version: </Label>
          <InputGroup
            onChange={handleVersionChange}
            placeholder={'Choose source version'}
            value={version}
          />

          <Label className="bp3-label .bp3-inline">Kind: </Label>
          <Popover2
            content={
              <Menu>
                <MenuItem text="mission" onClick={handleKindChange} />
              </Menu>
            }
            placement="bottom-end"
          >
            <Button rightIcon="caret-down" text={kind} />
          </Popover2>
        </FormGroup>
      </div>
      <div className={classNames(Classes.DIALOG_FOOTER)}>
        <div className={classNames(Classes.DIALOG_FOOTER_ACTIONS)}>
          <Button onClick={handleClose}>Close</Button>
          <AnchorButton onClick={handleConfirm} intent={Intent.PRIMARY}>
            Create
          </AnchorButton>
        </div>
      </div>
    </Dialog>
  );

  function handleClose() {
    props.resolveDialog({
      confirmCreate: false
    });
    showWarningMessage('Repository creation cancelled', 2000);
  }

  function handleConfirm() {
    try {
      CreateRepository();
      PopulateRepository();
      showSuccessMessage('Mission repository created!', 2000);
      props.resolveDialog({
        confirmCreate: true
      });
    } catch (err) {
      showDangerMessage('Failed to create mission repository!', 2000);
      props.resolveDialog({
        confirmCreate: false
      });
    }
  }

  async function CreateRepository() {
    await props.octokit.repos.createForAuthenticatedUser({ name: repoName });
  }

  function compileMetadata() {
    return Buffer.from(
      'title=' +
        title +
        '\n' +
        'webSummary=' +
        summary +
        '\n' +
        'coverImage=' +
        imageLink +
        '\n' +
        'sourceVersion=' +
        version +
        '\n' +
        'kind=' +
        kind
    ).toString('base64');
  }

  async function PopulateRepository() {
    const userName = (await props.octokit.users.getAuthenticated()).data.login;
    const metadata = compileMetadata();
    console.log(userName);
    console.log(metadata);
    await props.octokit.repos.createOrUpdateFileContents({
      owner: userName,
      repo: repoName,
      path: 'METADATA',
      message: 'Created from Source Academy',
      content: metadata
    });
  }

  function handleRepoNameChange(e: any) {
    setRepoName(e.target.value);
  }

  function handleClickRepoNameBox(e: any) {
    if (repoName === '') {
      setRepoName('SA-');
    }
  }

  function handleTitleChange(e: any) {
    setTitle(e.target.value);
  }
  function handleSummaryChange(e: any) {
    setSummary(e.target.value);
  }

  function handleImageLinkChange(e: any) {
    setImageLink(e.target.value);
  }

  function handleVersionChange(e: any) {
    setVersion(e.target.value);
  }

  function handleKindChange(e: any) {
    setKind(e.target.innerText);
  }
};
