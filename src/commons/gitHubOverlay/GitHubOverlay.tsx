import { DialogStep, IButtonProps, ITreeNode, MultistepDialog } from '@blueprintjs/core';
import { Octokit } from '@octokit/rest';
import React from 'react';

import * as GitHubUtils from '../../features/github/GitHubUtils';
import { store } from '../../pages/createStore';
import { actions } from '../utils/ActionsHelper';
import { showWarningMessage } from '../utils/NotificationsHelper';
import { ConfirmOpen } from './ConfirmDialog';
import { FileExplorerPanel } from './FileExplorerPanel';
import { GitHubFileNodeData } from './GitHubFileNodeData';
import { GitHubTreeNodeCreator } from './GitHubTreeNodeCreator';
import { RepositoryExplorerPanel } from './RepositoryExplorerPanel';

type GitHubOverlayProps = {
  userRepos?: [];
  pickerType: string;
  isPickerOpen: boolean;
  handleEditorValueChange: (val: string) => void;
};

// import { showSuccessMessage, showWarningMessage } from '../utils/NotificationsHelper';

type GitHubOverlayState = {
  repoName: string;
  repoFiles: ITreeNode<GitHubFileNodeData>[];
  fileIndex: number;
  filePath: string;
  commitMessage: string;
  isConfirmOpen: boolean;
};

export class GitHubOverlay extends React.PureComponent<GitHubOverlayProps, GitHubOverlayState> {
  constructor(props: GitHubOverlayProps | Readonly<GitHubOverlayProps>) {
    super(props);

    this.setRepoName = this.setRepoName.bind(this);
    this.setFilePath = this.setFilePath.bind(this);
    this.setCommitMessage = this.setCommitMessage.bind(this);
    this.refreshRepoFiles = this.refreshRepoFiles.bind(this);
    this.closeConfirmDialog = this.closeConfirmDialog.bind(this);
    this.openConfirmDialog = this.openConfirmDialog.bind(this);

    this.handleClose = this.handleClose.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public state: GitHubOverlayState = {
    repoName: '',
    repoFiles: [],
    fileIndex: 0,
    filePath: '',
    commitMessage: '',
    isConfirmOpen: false
  };

  userRepos = store.getState().session.userRepos;
  pickerType = store.getState().session.pickerType;
  isPickerOpen = store.getState().session.isPickerOpen;

  setRepoName(e: any) {
    const repositoryName = e.target.value;
    this.setState({ repoName: repositoryName });
    store.dispatch(actions.setGitHubRepositoryName(repositoryName));
  }

  setFilePath(e: string) {
    this.setState({ filePath: e });
    store.dispatch(actions.setGitHubRepositoryFilepath(e));
  }

  setCommitMessage(e: string) {
    store.dispatch(actions.setGitHubCommitMessage(e));
  }

  closeConfirmDialog() {
    this.setState({ isConfirmOpen: false });
  }

  openConfirmDialog() {
    this.setState({ isConfirmOpen: true });
  }

  async refreshRepoFiles() {
    const newRepoFiles = await GitHubTreeNodeCreator.getFirstLayerRepoFileNodes(
      this.state.repoName
    );
    this.setState({ repoFiles: newRepoFiles });
  }

  public render() {
    const finalButtonProps: Partial<IButtonProps> = {
      intent: 'primary',
      onClick: this.handleSubmit,
      text: this.props.pickerType
    };

    return (
      <div>
        <MultistepDialog
          className="GitHubPicker"
          finalButtonProps={finalButtonProps}
          isOpen={this.props.isPickerOpen}
          onClose={this.handleClose}
          title={this.props.pickerType + ' file'}
          usePortal={false}
        >
          <DialogStep
            id="Repository"
            panel={
              <RepositoryExplorerPanel
                userRepos={this.userRepos}
                repoName={this.state.repoName}
                setRepoName={this.setRepoName}
                refreshRepoFiles={this.refreshRepoFiles}
                {...this.props}
              />
            }
            title="Select Repository"
          />
          <DialogStep
            id="Files"
            panel={
              <FileExplorerPanel
                repoFiles={this.state.repoFiles}
                repoName={this.state.repoName}
                pickerType={this.props.pickerType}
                filePath={this.state.filePath}
                setFilePath={this.setFilePath}
                setCommitMessage={this.setCommitMessage}
              />
            }
            title="Select File"
          />
        </MultistepDialog>
        <ConfirmOpen
          isOpen={this.state.isConfirmOpen}
          closeConfirmDialog={this.closeConfirmDialog}
          pickerType={this.props.pickerType}
          handleEditorValueChange={this.props.handleEditorValueChange}
        />
      </div>
    );
  }

  handleClose() {
    store.dispatch(actions.setPickerDialog(false));
  }

  async handleSubmit() {
    let success = false;

    if (this.props.pickerType === 'Open') {
      success = await checkIfFileCanBeOpened();
    }

    if (this.props.pickerType === 'Save' || this.props.pickerType === 'SaveNew') {
      success = await checkIfFileCanBeSaved();
    }

    if (success) {
      this.openConfirmDialog();
    }
  }
}

async function checkIfFileCanBeOpened() {
  const octokit = GitHubUtils.getGitHubOctokitInstance() as Octokit;

  if (octokit === undefined) {
    showWarningMessage('Please log in and try again', 2000);
    return false;
  }

  const githubLoginID = GitHubUtils.getGitHubLoginID();
  const repoName = store.getState().session.githubRepositoryName;
  const filePath = store.getState().session.githubRepositoryFilepath;

  if (filePath === '') {
    showWarningMessage('Please select a file!', 2000);
    return false;
  }

  let files;

  try {
    const results = await octokit.repos.getContent({
      owner: githubLoginID,
      repo: repoName,
      path: filePath
    });

    files = results.data;
  } catch (err) {
    showWarningMessage('Connection denied or file does not exist.', 2000);
    console.error(err);
    return false;
  }

  if (Array.isArray(files)) {
    showWarningMessage("Can't open folder as a file!", 2000);
    return false;
  }

  return true;
}

async function checkIfFileCanBeSaved() {
  const octokit = GitHubUtils.getGitHubOctokitInstance();

  if (octokit === undefined) {
    showWarningMessage('Please log in and try again', 2000);
    return false;
  }

  const githubLoginID = GitHubUtils.getGitHubLoginID();
  const repoName = store.getState().session.githubRepositoryName;
  const filePath = store.getState().session.githubRepositoryFilepath;

  let files;

  try {
    const results = await octokit.repos.getContent({
      owner: githubLoginID,
      repo: repoName,
      path: filePath
    });

    files = results.data;
  } catch (err) {
    // 404 status means that the file could not be found.
    // In this case, the dialog should still continue as the user should be given
    // the option of creating a new file on their remote repository.
    if (err.status !== 404) {
      showWarningMessage('Connection denied or file does not exist.', 2000);
      console.error(err);
      return false;
    }

    store.dispatch(actions.setPickerType('SaveNew'));
  }

  if (Array.isArray(files)) {
    showWarningMessage("Can't save over a folder!", 2000);
    return false;
  }

  return true;
}
