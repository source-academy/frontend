import { DialogStep, IButtonProps, ITreeNode, MultistepDialog } from '@blueprintjs/core';
import React from 'react';

import { store } from '../../pages/createStore';
import { actions } from '../utils/ActionsHelper';
import { FileExplorerPanel } from './FileExplorerPanel';
import { RepositoryExplorerPanel } from './RepositoryExplorerPanel';

export interface GitHubOverlayProps {
  userRepos?: [];
  isPickerOpen: boolean;
}

export interface GitHubOverlayState {
  username: string;
  repoName: string;
  repoFiles: ITreeNode[];
  fileIndex: number;
  filePath: string;
}

export class GitHubOverlay extends React.PureComponent<GitHubOverlayProps, GitHubOverlayState> {
  constructor(props: GitHubOverlayProps | Readonly<GitHubOverlayProps>) {
    super(props);
    this.setRepoName = this.setRepoName.bind(this);
    this.setFilePath = this.setFilePath.bind(this);
    this.getContent = this.getContent.bind(this);
    this.createNode = this.createNode.bind(this);
    this.setRepoFiles = this.setRepoFiles.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getFileContents = this.getFileContents.bind(this);
  }

  public state: GitHubOverlayState = {
    username: store.getState().session.username,
    repoName: '',
    repoFiles: [],
    fileIndex: 0,
    filePath: ''
  };

  userRepos = store.getState().session.userRepos;
  isPickerOpen = store.getState().session.isPickerOpen;

  setRepoName(e: any) {
    this.setState({ repoName: e.target.value });
  }

  setFilePath(e: any) {
    this.setState({ filePath: e });
    this.forceUpdate();
  }

  async getContent(username: string, repoName: string, filePath: string) {
    const octokit = store.getState().session.githubOctokitInstance;
    if (octokit === undefined || repoName === '') return;
    const results = await octokit.repos.getContent({
      owner: username,
      repo: repoName,
      path: filePath
    });
    const files = results.data;
    return files;
  }

  async createNode(username: string, repoName: string, thisFile: any) {
    const index = this.state.fileIndex++;
    if (thisFile.type === "file") {
      const node: ITreeNode = {
        id: index,
        nodeData: thisFile.path,
        icon: 'document',
        label: thisFile.name
      };
      return node;
    }
    if (thisFile.type === "dir") {
      const files = await this.getContent(username, repoName, thisFile.path);
      const folder: ITreeNode[] = [];
      if (Array.isArray(files)) {
        files.forEach(async file => {
          folder.push(await this.createNode(username, repoName, file));
        });
      }
      const node: ITreeNode = {
        id: index,
        nodeData: thisFile.path,
        icon: 'folder-close',
        label: thisFile.name,
        childNodes: folder
      };
      return node;
    }
    const node: ITreeNode = {
      id: this.state.fileIndex++,
      label: 'test'
    };
    return node;
  }

  async setRepoFiles(username: string, repoName: string) {
    this.setState({ fileIndex: 0 });
    this.setState({ repoFiles: [] });
    this.getContent(username, repoName, '').then(
      value => {
        // fulfillment
        if (Array.isArray(value)) {
          value.forEach(async file => {
            this.state.repoFiles.push(await this.createNode(username, repoName, file));
          });
        }
      },
      reason => {
        // rejection
        console.error(reason);
      }
    );
    this.forceUpdate();
  }

  // Replace this with OPEN / SAVE HANDLING FUNCTION
  async getFileContents() {  
    const octokit = store.getState().session.githubOctokitInstance;
    if (octokit === undefined || this.state.filePath === '') return;
    octokit.repos.getContent({
      owner: this.state.username,
      repo: this.state.repoName,
      path: this.state.filePath
    }).then(
      value => {
        // fulfillment
        const { content } = {...value.data };
        if (content) {
          console.log(Buffer.from(content, 'base64').toString());
        }
      },
      reason => {
        // rejection
        console.error(reason);
      }
    );
  }

  public render() {
    const finalButtonProps: Partial<IButtonProps> = {
      intent: 'primary',
      onClick: this.handleSubmit,
      text: 'Close' // To change to Open or Save
    };

    return (
      <MultistepDialog
        className="GitHubPicker"
        onClose={this.handleClose}
        isOpen={this.props.isPickerOpen}
        finalButtonProps={finalButtonProps}
        title="Opening Repository File"
      >
        <DialogStep
          id="Repository"
          panel={
            <RepositoryExplorerPanel
              userRepos={this.userRepos}
              username={this.state.username}
              repoName={this.state.repoName}
              setRepoName={this.setRepoName}
              setRepoFiles={this.setRepoFiles}
              {...this.props}
            />
          }
          title="Select Repository"
        />

        <DialogStep
          id="Files"
          panel={<FileExplorerPanel
            repoFiles={this.state.repoFiles}
            setFilePath={this.setFilePath}
            />}
          title="Select File"
        />
      </MultistepDialog>
    );
  }

  handleClose() {
    store.dispatch(actions.setPickerDialog(false));
  }

  handleSubmit() {
    this.getFileContents();
    store.dispatch(actions.setPickerDialog(false));
  }
}

/*
  sortNodeList (nodeList: ITreeNode<{}>[]) {
    nodeList.sort(function(x, y) {
      if (x.hasCaret === y.hasCaret) {
        if (x.label < y.label) {
          return -1;
        }
        const tempid = x.id;
        x.id = y.id;
        y.id = tempid;
        return 1;
      } else if (x.hasCaret === true && y.hasCaret === false) {
        return -1;
      } else {
        const tempid = x.id;
        x.id = y.id;
        y.id = tempid;
        return 1;
      }
    });
    nodeList.forEach(node => {
      if (node.childNodes !== undefined) {
        this.sortNodeList(node.childNodes);
      }
    });
  }
*/
