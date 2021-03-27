import { DialogStep, IButtonProps, ITreeNode, MultistepDialog } from '@blueprintjs/core';
import { Octokit } from '@octokit/rest';
import React from 'react';

import * as GitHubUtils from '../../features/github/GitHubUtils';
import { store } from '../../pages/createStore';
import { actions } from '../utils/ActionsHelper';
import { showSuccessMessage, showWarningMessage } from '../utils/NotificationsHelper';
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
    this.openFile = this.openFile.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setConfirmDialogOpen = this.setConfirmDialogOpen.bind(this);
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

  setConfirmDialogOpen(isConfirmOpenNewValue: boolean) {
    this.setState({ isConfirmOpen: isConfirmOpenNewValue });
  }

  async refreshRepoFiles() {
    const newRepoFiles = await GitHubTreeNodeCreator.getFirstLayerRepoFileNodes(
      this.state.repoName
    );
    this.setState({ repoFiles: newRepoFiles });
  }

  async openFile() {
    const octokit = GitHubUtils.getGitHubOctokitInstance() as Octokit;
    const githubLoginID = GitHubUtils.getGitHubLoginID();

    if (octokit === undefined) return;

    const repoName = store.getState().session.githubRepositoryName;
    const filePath = store.getState().session.githubRepositoryFilepath;

    console.log(repoName);
    console.log(filePath);

    try {
      const results = await octokit.repos.getContent({
        owner: githubLoginID,
        repo: repoName,
        path: filePath
      });

      const files = results.data;

      if (filePath === '') {
        showWarningMessage('Nothing selected!', 1000);
      } else if (Array.isArray(files)) {
        showWarningMessage("Can't open folder as a file!", 1000);
      } else {
        const { content } = { ...results.data };

        if (content) {
          this.setState({ isConfirmOpen: true });
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async saveFile() {
    const octokit = GitHubUtils.getGitHubOctokitInstance();

    if (octokit === undefined) return;

    const githubLoginID = GitHubUtils.getGitHubLoginID();
    const repoName = store.getState().session.githubRepositoryName;
    const filePath = store.getState().session.githubRepositoryFilepath;

    try {
      const results = await octokit.repos.getContent({
        owner: githubLoginID,
        repo: repoName,
        path: filePath
      });

      // If no error is thrown, the file exists
      const files = results.data;

      if (Array.isArray(files)) {
        showWarningMessage("Can't save over a folder!");
      } else {
        this.setState({ isConfirmOpen: true });
      }
    } catch (error) {
      // A 404 error is thrown, meaning that the file doesn't exist
      // We are creating a new file on GitHub
      if (error.status === 404) {
        const githubName = GitHubUtils.getGitHubName();
        const githubEmail = GitHubUtils.getGitHubEmail();
        const commitMessage = store.getState().session.githubCommitMessage;

        const content = store.getState().workspaces.playground.editorValue || '';
        const contentEncoded = Buffer.from(content, 'utf8').toString('base64');

        await octokit.repos.createOrUpdateFileContents({
          owner: githubLoginID,
          repo: repoName,
          path: filePath,
          message: commitMessage,
          content: contentEncoded,
          committer: { name: githubName, email: githubEmail },
          author: { name: githubName, email: githubEmail }
        });

        showSuccessMessage('Successfully created file!', 1000);
        store.dispatch(actions.setPickerDialog(false));
      } else {
        // handle connection errors
        console.error(error);
      }
    }
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
          setOpen={this.setConfirmDialogOpen}
          pickerType={this.props.pickerType}
          handleEditorValueChange={this.props.handleEditorValueChange}
        />
      </div>
    );
  }

  handleClose() {
    store.dispatch(actions.setPickerDialog(false));
  }

  handleSubmit() {
    if (this.props.pickerType === 'Open') {
      this.openFile();
    } else {
      this.saveFile();
    }
  }
}
