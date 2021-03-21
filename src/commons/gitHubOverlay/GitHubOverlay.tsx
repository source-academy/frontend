import {
  Classes,
  DialogStep,
  IButtonProps,
  ITreeNode,
  MultistepDialog,
  Radio,
  RadioGroup
} from '@blueprintjs/core';
import classNames from 'classnames';
import * as React from 'react';

import { store } from '../../pages/createStore';
import { actions } from '../utils/ActionsHelper';
import { FileExplorerPanel } from './FileExplorerPanel';

export interface GitHubOverlayProps {
  userRepos?: [];
  isPickerOpen: boolean;
}

export interface GitHubOverlayState {
  username: string;
  repoName: string;
  repoFiles: ITreeNode<{}>[];
  fileIndex: number;
}

export class GitHubOverlay extends React.PureComponent<GitHubOverlayProps, GitHubOverlayState> {
  constructor(props: GitHubOverlayProps | Readonly<GitHubOverlayProps>) {
    super(props);
    this.setRepoName = this.setRepoName.bind(this);
    this.getContent = this.getContent.bind(this);
    this.createNode = this.createNode.bind(this);
    this.setRepoFiles = this.setRepoFiles.bind(this);
    this.refreshPage = this.refreshPage.bind(this);
  }

  public state: GitHubOverlayState = {
    username: store.getState().session.username,
    repoName: '',
    repoFiles: [],
    fileIndex: 0
  };

  userRepos = store.getState().session.userRepos;
  isPickerOpen = store.getState().session.isPickerOpen;

  setRepoName(e: any) {
    this.setState({ repoName: e.target.value });
  }

  async getContent(username: string, repoName: string, filePath: string) {
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
    if (thisFile.type === 'file') {
      const node: ITreeNode<{}> = {
        id: index,
        hasCaret: false,
        icon: 'document',
        label: thisFile.name
      };
      return node;
    }
    if (thisFile.type === 'dir') {
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
        icon: 'folder-close',
        label: thisFile.name,
        childNodes: folder
      };
      return node;
    }
    const node: ITreeNode<{}> = {
      id: this.state.fileIndex++,
      hasCaret: false,
      icon: 'document',
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
        const files = value;
        if (Array.isArray(files)) {
          files.forEach(async file => {
            this.state.repoFiles?.push(await this.createNode(username, repoName, file));
          });
        }
      },
      reason => {
        // rejection
        console.log(reason);
      }
    );
    console.log(this.state.repoFiles);
  }

  handleClose() {
    store.dispatch(actions.setPickerDialog(false));
  }

  handleSubmit() {
    store.dispatch(actions.setPickerDialog(false));
  }

  refreshPage() {
    this.setState(this.state);
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
          panel={
            <FileExplorerPanel
              repoFiles={this.state.repoFiles}
            />
          }
          title="Select File"
        />
      </MultistepDialog>
    );
  }
}

const RepositoryExplorerPanel = (props: any) => {
  const { userRepos, username, repoName, setRepoName, setRepoFiles } = props;

  React.useEffect(() => {
    setRepoFiles(username, repoName);
  }, [username, repoName, setRepoFiles]);

  return (
    <div className={classNames(Classes.DIALOG_BODY, 'repo-step')}>
      <p>Repo List: </p>
      <RadioGroup onChange={setRepoName} selectedValue={repoName}>
        {userRepos.map((repo: any) => (
          <Radio label={repo.name} key={repo.id} value={repo.name} />
        ))}
      </RadioGroup>
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
