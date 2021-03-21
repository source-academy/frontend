import { Classes, ITreeNode, Tree } from "@blueprintjs/core";
import classNames from "classnames";
import React, { Component } from "react";

export interface IFileExplorerPanelProps {
  repoFiles: ITreeNode<{}>[];
}

export interface IFileExplorerPanelState {
  repoFiles: ITreeNode<{}>[];
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

  private handleNodeClick = (nodeData: ITreeNode, _nodePath: number[], e: React.MouseEvent<HTMLElement>) => {
    const originallySelected = nodeData.isSelected;
    if (!e.shiftKey) {
        this.forEachNode(this.state.repoFiles, n => (n.isSelected = false));
    }
    nodeData.isSelected = originallySelected == null ? true : !originallySelected;
    this.setState(this.state);
  };

  private handleNodeCollapse = (nodeData: ITreeNode) => {
      nodeData.isExpanded = false;
      this.setState(this.state);
  };

  private handleNodeExpand = (nodeData: ITreeNode) => {
      nodeData.isExpanded = true;
      this.setState(this.state);
  };

  private forEachNode(nodes: ITreeNode[], callback: (node: ITreeNode) => void) {
      if (nodes == null) {
          return;
      }

      for (const node of nodes) {
          callback(node);
          if (node.childNodes !== undefined) {
            this.forEachNode(node.childNodes, callback);
          }

      }
  }
  
  render() {
    return (
      <div className={classNames(Classes.DIALOG_BODY, 'file-step')}>
        <p>File List: </p>
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