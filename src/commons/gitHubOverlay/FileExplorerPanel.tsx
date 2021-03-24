import { Classes, ITreeNode, Tree } from '@blueprintjs/core';
import classNames from 'classnames';
import React, { Component } from 'react';

import { GitHubFileNodeData } from './GitHubFileNodeData';

export interface IFileExplorerPanelProps {
  repoFiles: ITreeNode<GitHubFileNodeData>[];
  setFilePath: any;
  getChildNodes: (thisFile: any) => Promise<ITreeNode<GitHubFileNodeData>[]>;
}

export interface IFileExplorerPanelState {
  repoFiles: ITreeNode<GitHubFileNodeData>[];
}

export class FileExplorerPanel extends Component<IFileExplorerPanelProps, IFileExplorerPanelState> {
  constructor(props: IFileExplorerPanelProps) {
    super(props);
    this.handleNodeClick = this.handleNodeClick.bind(this);
    this.handleNodeCollapse = this.handleNodeCollapse.bind(this);
    this.handleNodeExpand = this.handleNodeExpand.bind(this);
    this.forEachNode = this.forEachNode.bind(this);
  }

  public state: IFileExplorerPanelState = {
    repoFiles: this.props.repoFiles
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

    this.props.setFilePath(newFilePath);
    this.setState(this.state);
  }

  private handleNodeCollapse(treeNode: ITreeNode<GitHubFileNodeData>) {
    treeNode.isExpanded = false;
    this.setState(this.state);
  }

  private async handleNodeExpand(treeNode: ITreeNode<GitHubFileNodeData>) {
    treeNode.isExpanded = true;

    if (treeNode.nodeData !== undefined && !treeNode.nodeData.childrenRetrieved) {
      treeNode.childNodes = await this.props.getChildNodes(treeNode.nodeData.filePath);
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
    return (
      <div className={classNames(Classes.DIALOG_BODY, 'file-step')}>
        <Tree
          contents={this.state.repoFiles}
          onNodeClick={this.handleNodeClick}
          onNodeCollapse={this.handleNodeCollapse}
          onNodeExpand={this.handleNodeExpand}
          className={Classes.ELEVATION_0}
        />
      </div>
    );
  }
}
