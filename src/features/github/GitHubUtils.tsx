import { Octokit } from '@octokit/rest';
import {
  GetResponseDataTypeFromEndpointMethod,
  GetResponseTypeFromEndpointMethod
} from '@octokit/types';
import { FSModule } from 'browserfs/dist/node/core/FS';

import { rmFilesInDirRecursively,writeFileRecursively } from '../../commons/fileSystem/FileSystemUtils';
import { refreshFileView } from '../../commons/fileSystemView/FileSystemViewList';
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
    return true;
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

export async function checkIsFile(
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  filePath: string
) {
  const results = await octokit.repos.getContent({
    owner: repoOwner,
    repo: repoName,
    path: filePath
  })

  const files = results.data;

  if (Array.isArray(files)) {
    console.log("folder detected");
    return false;
  }
  
  console.log("file detected");
  return true;
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
    store.dispatch(actions.addGithubSaveInfo(
      {
        repoName: repoName,
        filePath: filePath,
        lastSaved: new Date()
      }
    ))
    showSuccessMessage('Successfully loaded file!', 1000);
  }
}

export async function openFolderInFolderMode(
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  filePath: string
) {
  if (octokit === undefined) return;

  store.dispatch(actions.deleteAllGithubSaveInfo());

  //In order to get the file paths recursively, we require the tree_sha, 
  // which is obtained from the most recent commit(any commit works but the most recent)
  // is the easiest

  const requests = await octokit.request('GET /repos/{owner}/{repo}/branches/master', {
    owner: repoOwner,
    repo: repoName
  });

  const tree_sha = requests.data.commit.commit.tree.sha;
  console.log(requests);

  const results = await octokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=1', {
    owner: repoOwner,
    repo: repoName,
    tree_sha: tree_sha
  });

  const files_and_folders = results.data.tree;
  const files: any[] = [];


  //Filters out the files only since the tree returns both file and folder paths
  for (let index = 0; index < files_and_folders.length; index++) {
    if (files_and_folders[index].type === "blob") {
      files[files.length] = files_and_folders[index].path;
    }
  }

  console.log(files);

  store.dispatch(actions.setFolderMode('playground', true)); //automatically opens folder mode
  const fileSystem: FSModule | null = store.getState().fileSystem.inBrowserFileSystem;
  if (fileSystem === null) {
    console.log("no filesystem!");
    return;
  }

  // This is a helper function to asynchronously clear the current folder system, then get each
  // file and its contents one by one, then finally refresh the file system after all files
  // have been recursively created. There may be extra asyncs or promises but this is what works.
  const readFile = async (files: Array<string>) => {
    console.log(files);
    console.log(filePath);
    rmFilesInDirRecursively(fileSystem, "/playground");
    let promise = Promise.resolve();
    type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
    files.forEach((file: string) => {
      promise = promise.then(async () => {
        let results = {} as GetContentResponse;
        if (file.startsWith(filePath)) {
          console.log(repoOwner);
          console.log(repoName);
          console.log(file);
          results = await octokit.repos.getContent({
            owner: repoOwner,
            repo: repoName,
            path: file
          });
          console.log(results);
          const content = (results.data as any)?.content;
        
          if (content) {
            const fileContent = Buffer.from(content, 'base64').toString();
            console.log(file);
            writeFileRecursively(fileSystem, "/playground/" + file, fileContent);
            store.dispatch(actions.addGithubSaveInfo(
              {
                repoName: repoName,
                filePath: file,
                lastSaved: new Date()
              }
            ))
            console.log(store.getState().fileSystem.githubSaveInfoArray);
            console.log("wrote one file");
          }
        }
      })
    })
    promise.then(() => {
      store.dispatch(actions.playgroundUpdateRepoName(repoName));
      console.log("promises fulfilled"); 
      refreshFileView();
      showSuccessMessage('Successfully loaded file!', 1000);
    })
  }

  readFile(files);
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
    console.log(repoOwner);
    console.log(repoName);
    console.log(filePath);
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
    
    store.dispatch(actions.updateGithubSaveInfo(repoName, filePath, new Date()));

    //this is just so that playground is forcefully updated
    store.dispatch(actions.playgroundUpdateRepoName(repoName));
    showSuccessMessage('Successfully saved file!', 1000);
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to save the file.', 1000);
  }
}

export async function performMultipleOverwritingSave(
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  githubName: string | null,
  githubEmail: string | null,
  changes: { commitMessage: string, files: Record<string, string> }
) {
  if (octokit === undefined) return;

  githubEmail = githubEmail || 'No public email provided';
  githubName = githubName || 'Source Academy User';
  changes.commitMessage = changes.commitMessage || 'Changes made from Source Academy';

  for (const filePath of Object.keys(changes.files)) {
    console.log(filePath);
    changes.files[filePath] = Buffer.from(changes.files[filePath], 'utf8').toString('base64');
    try {
      type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
      console.log(repoOwner);
      console.log(repoName);
      console.log(filePath);
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

      store.dispatch(actions.updateGithubSaveInfo(repoName, filePath.slice(12), new Date()));
    } catch (err) {
      console.error(err);
      showWarningMessage('Something went wrong when trying to save the file.', 1000);
    }
  }

  try {
    await (octokit as any).createOrUpdateFiles({
      owner: repoOwner,
      repo: repoName,
      createBranch: false,
      branch: 'main',
      changes: [{
        message: changes.commitMessage,
        files: changes.files
      }]
    })

    //this is to forcefully update playground
    store.dispatch(actions.playgroundUpdateRepoName(repoName));
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
