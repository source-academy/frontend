import {
  AnchorButton,
  Button,
  Classes,
  Dialog,
  InputGroup,
  Intent,
  Tree,
  TreeNodeInfo
} from '@blueprintjs/core';
import { Octokit } from '@octokit/rest';
import { GetResponseTypeFromEndpointMethod } from '@octokit/types';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';

import {
  checkFolderLocationIsValid,
  checkIfFileCanBeOpened,
  checkIfFileCanBeSavedAndGetSaveType,
  checkIfUserAgreesToOverwriteEditorData,
  checkIfUserAgreesToPerformOverwritingSave,
  checkIsFile,
  openFileInEditor,
  openFolderInFolderMode,
  performCreatingSave,
  performMultipleCreatingSave,
  performOverwritingSaveForSaveAs
} from '../../features/github/GitHubUtils';
import { getPersistenceFile } from '../fileSystem/FileSystemUtils';
import { GitHubFileNodeData } from './GitHubFileNodeData';
import { GitHubTreeNodeCreator } from './GitHubTreeNodeCreator';

export type FileExplorerDialogProps = {
  repoName: string;
  pickerType: string;
  octokit: Octokit;
  editorContent: string;
  onSubmit: (submitContent: string) => void;
};

const FileExplorerDialog: React.FC<FileExplorerDialogProps> = props => {
  const [repoFiles, setRepoFiles] = useState<TreeNodeInfo<GitHubFileNodeData>[]>([]);
  const [filePath, setFilePath] = useState('');
  const [commitMessage, setCommitMessage] = useState('');

  useEffect(() => {
    setFirstLayerRepoFiles(props.repoName, setRepoFiles);
  }, [props.repoName]);

  return (
    <Dialog className="githubDialog" isOpen={true} onClose={handleClose}>
      <div className={classNames('githubDialogHeader', Classes.DIALOG_HEADER)}>
        <h3>Select a File/Folder</h3>
      </div>
      <div className={Classes.DIALOG_BODY}>
        <Tree
          contents={repoFiles}
          onNodeClick={handleNodeClick}
          onNodeCollapse={handleNodeCollapse}
          onNodeExpand={handleNodeExpand}
          className={classNames('FileTree', Classes.ELEVATION_0)}
        />
        {props.pickerType === 'Save' && (
          <div>
            <InputGroup
              id="FileNameTextBox"
              onChange={handleFileNameChange}
              onClick={handleClickFileNameBox}
              placeholder={'Enter File Name'}
              value={filePath}
            />
            <InputGroup
              onChange={handleCommitMessageChange}
              placeholder={'Enter Commit Message'}
              value={commitMessage}
            />
          </div>
        )}
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={handleClose}>Close</Button>
          <AnchorButton onClick={handleSubmit} intent={Intent.PRIMARY} text={props.pickerType} />
        </div>
      </div>
    </Dialog>
  );

  async function setFirstLayerRepoFiles(repoName: string, setRepoFiles: any) {
    try {
      const initialRepoFiles = await GitHubTreeNodeCreator.getFirstLayerRepoFileNodes(repoName);
      setRepoFiles(initialRepoFiles);
    } catch (err) {
      console.error(err);
    }
  }

  function handleClose() {
    props.onSubmit('');
  }

  async function handleSubmit() {
    type GetAuthenticatedResponse = GetResponseTypeFromEndpointMethod<
      typeof props.octokit.users.getAuthenticated
    >;
    const authUser: GetAuthenticatedResponse = await props.octokit.users.getAuthenticated();
    const githubLoginID = authUser.data.login;
    const githubName = authUser.data.name;
    const githubEmail = authUser.data.email;

    if (props.pickerType === 'Open') {
      if (await checkIfFileCanBeOpened(props.octokit, githubLoginID, props.repoName, filePath)) {
        if (await checkIfUserAgreesToOverwriteEditorData()) {
          if (await checkIsFile(props.octokit, githubLoginID, props.repoName, filePath)) {
            openFileInEditor(props.octokit, githubLoginID, props.repoName, filePath);
          } else {
            openFolderInFolderMode(props.octokit, githubLoginID, props.repoName, filePath);
          }
        }
      }
    }

    if (props.pickerType === 'Save All') {
      if (await checkIsFile(props.octokit, githubLoginID, props.repoName, filePath)) {
      } else {
        if (
          await checkFolderLocationIsValid(props.octokit, githubLoginID, props.repoName, filePath)
        ) {
          performMultipleCreatingSave(
            props.octokit,
            githubLoginID,
            props.repoName,
            filePath,
            githubName,
            githubEmail,
            ''
          );
        }
      }
    }

    if (props.pickerType === 'Save') {
      const { canBeSaved, saveType } = await checkIfFileCanBeSavedAndGetSaveType(
        props.octokit,
        githubLoginID,
        props.repoName,
        filePath
      );

      if (canBeSaved) {
        const persistenceFile = getPersistenceFile('');
        if (persistenceFile === undefined) {
          throw new Error('persistence file not found for this filepath: ' + '');
        }
        const parentFolderPath = persistenceFile.parentFolderPath;
        if (parentFolderPath === undefined) {
          throw new Error(
            'repository name or parentfolderpath not found for this persistencefile: ' +
              persistenceFile
          );
        }
        if (saveType === 'Overwrite' && (await checkIfUserAgreesToPerformOverwritingSave())) {
          performOverwritingSaveForSaveAs(
            props.octokit,
            githubLoginID,
            props.repoName,
            filePath,
            githubName,
            githubEmail,
            commitMessage,
            props.editorContent,
            parentFolderPath
          );
        }

        if (saveType === 'Create') {
          performCreatingSave(
            props.octokit,
            githubLoginID,
            props.repoName,
            filePath.slice(parentFolderPath.length),
            githubName,
            githubEmail,
            commitMessage,
            props.editorContent,
            parentFolderPath
          );
        }
      }
    }
    props.onSubmit('');
  }

  async function handleNodeClick(
    treeNode: TreeNodeInfo<GitHubFileNodeData>,
    _nodePath: number[],
    e: React.MouseEvent<HTMLElement>
  ) {
    const originallySelected = treeNode.isSelected;

    const allNodesCallback = (node: TreeNodeInfo<GitHubFileNodeData>) => (node.isSelected = false);
    const specificNodeCallback = (node: TreeNodeInfo<GitHubFileNodeData>) => {
      // if originally selected is null, set to true
      // else, toggle the selection
      node.isSelected = originallySelected === null ? true : !originallySelected;
      const newFilePath =
        node.nodeData !== undefined && node.isSelected ? node.nodeData.filePath : '';
      setFilePath(newFilePath);
    };

    const newRepoFiles = await cloneWithCallbacks(
      repoFiles,
      treeNode,
      allNodesCallback,
      specificNodeCallback
    );

    if (newRepoFiles !== null) {
      setRepoFiles(newRepoFiles);
    }
  }

  async function handleNodeCollapse(treeNode: TreeNodeInfo<GitHubFileNodeData>) {
    const newRepoFiles = await cloneWithCallbacks(
      repoFiles,
      treeNode,
      (node: TreeNodeInfo<GitHubFileNodeData>) => {},
      (node: TreeNodeInfo<GitHubFileNodeData>) => (node.isExpanded = false)
    );

    if (newRepoFiles !== null) {
      setRepoFiles(newRepoFiles);
    }
  }

  async function handleNodeExpand(treeNode: TreeNodeInfo<GitHubFileNodeData>) {
    const newRepoFiles = await cloneWithCallbacks(
      repoFiles,
      treeNode,
      (node: TreeNodeInfo<GitHubFileNodeData>) => {},
      async (node: TreeNodeInfo<GitHubFileNodeData>) => {
        node.isExpanded = true;

        if (node.nodeData !== undefined && !node.nodeData.childrenRetrieved) {
          node.childNodes = await GitHubTreeNodeCreator.getChildNodes(
            props.repoName,
            node.nodeData.filePath
          );
          node.nodeData.childrenRetrieved = true;
        }
      }
    );

    if (newRepoFiles !== null) {
      setRepoFiles(newRepoFiles);
    }
  }

  async function cloneWithCallbacks(
    treeNodes: TreeNodeInfo<GitHubFileNodeData>[],
    treeNodeToEdit: TreeNodeInfo<GitHubFileNodeData>,
    allNodesCallback: (node: TreeNodeInfo<GitHubFileNodeData>) => void,
    specificNodeCallback: (node: TreeNodeInfo<GitHubFileNodeData>) => void
  ) {
    if (treeNodes === null) {
      return null;
    }

    const newTreeNodes = [];

    for (let i = 0; i < treeNodes.length; i++) {
      const node = treeNodes[i];
      const clonedNode = Object.assign({}, node);
      await allNodesCallback(clonedNode);

      if (treeNodeToEdit.id === node.id) {
        await specificNodeCallback(clonedNode);
      }

      if (clonedNode.childNodes !== undefined) {
        const newChildNodes = await cloneWithCallbacks(
          clonedNode.childNodes,
          treeNodeToEdit,
          allNodesCallback,
          specificNodeCallback
        );

        if (newChildNodes !== null) {
          clonedNode.childNodes = newChildNodes;
        }
      }

      newTreeNodes.push(clonedNode);
    }

    return newTreeNodes;
  }

  function handleFileNameChange(e: any) {
    setFilePath(e.target.value);
  }

  function handleCommitMessageChange(e: any) {
    setCommitMessage(e.target.value);
  }

  function handleClickFileNameBox(e: any) {
    if (filePath === '') {
      setFilePath('.js');
    }
  }
};

export default FileExplorerDialog;
