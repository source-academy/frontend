import { Classes, InputGroup, ITreeNode, Tree } from '@blueprintjs/core';
import classNames from 'classnames';
import React, { Component } from 'react';

import { GitHubFileNodeData } from './GitHubFileNodeData';
import { GitHubTreeNodeCreator } from './GitHubTreeNodeCreator';

type FileExplorerPanelProps = {
  repoFiles: ITreeNode<GitHubFileNodeData>[];
  repoName: string;
  pickerType: string;
  filePath: string;
  setFilePath: any;
  setCommitMessage: any;
};

type FileExplorerPanelState = {
  repoFiles: ITreeNode<GitHubFileNodeData>[];
  commitMessage: string;
};

export class FileExplorerPanel extends Component<FileExplorerPanelProps, FileExplorerPanelState> {
  constructor(props: FileExplorerPanelProps) {
    super(props);
    this.handleNodeClick = this.handleNodeClick.bind(this);
    this.handleNodeCollapse = this.handleNodeCollapse.bind(this);
    this.handleNodeExpand = this.handleNodeExpand.bind(this);
    this.forEachNode = this.forEachNode.bind(this);
    this.handleFileNameChange = this.handleFileNameChange.bind(this);
    this.handleCommitMessageChange = this.handleCommitMessageChange.bind(this);
    this.handleClickFileNameBox = this.handleClickFileNameBox.bind(this);
  }

  public state: FileExplorerPanelState = {
    repoFiles: this.props.repoFiles,
    commitMessage: ''
  };

  private handleNodeClick(
    treeNode: ITreeNode<GitHubFileNodeData>,
    _nodePath: number[],
    e: React.MouseEvent<HTMLElement>
  ) {
    const originallySelected = treeNode.isSelected;

    if (!e.shiftKey) {
      this.forEachNode(this.state.repoFiles, n => (n.isSelected = false));
    }

    treeNode.isSelected = originallySelected == null ? true : !originallySelected;
    const newFilePath = treeNode.nodeData !== undefined ? treeNode.nodeData.filePath : '';
    if (treeNode.isSelected) {
      this.props.setFilePath(newFilePath);
    } else {
      this.props.setFilePath('');
    }
    this.setState(this.state);
  }

  private handleNodeCollapse(treeNode: ITreeNode<GitHubFileNodeData>) {
    treeNode.isExpanded = false;
    this.setState(this.state);
  }

  private async handleNodeExpand(treeNode: ITreeNode<GitHubFileNodeData>) {
    treeNode.isExpanded = true;

    if (treeNode.nodeData !== undefined && !treeNode.nodeData.childrenRetrieved) {
      treeNode.childNodes = await GitHubTreeNodeCreator.getChildNodes(
        this.props.repoName,
        treeNode.nodeData.filePath
      );

      treeNode.nodeData.childrenRetrieved = true;
    }

    this.setState(this.state);
  }

  private forEachNode(
    treeNodes: ITreeNode<GitHubFileNodeData>[],
    callback: (node: ITreeNode<GitHubFileNodeData>) => void
  ) {
    if (treeNodes == null) {
      return;
    }

    for (const node of treeNodes) {
      callback(node);
      if (node.childNodes !== undefined) {
        this.forEachNode(node.childNodes, callback);
      }
    }
  }

  render() {
    const divStyle = {
      overflowY: 'auto',
      maxHeight: '440px'
    } as React.CSSProperties;

    return (
      <div className={classNames(Classes.DIALOG_BODY, 'file-step')} style={divStyle}>
        <Tree
          contents={this.state.repoFiles}
          onNodeClick={this.handleNodeClick}
          onNodeCollapse={this.handleNodeCollapse}
          onNodeExpand={this.handleNodeExpand}
          className={Classes.ELEVATION_0}
        />
        {this.props.pickerType === 'Save' && (
          <div>
            <InputGroup
              id="FileNameTextBox"
              onChange={this.handleFileNameChange}
              onClick={this.handleClickFileNameBox}
              placeholder={'Enter File Name'}
              value={this.props.filePath}
            />
            <InputGroup
              onChange={this.handleCommitMessageChange}
              placeholder={'Enter Commit Message'}
              value={this.state.commitMessage}
            />
          </div>
        )}
      </div>
    );
  }

  handleFileNameChange(e: any) {
    this.props.setFilePath(e.target.value);
  }

  handleCommitMessageChange(e: any) {
    this.setState({ commitMessage: e.target.value });
    this.props.setCommitMessage(e.target.value);
  }

  handleClickFileNameBox(e: any) {
    (document.getElementById('FileNameTextBox') as any).value = '.js';
  }
}
