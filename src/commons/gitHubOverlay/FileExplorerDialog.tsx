import {
  AnchorButton,
  Button,
  Classes,
  Dialog,
  InputGroup,
  Intent,
  ITreeNode,
  Tree
} from '@blueprintjs/core';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { put } from 'redux-saga/effects';
import { store } from 'src/pages/createStore';

import { actions } from '../utils/ActionsHelper';
import { showSimpleConfirmDialog } from '../utils/DialogHelper';
import { showSuccessMessage, showWarningMessage } from '../utils/NotificationsHelper';
import { GitHubFileNodeData } from './GitHubFileNodeData';
import { GitHubTreeNodeCreator } from './GitHubTreeNodeCreator';

const FileExplorerDialog: React.FC<any> = props => {
  const [refresh, setRefresh] = useState(0);

  const [repoFiles, setRepoFiles] = useState([] as ITreeNode<GitHubFileNodeData>[]);
  const [filePath, setFilePath] = useState('');
  const [commitMessage, setCommitMessage] = useState('');

  let githubLoginID: string;
  let githubName: string;
  let githubEmail: string;
  let saveType = 'Overwrite';

  getUserDetails();

  useEffect(() => {
    setFirstLayerRepoFiles(props.repoName, setRepoFiles); // this is an async call
  }, [props.repoName]);

  return (
    <Dialog
      className="FileDialog"
      isCloseButtonShown={true}
      isOpen={true}
      onClose={handleClose}
      title={'Select a File'}
    >
      <div className={Classes.DIALOG_BODY}>
        <Tree
          contents={repoFiles}
          onNodeClick={handleNodeClick}
          onNodeCollapse={handleNodeCollapse}
          onNodeExpand={handleNodeExpand}
          className={classNames(Classes.ELEVATION_0, 'FileTree')}
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

  async function getUserDetails() {
    const AuthUser = await props.octokit.users.getAuthenticated();
    githubLoginID = AuthUser.data.login;
    githubName = AuthUser.data.name || 'Source Academy User';
    githubEmail = AuthUser.data.email || 'no public email provided';
  }

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
    if (props.pickerType === 'Open') {
      if (await checkIfFileCanBeOpened()) {
        if (
          await showSimpleConfirmDialog({
            contents: (
              <div className={Classes.DIALOG_BODY}>
                <p>Warning: opening this file will overwrite the text data in the editor.</p>
                <p>Please click 'Confirm' to continue, or 'Cancel' to go back.</p>
              </div>
            ),
            negativeLabel: 'Cancel',
            positiveIntent: 'primary',
            positiveLabel: 'Confirm'
          })
        ) {
          openFile();
        }
      }
    }

    if (props.pickerType === 'Save') {
      if (await checkIfFileCanBeSaved()) {
        if (
          saveType === 'Overwrite' &&
          (await showSimpleConfirmDialog({
            contents: (
              <div className={Classes.DIALOG_BODY}>
                <p>Warning: You are saving over an existing file in the repository.</p>
                <p>Please click 'Confirm' to continue, or 'Cancel' to go back.</p>
              </div>
            ),
            negativeLabel: 'Cancel',
            positiveIntent: 'primary',
            positiveLabel: 'Confirm'
          }))
        ) {
          overwriteSaveFile();
        } else if (
          saveType === 'Create' &&
          (await showSimpleConfirmDialog({
            contents: (
              <div className={Classes.DIALOG_BODY}>
                <p>Warning: You are creating a new file in the repository.</p>
                <p>Please click 'Confirm' to continue, or 'Cancel' to go back.</p>
              </div>
            ),
            negativeLabel: 'Cancel',
            positiveIntent: 'primary',
            positiveLabel: 'Confirm'
          }))
        ) {
          createSaveFile();
        }
      }
    }
  }

  async function checkIfFileCanBeOpened() {
    if (props.octokit === undefined) {
      showWarningMessage('Please log in and try again', 2000);
      return false;
    }

    if (filePath === '') {
      showWarningMessage('Please select a file!', 2000);
      return false;
    }

    let files;

    try {
      const results = await props.octokit.repos.getContent({
        owner: githubLoginID,
        repo: props.repoName,
        path: filePath
      });

      files = results.data;
    } catch (err) {
      showWarningMessage('Connection denied or file does not exist.', 2000);
      console.error(err);
      return false;
    }

    if (Array.isArray(files)) {
      showWarningMessage("Can't open folder as a file!", 2000);
      return false;
    }

    return true;
  }

  async function checkIfFileCanBeSaved() {
    if (filePath === '') {
      showWarningMessage('No file name given.', 2000);
      return false;
    }

    if (props.octokit === undefined) {
      showWarningMessage('Please log in and try again', 2000);
      return false;
    }

    let files;

    try {
      const results = await props.octokit.repos.getContent({
        owner: githubLoginID,
        repo: props.repoName,
        path: filePath
      });

      files = results.data;
      saveType = 'Overwrite';
    } catch (err) {
      // 404 status means that the file could not be found.
      // In this case, the dialog should still continue as the user should be given
      // the option of creating a new file on their remote repository.
      if (err.status !== 404) {
        showWarningMessage('Connection denied or file does not exist.', 2000);
        console.error(err);
        return false;
      }
      saveType = 'Create';
    }

    if (Array.isArray(files)) {
      showWarningMessage("Can't save over a folder!", 2000);
      return false;
    }

    return true;
  }

  async function openFile() {
    if (props.octokit === undefined) return;

    const results = await props.octokit.repos.getContent({
      owner: githubLoginID,
      repo: props.repoName,
      path: filePath
    });

    const content = results.data.content;

    if (content) {
      const newEditorValue = Buffer.from(content, 'base64').toString();
      console.log(newEditorValue); // This line below ain't working.
      await put(actions.updateEditorValue(newEditorValue, 'playground'));
      showSuccessMessage('Successfully loaded file!', 1000);
    }
  }

  async function overwriteSaveFile() {
    if (props.octokit === undefined) return;

    const content = store.getState().workspaces.playground.editorValue || '';
    const contentEncoded = Buffer.from(content, 'utf8').toString('base64');

    try {
      const results = await props.octokit.repos.getContent({
        owner: githubLoginID,
        repo: props.repoName,
        path: filePath
      });

      const files = results.data;

      // Cannot save over folder
      if (Array.isArray(files)) {
        return;
      }

      const sha = files.sha;

      await props.octokit.repos.createOrUpdateFileContents({
        owner: githubLoginID,
        repo: props.repoName,
        path: filePath,
        message: commitMessage,
        content: contentEncoded,
        sha: sha,
        committer: { name: githubName, email: githubEmail },
        author: { name: githubName, email: githubEmail }
      });

      showSuccessMessage('Successfully saved file!', 1000);
    } catch (err) {
      console.error(err);
      showWarningMessage('Something went wrong when trying to save the file.', 1000);
    }
  }

  async function createSaveFile() {
    if (props.octokit === undefined) return;

    const content = store.getState().workspaces.playground.editorValue || '';
    const contentEncoded = Buffer.from(content, 'utf8').toString('base64');

    try {
      await props.octokit.repos.createOrUpdateFileContents({
        owner: githubLoginID,
        repo: props.repoName,
        path: filePath,
        message: commitMessage,
        content: contentEncoded,
        committer: { name: githubName, email: githubEmail },
        author: { name: githubName, email: githubEmail }
      });

      showSuccessMessage('Successfully created file!', 1000);
    } catch (err) {
      console.error(err);
      showWarningMessage('Something went wrong when trying to save the file.', 1000);
    }
  }

  function handleNodeClick(
    treeNode: ITreeNode<GitHubFileNodeData>,
    _nodePath: number[],
    e: React.MouseEvent<HTMLElement>
  ) {
    const originallySelected = treeNode.isSelected;

    if (!e.shiftKey) {
      forEachNode(repoFiles, n => (n.isSelected = false));
    }

    treeNode.isSelected = originallySelected == null ? true : !originallySelected;
    const newFilePath = treeNode.nodeData !== undefined ? treeNode.nodeData.filePath : '';
    if (treeNode.isSelected) {
      setFilePath(newFilePath);
    } else {
      setFilePath('');
    }
    refreshPage();
  }

  function handleNodeCollapse(treeNode: ITreeNode<GitHubFileNodeData>) {
    treeNode.isExpanded = false;
    refreshPage();
  }

  async function handleNodeExpand(treeNode: ITreeNode<GitHubFileNodeData>) {
    treeNode.isExpanded = true;

    if (treeNode.nodeData !== undefined && !treeNode.nodeData.childrenRetrieved) {
      treeNode.childNodes = await GitHubTreeNodeCreator.getChildNodes(
        props.repoName,
        treeNode.nodeData.filePath
      );
      treeNode.nodeData.childrenRetrieved = true;
    }
    refreshPage();
  }

  function forEachNode(
    treeNodes: ITreeNode<GitHubFileNodeData>[],
    callback: (node: ITreeNode<GitHubFileNodeData>) => void
  ) {
    if (treeNodes == null) {
      return;
    }

    for (const node of treeNodes) {
      callback(node);
      if (node.childNodes !== undefined) {
        forEachNode(node.childNodes, callback);
      }
    }
  }

  function handleFileNameChange(e: any) {
    setFilePath(e.target.value);
  }

  function handleCommitMessageChange(e: any) {
    setCommitMessage(e.target.value);
  }

  function handleClickFileNameBox(e: any) {
    const textbox = document.getElementById('FileNameTextBox') as any;

    if (!textbox.value) {
      textbox.value = '.js';
    }
  }

  function refreshPage() {
    setRefresh(refresh + 1);
  }
};

export default FileExplorerDialog;
