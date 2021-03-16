import { Classes, DialogStep, MultistepDialog, Radio, RadioGroup } from '@blueprintjs/core';
import { Octokit } from '@octokit/rest';
import classNames from 'classnames';
import * as React from 'react';

import { store } from '../../pages/createStore';

export interface GitHubOverlayProps {
  loggedInAs?: Octokit;
  userRepos?: [] | null;
  isPickerOpen?: boolean;
}

export interface GitHubOverlayState {
  autoFocus: boolean;
  canEscapeKeyClose: boolean;
  canOutsideClickClose: boolean;
  enforceFocus: boolean;
  isOpen: boolean;
  usePortal: boolean;
  value?: string;
  repoName?: string;
}

/*
  PureComponent is exactly the same as Component except that it handles the shouldComponentUpdate method for you.
  When props or state changes, PureComponent will do a shallow comparison on both props and state.
  Component on the other hand won't compare current props and state to next out of the box
*/
export class GitHubOverlay extends React.PureComponent<GitHubOverlayProps, GitHubOverlayState> {
  public state: GitHubOverlayState = {
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: true,
    isOpen: false,
    usePortal: true,
    repoName: ''
  };

  isLoggedIn = store.getState().session.githubOctokitInstance !== undefined;
  isPickerOpen = store.getState().session.isPickerOpen;
  userRepos = store.getState().session.userRepos;
  setRepoName = (e: any)=>{ 
    this.setState({repoName: e.target.value})
  }

  public render() {
    return (
      <MultistepDialog className="GitHubPicker" isOpen={this.props.isPickerOpen}>
        <DialogStep
          id="Repository"
          panel={<RepositoryExplorerPanel userRepos={this.props.userRepos} repoName={this.state.repoName} setRepoName={this.setRepoName} {...this.props} />}
          title="Select Repository"
        />
        <DialogStep id="Files" panel={<FileExplorerPanel />} title="Select File" />
      </MultistepDialog>
    );
  }
}

export interface IRepositoryExplorerPanelProps {
  [a: string]: any;
}
// <pre>{JSON.stringify(props.userRepos, null, 2)}</pre>
const RepositoryExplorerPanel: React.FunctionComponent<IRepositoryExplorerPanelProps> = props => {
  const  { userRepos, repoName, setRepoName } = props;
  return (
    <div className={classNames(Classes.DIALOG_BODY, 'multistep-dialog-repo-step')}>
      <p>Repo List: </p>
      <RadioGroup onChange={setRepoName} selectedValue={repoName}>
        {
          userRepos.map((repo: any, i: number) => (
            <Radio label={repo.name} key={repo.id} value={repo.name} tabIndex={i} />
            )
          )
        }
      </RadioGroup>
    </div>
  )
};

export interface IFileExplorerPanelProps {
  [a: string]: never;
}

const FileExplorerPanel: React.FunctionComponent<IFileExplorerPanelProps> = props => {
  return (
    <div className={classNames(Classes.DIALOG_BODY, 'multistep-dialog-file-step')}>
      <p>File List: </p>
    </div>
  );
};
