import { DialogStep, IButtonProps, ITreeNode, MultistepDialog } from '@blueprintjs/core';
import React from 'react';

import { store } from '../../pages/createStore';
import { actions } from '../utils/ActionsHelper';
import { FileExplorerPanel } from './FileExplorerPanel';
import { GitHubFileNodeData } from './GitHubFileNodeData';
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
}

export class GitHubOverlay extends React.PureComponent<GitHubOverlayProps, GitHubOverlayState> {
  constructor(props: GitHubOverlayProps | Readonly<GitHubOverlayProps>) {
    super(props);
    this.setRepoName = this.setRepoName.bind(this);
    this.setFilePath = this.setFilePath.bind(this);
    this.createNode = this.createNode.bind(this);
    this.initRepoFiles = this.initRepoFiles.bind(this);
    this.getChildNodes = this.getChildNodes.bind(this);
    this.openFile = this.openFile.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public state: GitHubOverlayState = {
    repoName: '',
    repoFiles: [],
    fileIndex: 0,
    filePath: ''
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

  /**
   * Returns the an ITreeNode to be mounted in the file explorer display
   *
   * @param thisFile The file to be generated and mounted
   */
  createNode(thisFile: any) {
    const index = this.state.fileIndex;
    this.setState({ fileIndex: index + 1 });

    let node: ITreeNode<GitHubFileNodeData> = {
      id: index,
      label: 'dummy file'
    };

    if (thisFile.type === 'file') {
      node = {
        id: index,
        nodeData: new GitHubFileNodeData(thisFile.path, 'file'),
        icon: 'document',
        label: thisFile.name
      };
    }

    if (thisFile.type === 'dir') {
      node = {
        id: index,
        nodeData: new GitHubFileNodeData(thisFile.path, 'dir'),
        icon: 'folder-close',
        label: thisFile.name,
        childNodes: [] // Child nodes are initially empty
      };
    }

    return node;
  }

  /**
   * Returns the childNodes of a folder
   *
   * @param filePath The filepath of the folder whose children need to be retrieved
   */
  async getChildNodes(filePath: string) {
    const childNodes: ITreeNode<GitHubFileNodeData>[] = [];

    const octokit = store.getState().session.githubOctokitInstance;
    const gitHubLogin = store.getState().session.gitHubLogin;

    if (octokit !== undefined) {
      const results = await octokit.repos.getContent({
        owner: gitHubLogin,
        repo: this.state.repoName,
        path: filePath
      });

      const childFiles = results.data;

      if (Array.isArray(childFiles)) {
        childFiles.forEach(childFile => {
          childNodes.push(this.createNode(childFile));
        });
      }
    }

    return childNodes;
  }

  async initRepoFiles() {
    this.setState({ fileIndex: 0 });
    this.setState({ repoFiles: [] });

    const octokit = store.getState().session.githubOctokitInstance;

    const gitHubLogin = store.getState().session.gitHubLogin;

    if (octokit === undefined || this.state.repoName === '') return;

    try {
      const newRepoFiles: ITreeNode<GitHubFileNodeData>[] = [];

      const results = await octokit.repos.getContent({
        owner: gitHubLogin,
        repo: this.state.repoName,
        path: ''
      });

      const files = results.data;

      if (Array.isArray(files)) {
        for (let i = 0; i < files.length; i++) {
          newRepoFiles.push(this.createNode(files[i]));
        }
      }

      this.setState({ repoFiles: newRepoFiles });
    } catch (err) {
      console.error(err);
    }
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
      await octokit.repos.getContent({
        method: 'HEAD',
        owner: gitHubLogin,
        repo: this.state.repoName,
        path: this.state.filePath
      });
      // file exists
    } catch (error) {
      if (error.status === 404) {
        // file does not exist
        
      } else {
        // handle connection errors
      }
    }


    try {
      const { data } = await octokit.repos.createOrUpdateFileContents({
        owner: gitHubLogin,
        repo: this.state.repoName,
        path: 'README.MD',
        message: 'TEST PUSH FROM CADET_FRONTEND',
        content: contentEncoded,
        // sha: ,
        committer: {name: gitHubName, email: gitHubEmail},
        author: {name: gitHubName, email: gitHubEmail}
      });
      console.log(data);
      store.dispatch(actions.setPickerDialog(false));
    } catch (err) {
      console.error(err);
    }
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
        title="Opening Repository File"
      >
        <DialogStep
          id="Repository"
          panel={
            <RepositoryExplorerPanel
              userRepos={this.userRepos}
              repoName={this.state.repoName}
              setRepoName={this.setRepoName}
              setRepoFiles={this.initRepoFiles}
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
              getChildNodes={this.getChildNodes}
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
