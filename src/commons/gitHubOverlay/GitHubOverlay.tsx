import { Classes, DialogStep, MultistepDialog, Radio, RadioGroup } from '@blueprintjs/core';
import classNames from 'classnames';
import * as React from 'react';

import { store } from '../../pages/createStore';
import { actions } from '../utils/ActionsHelper';

export interface GitHubOverlayProps {
  userRepos?: [] | null;
  isPickerOpen?: boolean;
}

export interface GitHubOverlayState {
  repoName?: string;
  username?: string;
  fileList?: any[];
}

/*
  PureComponent is exactly the same as Component except that it handles the shouldComponentUpdate method for you.
  When props or state changes, PureComponent will do a shallow comparison on both props and state.
  Component on the other hand won't compare current props and state to next out of the box
*/
export class GitHubOverlay extends React.PureComponent<GitHubOverlayProps, GitHubOverlayState> {
  public state: GitHubOverlayState = {
    repoName: ''
  };

  userRepos = store.getState().session.userRepos;
  username = store.getState().session.username;
  isPickerOpen = store.getState().session.isPickerOpen;

  setRepoName = (e: any) => {
    this.setState({ repoName: e.target.value });
  };

  setFileList = async () => {};

  public render() {
    return (
      <MultistepDialog
        className="GitHubPicker"
        onClose={this.handleClose}
        isOpen={this.props.isPickerOpen}
        title="RepoFile Picker"
      >
        <DialogStep
          id="Repository"
          panel={
            <RepositoryExplorerPanel
              userRepos={this.props.userRepos}
              repoName={this.state.repoName}
              setRepoName={this.setRepoName}
              {...this.props}
            />
          }
          title="Select Repository"
        />

        <DialogStep
          id="Files"
          panel={
            <FileExplorerPanel
              repoName={this.state.repoName}
              username={this.state.username}
              {...this.props}
            />
          }
          title="Select File"
        />
      </MultistepDialog>
    );
  }

  private handleClose() {
    store.dispatch(actions.setPickerDialog(false));
  }
}

export interface IRepositoryExplorerPanelProps {
  [a: string]: any;
}

const RepositoryExplorerPanel: React.FunctionComponent<IRepositoryExplorerPanelProps> = props => {
  const { userRepos, repoName, setRepoName } = props;
  return (
    <div className={classNames(Classes.DIALOG_BODY, 'repo-step')}>
      <p>Repo List: </p>
      <RadioGroup onChange={setRepoName} selectedValue={repoName}>
        {userRepos.map((repo: any, i: number) => (
          <Radio label={repo.name} key={repo.id} value={repo.name} tabIndex={i} />
        ))}
      </RadioGroup>
    </div>
  );
};

const retrieveFiles = async (repoName: string, username: string, filePath: string) => {
  const octokit = store.getState().session.githubOctokitInstance;
  if (octokit === undefined) {
    return [];
  } else {
    const results = await octokit.repos.getContent({
      owner: username,
      repo: repoName,
      path: filePath
    });
    const files = results.data;
    console.log('inside' + files);
    return files;
  }
};

export interface IFileExplorerPanelProps {
  [a: string]: any;
}

const FileExplorerPanel: React.FunctionComponent<IFileExplorerPanelProps> = props => {
  const { repoName, username } = props;
  const filePath = '';
  const files = retrieveFiles(repoName, username, filePath);
  console.log('outside' + files);

  return (
    <div className={classNames(Classes.DIALOG_BODY, 'file-step')}>
      <p>File List: </p>
    </div>
  );
};
