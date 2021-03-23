import { DialogStep, IButtonProps, ITreeNode, MultistepDialog } from '@blueprintjs/core';
import React from 'react';

import { store } from '../../pages/createStore';
import { actions } from '../utils/ActionsHelper';
import { FileExplorerPanel } from './FileExplorerPanel';
import { RepositoryExplorerPanel } from './RepositoryExplorerPanel';

export interface GitHubOverlayProps {
  userRepos?: [];
  isPickerOpen: boolean;
  handleEditorValueChange: (val: string) => void;
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
    this.createNode = this.createNode.bind(this);
    this.setRepoFiles = this.setRepoFiles.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
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

  octokit = store.getState().session.githubOctokitInstance;
  userRepos = store.getState().session.userRepos;
  isPickerOpen = store.getState().session.isPickerOpen;

  setRepoName(e: any) {
    this.setState({ repoName: e.target.value });
  }

  setFilePath(e: any) {
    this.setState({ filePath: e });
  }

  async createNode(thisFile: any) {
    const index = this.state.fileIndex++;
    if (this.octokit !== undefined) {
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
        const files = await this.octokit.repos.getContent({
          owner: this.state.username,
          repo: this.state.repoName,
          path: thisFile.path
        });
        const folder: ITreeNode[] = [];
        if (Array.isArray(files)) {
          for (let i = 0; i < files.length; i++) {
            folder.push(await this.createNode(files[i]));
          }
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
    }
    const node: ITreeNode = {
      id: this.state.fileIndex++,
      label: 'dummy file'
    };
    return node;
  }

  async setRepoFiles() {
    this.setState({ fileIndex: 0 });
    const newRepoFiles: ITreeNode[] = [];
    if (this.octokit === undefined || this.state.repoName === '') return;
    try {
      const results = await this.octokit.repos.getContent({
        owner: this.state.username,
        repo: this.state.repoName,
        path: ''
      });
      const files = results.data;
      if (Array.isArray(files)) {
        for (let i = 0; i < files.length; i++) {
          const newNode = await this.createNode(files[i]);
          newRepoFiles.push(newNode);
        }
      }
      this.setState({ repoFiles: newRepoFiles });
    } catch (err) {
      console.error(err);
    }
    console.log(this.state.repoFiles);
  }

  async getFileContents() {  
    if (this.octokit === undefined) return;
    this.octokit.repos.getContent({
      owner: this.state.username,
      repo: this.state.repoName,
      path: this.state.filePath
    }).then(
      value => {
        // fulfillment
        const { content } = {...value.data };
        if (content) {
          // console.log(Buffer.from(content, 'base64').toString());
          this.props.handleEditorValueChange(Buffer.from(content, 'base64').toString());
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
      text: 'Open' // To change to Open or Save
    };

    return (
      <MultistepDialog
        className="GitHubPicker"
        finalButtonProps={finalButtonProps}
        isOpen={this.props.isPickerOpen}
        nextButtonProps={{ disabled: this.state.repoFiles.length === 0 }}
        onClose={this.handleClose}
        title="Opening Repository File"
      >
        <DialogStep
          id="Repository"
          panel={
            <RepositoryExplorerPanel
              userRepos={this.userRepos}
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
          panel={
            <FileExplorerPanel
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

  handleSelect() {
    this.setRepoFiles();
  }

  handleSubmit() {
    this.getFileContents();
    store.dispatch(actions.setPickerDialog(false));
  }
}

/*
  sortNodeList (nodeList: ITreeNode[]) {
    console.log("sorted nodelist");
    nodeList.sort(function(x, y) {
      if (x.hasCaret === false && y.hasCaret === true) {
        const tempNode = x;
        x = y;
        y = tempNode;
      } else if (x.hasCaret === y.hasCaret) {
        if (x.label > y.label) {
          const tempNode = x;
          x = y;
          y = tempNode;
        }
      }
      return -1;
    });
    nodeList.forEach(node => {
      if (node.childNodes !== undefined) {
        this.sortNodeList(node.childNodes);
      }
    });
  }
*/