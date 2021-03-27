import { AnchorButton, Button, Classes, Dialog } from '@blueprintjs/core';
import { Octokit } from '@octokit/rest';

import * as GitHubUtils from '../../features/github/GitHubUtils';
import { store } from '../../pages/createStore';
import { actions } from '../utils/ActionsHelper';
import { showSuccessMessage, showWarningMessage } from '../utils/NotificationsHelper';

export const ConfirmOpen = (props: any) => {
  const { isOpen, closeConfirmDialog, pickerType, handleEditorValueChange } = props;

  return (
    <Dialog isOpen={isOpen} usePortal={false}>
      {pickerType === 'Open' && (
        <div className={Classes.DIALOG_BODY}>
          <p>Warning: opening this file will overwrite the text data in the editor.</p>
          <p>Please click 'Confirm' to continue, or 'Cancel' to go back.</p>
        </div>
      )}
      {pickerType === 'Save' && (
        <div className={Classes.DIALOG_BODY}>
          <p>Warning: You are saving over an existing file in the repository.</p>
          <p>Please click 'Confirm' to continue, or 'Cancel' to go back.</p>
        </div>
      )}
      {pickerType === 'SaveNew' && (
        <div className={Classes.DIALOG_BODY}>
          <p>Warning: You are create a new file in the repository.</p>
          <p>Please click 'Confirm' to continue, or 'Cancel' to go back.</p>
        </div>
      )}
      <div className={Classes.DIALOG_FOOTER}>
        <Button onClick={() => cancelHandler(closeConfirmDialog)}>Cancel</Button>
        <AnchorButton
          intent={'primary'}
          onClick={() =>
            confirmHandler(pickerType, handleEditorValueChange, closeConfirmDialog)
          }
        >
          Confirm
        </AnchorButton>
      </div>
    </Dialog>
  );
};

function confirmHandler(
  pickerType: string,
  handleEditorValueChange: any,
  closeConfirmDialog: any
) {
  if (pickerType === 'Open') {
    confirmOpenFile(handleEditorValueChange);
  }

  if (pickerType === 'Save') {
    confirmOverwriteFile();
  }

  if (pickerType === 'SaveNew') {
    confirmSaveNewFile();
  }

  closeConfirmDialog();
}

function cancelHandler(closeConfirmDialog: any) {
  closeConfirmDialog();
}

async function confirmOverwriteFile() {
  const octokit = GitHubUtils.getGitHubOctokitInstance();

  if (octokit === undefined) {
    return;
  }

  const content = store.getState().workspaces.playground.editorValue || '';
  const contentEncoded = Buffer.from(content, 'utf8').toString('base64');

  const githubLoginID = GitHubUtils.getGitHubLoginID();
  const githubName = GitHubUtils.getGitHubName();
  const githubEmail = GitHubUtils.getGitHubEmail();
  const repoName = store.getState().session.githubRepositoryName;
  const filePath = store.getState().session.githubRepositoryFilepath;
  const commitMessage = store.getState().session.githubCommitMessage;

  try {
    const results = await octokit.repos.getContent({
      owner: githubLoginID,
      repo: repoName,
      path: filePath
    });

    const files = results.data;

    // Cannot save over folder
    if (Array.isArray(files)) {
      return;
    }

    const sha = files.sha;

    await octokit.repos.createOrUpdateFileContents({
      owner: githubLoginID,
      repo: repoName,
      path: filePath,
      message: commitMessage,
      content: contentEncoded,
      sha: sha,
      committer: { name: githubName, email: githubEmail },
      author: { name: githubName, email: githubEmail }
    });

    showSuccessMessage('Successfully saved file!', 1000);
    store.dispatch(actions.setPickerDialog(false));
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to save the file.', 1000);
  }
}

async function confirmOpenFile(handleEditorValueChange: any) {
  const octokit = GitHubUtils.getGitHubOctokitInstance() as Octokit;
  const githubLoginID = GitHubUtils.getGitHubLoginID();
  const repoName = store.getState().session.githubRepositoryName;
  const filePath = store.getState().session.githubRepositoryFilepath;

  if (octokit === undefined) return;

  const results = await octokit.repos.getContent({
    owner: githubLoginID,
    repo: repoName,
    path: filePath
  });

  const { content } = { ...results.data };

  if (content) {
    handleEditorValueChange(Buffer.from(content, 'base64').toString());
    showSuccessMessage('Successfully loaded file!', 1000);
    store.dispatch(actions.setPickerDialog(false));
  }
}

async function confirmSaveNewFile() {

  const octokit = GitHubUtils.getGitHubOctokitInstance();

  if (octokit === undefined) {
    return;
  }

  const content = store.getState().workspaces.playground.editorValue || '';
  const contentEncoded = Buffer.from(content, 'utf8').toString('base64');

  const githubLoginID = GitHubUtils.getGitHubLoginID();
  const githubName = GitHubUtils.getGitHubName();
  const githubEmail = GitHubUtils.getGitHubEmail();
  const repoName = store.getState().session.githubRepositoryName;
  const filePath = store.getState().session.githubRepositoryFilepath;
  const commitMessage = store.getState().session.githubCommitMessage;

  await octokit.repos.createOrUpdateFileContents({
    owner: githubLoginID,
    repo: repoName,
    path: filePath,
    message: commitMessage,
    content: contentEncoded,
    committer: { name: githubName, email: githubEmail },
    author: { name: githubName, email: githubEmail }
  });

  showSuccessMessage('Successfully created file!', 1000);
  store.dispatch(actions.setPickerDialog(false));
}
