import { Classes, DialogStep, IButtonProps, ITreeNode, MultistepDialog, Radio, RadioGroup, Tree } from '@blueprintjs/core';
import classNames from 'classnames';
import * as React from 'react';

import { store } from '../../pages/createStore';
import { actions } from '../utils/ActionsHelper';

export interface GitHubOverlayProps {
  userRepos?: [];
  isPickerOpen?: boolean;
}

export interface GitHubOverlayState {
  username?: string;
  repoName?: string;
  repoFiles?: ITreeNode<{}>[];
  fileIndex: number;
}

export class GitHubOverlay extends React.PureComponent<GitHubOverlayProps, GitHubOverlayState> {
  constructor(props: GitHubOverlayProps | Readonly<GitHubOverlayProps>) {
    super(props);
    this.setRepoName = this.setRepoName.bind(this);
    this.getContent = this.getContent.bind(this);
    this.createNode = this.createNode.bind(this);
    this.setRepoFiles = this.setRepoFiles.bind(this);
  }

  public state: GitHubOverlayState = {
    username: store.getState().session.username,
    repoName: '',
    repoFiles: [],
    fileIndex: 0
  };

  userRepos = store.getState().session.userRepos;
  isPickerOpen = store.getState().session.isPickerOpen;

  setRepoName = (e: any) => {
    this.setState({ repoName: e.target.value });
  };

  async getContent (username: string, repoName: string, filePath: string) {
    const octokit = store.getState().session.githubOctokitInstance;
    if (octokit === undefined) return;
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
    if (thisFile.type === "dir") {
      const files = await this.getContent(username, repoName, thisFile.path);
      const folder: ITreeNode<{}>[] = [];
      if (Array.isArray(files)) {
        files.forEach(async file => {
          folder.push(await this.createNode(username, repoName, file));
        });
      }
      const node: ITreeNode<{}> = {

        id: index,
        hasCaret: true,
        icon: "folder-close",
        label: thisFile.name,
        childNodes: folder
      }
      return node;
    }
    if (thisFile.type === "file") {
      const node: ITreeNode<{}> = {
        id: index,
        hasCaret: false,
        icon: "document",
        label: thisFile.name
      }
      return node;
    }
    const node : ITreeNode<{}> = {
      id: this.state.fileIndex++,
      hasCaret: false,
      icon: "document",
      label: "test"
    };
    this.setState({fileIndex: index});
    return node;
  }
  
  async setRepoFiles(username: string, repoName:string) {
    console.log(this.state.username);
    console.log(this.state.repoName);
    if (username === '' || repoName === '') return;
    this.setState({repoFiles: []});
    const files = await this.getContent(username, repoName, '');
    if (Array.isArray(files)) {
      files.forEach(async file => {
        this.state.repoFiles?.push(await this.createNode(username, repoName, file));        
      });
    }
    console.log(this.state.repoFiles);
  }

  handleClose() {
    store.dispatch(actions.setPickerDialog(false));
  }

  handleSubmit() {
    this.handleClose();
  }

  public render() {
    const finalButtonProps: Partial<IButtonProps> = {
      intent: "primary",
      onClick: this.handleSubmit,
      text: "Close", // To change to Open or Save
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
              userRepos={this.props.userRepos}
              userName={this.state.username}
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
              {...this.props}
            />
          }
          title="Select File"
        />
      </MultistepDialog>
    );
  }
}

export interface IRepositoryExplorerPanelProps {
  [a: string]: any;
}

const RepositoryExplorerPanel: React.FunctionComponent<IRepositoryExplorerPanelProps> = props => {
  const { userRepos, username, repoName, setRepoName, setRepoFiles } = props;

  React.useEffect(() => {
    setRepoFiles(username, repoName);
  }, [username, repoName, setRepoFiles]);

  return (
    <div className={classNames(Classes.DIALOG_BODY, 'repo-step')}>
      <p>Repo List: </p>
      <RadioGroup onChange={setRepoName} selectedValue={repoName}>
        {userRepos.map((repo: any, i: number) => (
          <Radio label={repo.name} key={repo.id} value={repo.name} />
        ))}
      </RadioGroup>
    </div>
  );
};

export interface IFileExplorerPanelProps {
  [a: string]: any;
}

const FileExplorerPanel: React.FunctionComponent<IFileExplorerPanelProps> = props => {
  const { repoFiles } = props;

  const handleNodeCollapse = (nodeData: ITreeNode) => {
    nodeData.isExpanded = false;
  };

  const handleNodeExpand = (nodeData: ITreeNode) => {
    nodeData.isExpanded = true;
  };

  return (
    <div className={classNames(Classes.DIALOG_BODY, 'file-step')}>
      <p>File List: </p>
      <Tree
        contents={repoFiles}
        onNodeCollapse={handleNodeCollapse}
        onNodeExpand={handleNodeExpand}
        className={Classes.ELEVATION_0}
      />
    </div>
  );
};

/*
  {
    id: index,
    hasCaret: true,
    icon: "folder-close",
    label: (e.name), childNodes:[]
  }
*/

//ITreeNode<{}>[] | ({ id: number; hasCaret: boolean; icon: string; label: any; folder?: undefined; } | { id: number; hasCaret: boolean; icon: string; label: any; folder: {}[]; } | undefined)[] | undefined = []