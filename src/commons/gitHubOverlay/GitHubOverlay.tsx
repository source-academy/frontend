import { DialogStep, IButtonProps, ITreeNode, MultistepDialog } from '@blueprintjs/core';
import { Octokit } from '@octokit/rest';
import React from 'react';

import * as GitHubUtils from '../../features/github/GitHubUtils';
import { store } from '../../pages/createStore';
import { actions } from '../utils/ActionsHelper';
import { showSuccessMessage, showWarningMessage } from '../utils/NotificationsHelper';
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
  }

  public state: GitHubOverlayState = {
    repoName: '',
    repoFiles: [],
    fileIndex: 0,
    filePath: '',
    commitMessage: ''
  };

  userRepos = store.getState().session.userRepos;
  pickerType = store.getState().session.pickerType;
  isPickerOpen = store.getState().session.isPickerOpen;

  setRepoName(e: any) {
    this.setState({ repoName: e.target.value });
  }

  setFilePath(e: string) {
    this.setState({ filePath: e });
  }

  setCommitMessage(e: string) {
    this.setState({ commitMessage: e });
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
    try {
      const results = await octokit.repos.getContent({
        owner: githubLoginID,
        repo: this.state.repoName,
        path: this.state.filePath
      });
      const files = results.data;
      if (Array.isArray(files)) {
        showWarningMessage("Can't open a folder as a file!", 1000);
      } else {
        const { content } = { ...results.data };
        if (content) {
          this.props.handleEditorValueChange(Buffer.from(content, 'base64').toString());
          showSuccessMessage('Successfully loaded file!', 1000);
          store.dispatch(actions.setPickerDialog(false));
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
    const githubName = GitHubUtils.getGitHubName();
    const githubEmail = GitHubUtils.getGitHubEmail();
    const content = store.getState().workspaces.playground.editorValue || '';
    let sha: string;
    const contentEncoded = Buffer.from(content, 'utf8').toString('base64');
    try {
      const results = await octokit.repos.getContent({
        owner: githubLoginID,
        repo: this.state.repoName,
        path: this.state.filePath
      });
      // file exists
      const files = results.data;
      if (!Array.isArray(files)) {
        sha = files.sha;
        await octokit.repos.createOrUpdateFileContents({
          owner: githubLoginID,
          repo: this.state.repoName,
          path: this.state.filePath,
          message: this.state.commitMessage,
          content: contentEncoded,
          sha: sha,
          committer: { name: githubName, email: githubEmail },
          author: { name: githubName, email: githubEmail }
        });
        showSuccessMessage('Successfully saved file!', 1000);
        store.dispatch(actions.setPickerDialog(false));
      }
      showWarningMessage("Can't save over a folder!");
    } catch (error) {
      if (error.status === 404) {
        // file does not exist
        await octokit.repos.createOrUpdateFileContents({
          owner: githubLoginID,
          repo: this.state.repoName,
          path: this.state.filePath,
          message: this.state.commitMessage,
          content: contentEncoded,
          committer: { name: githubName, email: githubEmail },
          author: { name: githubName, email: githubEmail }
        });
        showSuccessMessage('Successfully created file!', 1000);
        store.dispatch(actions.setPickerDialog(false));
      } else {
        // handle connection errors
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
      <MultistepDialog
        className="GitHubPicker"
        finalButtonProps={finalButtonProps}
        isOpen={this.props.isPickerOpen}
        onClose={this.handleClose}
        title={this.props.pickerType + ' file'}
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
