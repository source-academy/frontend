import { Classes, DialogStep, MultistepDialog } from '@blueprintjs/core';
// import { Octokit } from '@octokit/rest';
import classNames from 'classnames';
import * as React from 'react';

export type GitHubOverlayProps = DispatchProps & StateProps & OwnProps;

export type DispatchProps = {};
// handleRepositoryFetch: (repositoryName: string) => void;
// handleFileFetch: (filePath: string) => void;

export type OwnProps = {};

export type StateProps = {};

export interface GitHubOverlayState {
  value?: string;
}

/*
const octokit = new Octokit({
  auth: '5475faa033272e69c3a2e2013938c04d074bf4a0',
  userAgent: "chekjun",
  baseUrl: 'https://api.github.com',
  log: {
    debug: () => {},
    info: () => {},
    warn: console.warn,
    error: console.error
  },
  request: {
    agent: undefined,
    fetch: undefined,
    timeout: 0
  }
});
*/

class GitHubOverlay extends React.Component<
  GitHubOverlayProps,
  {
    showOverlay: boolean;
    value: string;
  }
> {
  public constructor(props: GitHubOverlayProps) {
    super(props);
    this.state = {
      showOverlay: false,
      value: ''
    };
  }

  handleStringChange(handler: (value: string) => void) {
    return (event: React.FormEvent<HTMLElement>) =>
      handler((event.target as HTMLInputElement).value);
  }

  handleSelectionChange = async () => {
    return this.handleStringChange(value => this.setState({ value }));
  };

  public render() {
    const overlay = (
      <MultistepDialog className="GitHubPicker" isOpen={this.state.showOverlay}>
        <DialogStep
          id="Repository"
          panel={
            <RepositoryExplorerPanel
              onChange={this.handleSelectionChange}
              selectedValue={this.state.value}
            />
          }
          title="Select Repository"
        />
        <DialogStep
          id="Files"
          panel={<FileExplorerPanel selectedValue={this.state.value} />}
          title="Select File"
        />
      </MultistepDialog>
    );

    return <div>{overlay}</div>;
  }
}

export interface IRepositoryExplorerPanelProps {
  selectedValue: string;
  onChange: (event: React.FormEvent<HTMLInputElement>) => void;
}

const RepositoryExplorerPanel: React.FunctionComponent<IRepositoryExplorerPanelProps> = props => (
  <div className={classNames(Classes.DIALOG_BODY, 'docs-multistep-dialog-example-step')}>
    <p>Repo List: </p>
  </div>
);

export interface IFileExplorerPanelProps {
  selectedValue: string;
}

const FileExplorerPanel: React.FunctionComponent<IFileExplorerPanelProps> = props => {
  return (
    <div className={classNames(Classes.DIALOG_BODY, 'docs-multistep-dialog-example-step')}>
      <p>Browsing {props.selectedValue}.</p>
      <p>File List: </p>
    </div>
  );
};

export default GitHubOverlay;
