import { Octokit } from '@octokit/rest';
import {
  GetResponseDataTypeFromEndpointMethod,
  GetResponseTypeFromEndpointMethod
} from '@octokit/types';

import { actions } from '../../commons/utils/ActionsHelper';
import { showSimpleConfirmDialog } from '../../commons/utils/DialogHelper';
import {
  showSuccessMessage,
  showWarningMessage
} from '../../commons/utils/notifications/NotificationsHelper';
import { store } from '../../pages/createStore';

/**
 * Exchanges the Access Code with the back-end to receive an Auth-Token
 *
 * @param {string} backendLink The address where the back-end microservice is deployed
 * @param {string} messageBody The message body. Must be URL-encoded
 * @return {Promise<Response>} A promise for a HTML response with an 'auth_token' field
 */
export async function exchangeAccessCode(
  backendLink: string,
  messageBody: string
): Promise<Response> {
  return await fetch(backendLink, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: messageBody
  });
}

/**
 * Returns the Octokit instance saved in session state.
 *
 * This function allows for mocking Octokit behaviour in tests.
 */
export function getGitHubOctokitInstance(): any {
  const octokitObject = store.getState().session.githubOctokitObject;
  if (octokitObject === undefined) {
    return undefined;
  } else {
    return octokitObject.octokit;
  }
}

