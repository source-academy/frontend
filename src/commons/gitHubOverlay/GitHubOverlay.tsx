import { DialogStep, IButtonProps, ITreeNode, MultistepDialog } from '@blueprintjs/core';
import React from 'react';

import { store } from '../../pages/createStore';
import { actions } from '../utils/ActionsHelper';
import { FileExplorerPanel } from './FileExplorerPanel';
import { GitHubFileNodeData } from './GitHubFileNodeData';
import { GitHubTreeNodeCreator } from './GitHubTreeNodeCreator';
import { RepositoryExplorerPanel } from './RepositoryExplorerPanel';

type GitHubOverlayProps = {
  userRepos?: [];
  pickerType: string;
  isPickerOpen: boolean;
  handleEditorValueChange: (val: string) => void;
}

type GitHubOverlayState = {
  repoName: string;
  repoFiles: ITreeNode<GitHubFileNodeData>[];
  fileIndex: number;
  filePath: string;
  fileName: string;
  commitMessage: string;
}

export class GitHubOverlay extends React.PureComponent<GitHubOverlayProps, GitHubOverlayState> {
  constructor(props: GitHubOverlayProps | Readonly<GitHubOverlayProps>) {
    super(props);
    this.setRepoName = this.setRepoName.bind(this);
    this.setFilePath = this.setFilePath.bind(this);
    this.setFileName = this.setFileName.bind(this);
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
    fileName: '',
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

  setFileName(e: string) {
    this.setState({ fileName: e });
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
    const octokit = store.getState().session.githubOctokitInstance;
    const gitHubLogin = store.getState().session.gitHubLogin;
    if (octokit === undefined) return;
    try {
      const results = await octokit.repos.getContent({
        owner: gitHubLogin,
        repo: this.state.repoName,
        path: this.state.filePath
      });
      const { content } = { ...results.data };
      if (content) {
        this.props.handleEditorValueChange(Buffer.from(content, 'base64').toString());
      }
      store.dispatch(actions.setPickerDialog(false));
    } catch (err) {
      console.error(err);
    }

  }

  async saveFile() {
    const octokit = store.getState().session.githubOctokitInstance;
    if (octokit === undefined) return;
    const gitHubLogin = store.getState().session.gitHubLogin;
    const gitHubName = store.getState().session.gitHubName;
    const gitHubEmail = store.getState().session.gitHubEmail;
    const content = store.getState().workspaces.playground.editorValue || '';
    const contentEncoded = Buffer.from(content, 'utf8').toString('base64');
    try {
      const data = await octokit.repos.createOrUpdateFileContents({
        owner: gitHubLogin,
        repo: this.state.repoName,
        path: this.state.filePath + '/' + this.state.fileName,
        message: this.state.commitMessage,
        content: contentEncoded,
        committer: {name: gitHubName, email: gitHubEmail},
        author: {name: gitHubName, email: gitHubEmail}
      });
      console.log(data);
    } catch (err) {
      console.error(err);
    }

/*
    try {
      await octokit.repos.getContent({
        method: 'HEAD',
        owner: gitHubLogin,
        repo: this.state.repoName,
        path: this.state.filePath
      });
      // file exists
      await octokit.repos.createOrUpdateFileContents({
        owner: gitHubLogin,
        repo: this.state.repoName,
        path: this.state.filePath + '/' + this.state.fileName,
        message: this.state.commitMessage,
        sha: '',
        content: contentEncoded,
        committer: {name: gitHubName, email: gitHubEmail},
        author: {name: gitHubName, email: gitHubEmail}
      });
      store.dispatch(actions.setPickerDialog(false));
    } catch (error) {
      if (error.status === 404) {
        // file does not exist
        await octokit.repos.createOrUpdateFileContents({
          owner: gitHubLogin,
          repo: this.state.repoName,
          path: this.state.filePath + '/' + this.state.fileName,
          message: this.state.commitMessage,
          content: contentEncoded,
          committer: {name: gitHubName, email: gitHubEmail},
          author: {name: gitHubName, email: gitHubEmail}
        });
        store.dispatch(actions.setPickerDialog(false));
      } else {
        // handle connection errors
      }
    }
    */
  }

  public render() {
    const finalButtonProps: Partial<IButtonProps> = {
      intent: 'primary',
      onClick: this.handleSubmit,
      text: store.getState().session.pickerType
    };

    return (
      <MultistepDialog
        className="GitHubPicker"
        finalButtonProps={finalButtonProps}
        isOpen={this.props.isPickerOpen}
        onClose={this.handleClose}
        title={store.getState().session.pickerType + ' file'}
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
              pickerType={store.getState().session.pickerType}
              setFilePath={this.setFilePath}
              setFileName={this.setFileName}
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
    if (store.getState().session.pickerType === 'Open') {
      this.openFile();
    } else {
      this.saveFile();
    }
  }
}