export async function checkIfFileCanBeOpened(
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  filePath: string
) {
  if (octokit === undefined) {
    showWarningMessage('Please log in and try again', 2000);
    return false;
  }

  if (filePath === '') {
    showWarningMessage('Please select a file!', 2000);
    return false;
  }

  type GetContentData = GetResponseDataTypeFromEndpointMethod<typeof octokit.repos.getContent>;
  let files: GetContentData;

  try {
    type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
    const results: GetContentResponse = await octokit.repos.getContent({
      owner: repoOwner,
      repo: repoName,
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

/**
 * Returns an object containing 2 properties: 'canBeSaved' and 'saveType'.
 * 'canBeSaved' is a boolean that represents whether we should proceed with the save.
 * If the file can be saved, then 'saveType' is either 'Create' or 'Overwrite'.
 *
 * @param octokit The Octokit instance for the authenticated user
 * @param repoOwner The owner of the repository where the file is to be saved
 * @param repoName The name of the repository
 * @param filePath The filepath where the file will be saved to
 */
export async function checkIfFileCanBeSavedAndGetSaveType(
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  filePath: string
) {
  let saveType = '';

  if (filePath === '') {
    showWarningMessage('No file name given.', 2000);
    return { canBeSaved: false, saveType: saveType };
  }

  if (octokit === undefined) {
    showWarningMessage('Please log in and try again', 2000);
    return { canBeSaved: false, saveType: saveType };
  }

  let files;

  try {
    type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
    const results: GetContentResponse = await octokit.repos.getContent({
      owner: repoOwner,
      repo: repoName,
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
      return { canBeSaved: false, saveType: saveType };
    }
    saveType = 'Create';
  }

  if (Array.isArray(files)) {
    showWarningMessage("Can't save over a folder!", 2000);
    return { canBeSaved: false, saveType: saveType };
  }

  return { canBeSaved: true, saveType: saveType };
}

export async function checkIfUserAgreesToOverwriteEditorData() {
  return await showSimpleConfirmDialog({
    contents: (
      <div>
        <p>Warning: opening this file will overwrite the text data in the editor.</p>
        <p>Please click 'Confirm' to continue, or 'Cancel' to go back.</p>
      </div>
    ),
    negativeLabel: 'Cancel',
    positiveIntent: 'primary',
    positiveLabel: 'Confirm'
  });
}

export async function checkIfUserAgreesToPerformOverwritingSave() {
  return await showSimpleConfirmDialog({
    contents: (
      <div>
        <p>Warning: You are saving over an existing file in the repository.</p>
        <p>Please click 'Confirm' to continue, or 'Cancel' to go back.</p>
      </div>
    ),
    negativeLabel: 'Cancel',
    positiveIntent: 'primary',
    positiveLabel: 'Confirm'
  });
}

export async function openFileInEditor(
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  filePath: string
) {
  if (octokit === undefined) return;

  type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
  const results: GetContentResponse = await octokit.repos.getContent({
    owner: repoOwner,
    repo: repoName,
    path: filePath
  });

  const content = (results.data as any).content;

  if (content) {
    const newEditorValue = Buffer.from(content, 'base64').toString();
    const activeEditorTabIndex = store.getState().workspaces.playground.activeEditorTabIndex;
    if (activeEditorTabIndex === null) {
      throw new Error('No active editor tab found.');
    }
    store.dispatch(actions.updateEditorValue('playground', activeEditorTabIndex, newEditorValue));
    store.dispatch(actions.playgroundUpdateGitHubSaveInfo(repoName, filePath, new Date()));
    showSuccessMessage('Successfully loaded file!', 1000);
  }
}

export async function performOverwritingSave(
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  filePath: string,
  githubName: string | null,
  githubEmail: string | null,
  commitMessage: string,
  content: string
) {
  if (octokit === undefined) return;

  githubEmail = githubEmail || 'No public email provided';
  githubName = githubName || 'Source Academy User';
  commitMessage = commitMessage || 'Changes made from Source Academy';
  content = content || '';

  const contentEncoded = Buffer.from(content, 'utf8').toString('base64');

  try {
    type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
    const results: GetContentResponse = await octokit.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: filePath
    });

    type GetContentData = GetResponseDataTypeFromEndpointMethod<typeof octokit.repos.getContent>;
    const files: GetContentData = results.data;

    // Cannot save over folder
    if (Array.isArray(files)) {
      return;
    }

    const sha = files.sha;

    await octokit.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo: repoName,
      path: filePath,
      message: commitMessage,
      content: contentEncoded,
      sha: sha,
      committer: { name: githubName, email: githubEmail },
      author: { name: githubName, email: githubEmail }
    });
    store.dispatch(actions.playgroundUpdateGitHubSaveInfo(repoName, filePath, new Date()));
    showSuccessMessage('Successfully saved file!', 1000);
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to save the file.', 1000);
  }
}

export async function performCreatingSave(
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  filePath: string,
  githubName: string | null,
  githubEmail: string | null,
  commitMessage: string,
  content: string
) {
  if (octokit === undefined) return;

  githubEmail = githubEmail || 'No public email provided';
  githubName = githubName || 'Source Academy User';
  commitMessage = commitMessage || 'Changes made from Source Academy';
  content = content || '';

  const contentEncoded = Buffer.from(content, 'utf8').toString('base64');

  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo: repoName,
      path: filePath,
      message: commitMessage,
      content: contentEncoded,
      committer: { name: githubName, email: githubEmail },
      author: { name: githubName, email: githubEmail }
    });
    store.dispatch(actions.playgroundUpdateGitHubSaveInfo(repoName, filePath, new Date()));
    showSuccessMessage('Successfully created file!', 1000);
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to save the file.', 1000);
  }
}

export async function performFolderDeletion(
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  filePath: string,
  githubName: string | null,
  githubEmail: string | null,
  commitMessage: string
) {
  if (octokit === undefined) return;

  githubEmail = githubEmail || 'No public email provided';
  githubName = githubName || 'Source Academy User';
  commitMessage = commitMessage || 'Changes made from Source Academy';

  try {
    const results = await octokit.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: filePath
    });

    const files = results.data;

    // This function must apply deletion to an entire folder
    if (!Array.isArray(files)) {
      showWarningMessage('Something went wrong when trying to delete the folder.', 1000);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      await octokit.repos.deleteFile({
        owner: repoOwner,
        repo: repoName,
        path: file.path,
        message: commitMessage,
        sha: file.sha
      });
    }

    showSuccessMessage('Successfully deleted folder!', 1000);
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to delete the folder.', 1000);
  }
}
