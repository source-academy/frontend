import { Octokit } from '@octokit/rest';
import {
  GetResponseDataTypeFromEndpointMethod,
  GetResponseTypeFromEndpointMethod
} from '@octokit/types';
import { FSModule } from 'browserfs/dist/node/core/FS';

import { getPersistenceFile, retrieveFilesInWorkspaceAsRecord, rmFilesInDirRecursively,writeFileRecursively } from '../../commons/fileSystem/FileSystemUtils';
import { actions } from '../../commons/utils/ActionsHelper';
import { showSimpleConfirmDialog } from '../../commons/utils/DialogHelper';
import {
  showSuccessMessage,
  showWarningMessage
} from '../../commons/utils/notifications/NotificationsHelper';
import { store } from '../../pages/createStore';
import { WORKSPACE_BASE_PATHS } from 'src/pages/fileSystem/createInBrowserFileSystem';
import { addGithubSaveInfo, updateRefreshFileViewKey } from 'src/commons/fileSystem/FileSystemActions';
import { PersistenceFile } from '../persistence/PersistenceTypes';
import { disableFileSystemContextMenus } from '../playground/PlaygroundActions';

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

export async function checkFolderLocationIsValid(
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  filePath: string
) {
  if (octokit === undefined) {
    showWarningMessage('Please log in and try again', 2000);
    return false;
  }

  try {
    await octokit.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: filePath
    });
  } catch (err) {
    // 404 status means that the file could not be found.
    // In this case, the dialog should still continue as the user should be given
    // the option of creating a new file on their remote repository.
    if (err.status !== 404) {
      showWarningMessage('Connection denied or file does not exist.', 2000);
      console.error(err);
      return false;
    }
  }

  return true;
}

export async function openFileInEditor(
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  filePath: string
) {
  if (octokit === undefined) return;

  store.dispatch(actions.deleteAllGithubSaveInfo());
  const fileSystem: FSModule | null = store.getState().fileSystem.inBrowserFileSystem;
  if (fileSystem === null) {
    console.log("no filesystem!");
  } else {
    await rmFilesInDirRecursively(fileSystem, "/playground");
  }
  type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
  const results: GetContentResponse = await octokit.repos.getContent({
    owner: repoOwner,
    repo: repoName,
    path: filePath
  });
  const content = (results.data as any).content;

  const regexResult = /^(.*[\\\/])?(\.*.*?)(\.[^.]+?|)$/.exec(filePath);
      if (regexResult === null) {
        console.log("Regex null");
        return;
      }
    const newFilePath = regexResult[2] + regexResult[3];
    console.log(newFilePath);

  const newEditorValue = Buffer.from(content, 'base64').toString();
  const activeEditorTabIndex = store.getState().workspaces.playground.activeEditorTabIndex;
  if (activeEditorTabIndex === null) {
    store.dispatch(actions.addEditorTab('playground', "/playground/" + newFilePath , newEditorValue));
  } else {
    store.dispatch(actions.updateEditorValue('playground', activeEditorTabIndex, newEditorValue));
  }
  store.dispatch(actions.addGithubSaveInfo(
    {
      id: '',
      name: '',
      repoName: repoName,
      path: "/playground/" + newFilePath,
      lastSaved: new Date(),
      parentFolderPath: regexResult[1]
    }
  ))

  if (content) {
    showSuccessMessage('Successfully loaded file!', 1000);
  } else {
    showWarningMessage('Successfully loaded file but file was empty!', 1000);
  }

  if (fileSystem !== null) {
    await writeFileRecursively(fileSystem, "/playground/" + newFilePath, newEditorValue);
  }


  store.dispatch(actions.updateRefreshFileViewKey());
  //refreshes editor tabs
  store.dispatch(actions.removeEditorTabsForDirectory("playground", WORKSPACE_BASE_PATHS["playground"])); // TODO hardcoded
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

  try {
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
  
    let parentFolderPath = filePath + '.js';
    console.log(parentFolderPath);
    const regexResult = /^(.*[\\\/])?(\.*.*?)(\.[^.]+?|)$/.exec(parentFolderPath);
      if (regexResult === null) {
        console.log("Regex null");
        return;
      }
    parentFolderPath = regexResult[1] || '';
    console.log(regexResult);
  
    // This is a helper function to asynchronously clear the current folder system, then get each
    // file and its contents one by one, then finally refresh the file system after all files
    // have been recursively created. There may be extra asyncs or promises but this is what works.
    const readFile = async (files: Array<string>) => {
      console.log(files);
      console.log(filePath);
      let promise = Promise.resolve();
      console.log("removing files");
      await rmFilesInDirRecursively(fileSystem, "/playground");
      console.log("files removed");
      type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
      console.log("starting to add files");
      files.forEach((file: string) => {
        promise = promise.then(async () => {
          let results = {} as GetContentResponse;
          console.log(repoOwner);
          console.log(repoName);
          console.log(file);
          if (file.startsWith(filePath + "/")) {
            console.log("passed");
            results = await octokit.repos.getContent({
              owner: repoOwner,
              repo: repoName,
              path: file
            });
            console.log(results);
            const content = (results.data as any)?.content;
          
            
            const fileContent = Buffer.from(content, 'base64').toString();
            console.log("/playground/" + file.slice(parentFolderPath.length));
            await writeFileRecursively(fileSystem, "/playground/" + file.slice(parentFolderPath.length), fileContent);
            store.dispatch(actions.addGithubSaveInfo(
              {
                id: '',
                name: '',
                repoName: repoName,
                path: "/playground/" + file.slice(parentFolderPath.length),
                lastSaved: new Date(),
                parentFolderPath: parentFolderPath
              }
            ))
            console.log(store.getState().fileSystem.persistenceFileArray);
            console.log("wrote one file");
          } else {
            console.log("failed");
          }
        })
      })
      promise.then(() => {
        // store.dispatch(actions.playgroundUpdateRepoName(repoName));
        console.log("promises fulfilled");
        // store.dispatch(actions.setFolderMode('playground', true));
        store.dispatch(updateRefreshFileViewKey());
        console.log("refreshed");
        showSuccessMessage('Successfully loaded file!', 1000);
      })
    }
  
    readFile(files);
  
    //refreshes editor tabs
    store.dispatch(actions.removeEditorTabsForDirectory("playground", WORKSPACE_BASE_PATHS["playground"])); // TODO hardcoded
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to open the folder', 1000);
  }
  
}

export async function performOverwritingSave(
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  filePath: string,    // filepath of the file in folder mode file system (does not include "/playground/")
  githubName: string | null,
  githubEmail: string | null,
  commitMessage: string,
  content: string,
  parentFolderPath: string  // path of the parent of the opened subfolder in github
) {
  if (octokit === undefined) return;

  githubEmail = githubEmail || 'No public email provided';
  githubName = githubName || 'Source Academy User';
  commitMessage = commitMessage || 'Changes made from Source Academy';
  content = content || '';
  const githubFilePath = parentFolderPath + filePath;

  store.dispatch(actions.disableFileSystemContextMenus());

  const contentEncoded = Buffer.from(content, 'utf8').toString('base64');

  try {
    type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
    console.log(repoOwner);
    console.log(repoName);
    console.log(githubFilePath);
    console.log(contentEncoded);
    const results: GetContentResponse = await octokit.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: githubFilePath
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
      path: githubFilePath,
      message: commitMessage,
      content: contentEncoded,
      sha: sha,
      committer: { name: githubName, email: githubEmail },
      author: { name: githubName, email: githubEmail }
    });
    
    store.dispatch(actions.addGithubSaveInfo({ 
        id: '',
        name: '',
        repoName: repoName, 
        path: "/playground/" + filePath, 
        lastSaved: new Date(),
        parentFolderPath: parentFolderPath 
    }));

    //this is just so that playground is forcefully updated
    // store.dispatch(actions.playgroundUpdateRepoName(repoName));
    showSuccessMessage('Successfully saved file!', 1000);
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to save the file.', 1000);
  } finally {
    store.dispatch(actions.enableFileSystemContextMenus());
    store.dispatch(actions.updateRefreshFileViewKey());
  }
}

export async function performMultipleOverwritingSave(
  octokit: Octokit,
  repoOwner: string,
  githubName: string | null,
  githubEmail: string | null,
  changes: { commitMessage: string, files: Record<string, string> },
) {
  if (octokit === undefined) return;

  githubEmail = githubEmail || 'No public email provided';
  githubName = githubName || 'Source Academy User';
  changes.commitMessage = changes.commitMessage || 'Changes made from Source Academy';
  store.dispatch(actions.disableFileSystemContextMenus());
  
  try {
    for (const filePath of Object.keys(changes.files)) {
      //this will create a separate commit for each file changed, which is not ideal. 
      //the simple solution is to use a plugin github-commit-multiple-files
      //but this changes file sha, which causes many problems down the road
      //eventually this should be changed to be done using git data api to build a commit from scratch
      const persistenceFile = getPersistenceFile(filePath);
      if (persistenceFile === undefined) {
        throw new Error("No persistence file found for this filePath: " + filePath);
      }
      const repoName = persistenceFile.repoName;
      if (repoName === undefined) {
        throw new Error("No repository name found for this persistencefile: " + persistenceFile);
      }
      const parentFolderPath = persistenceFile.parentFolderPath;
      if (parentFolderPath === undefined) {
        throw new Error("No parent folder path found for this persistencefile: " + persistenceFile);
      }
      await performOverwritingSave(
        octokit,
        repoOwner,
        repoName,
        filePath,
        githubName,
        githubEmail,
        changes.commitMessage,
        changes.files[filePath].slice(12),
        parentFolderPath
      );
  }
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to save the file.', 1000);
  } finally {
    showSuccessMessage('Successfully saved all files!', 1000);
    store.dispatch(actions.enableFileSystemContextMenus());
    store.dispatch(updateRefreshFileViewKey());
  }
}

export async function performOverwritingSaveForSaveAs(
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  filePath: string,    // filepath of the file in folder mode file system (does not include "/playground/")
  githubName: string | null,
  githubEmail: string | null,
  commitMessage: string,
  content: string, // path of the parent of the opened subfolder in github
) {
  if (octokit === undefined) return;

  githubEmail = githubEmail || 'No public email provided';
  githubName = githubName || 'Source Academy User';
  commitMessage = commitMessage || 'Changes made from Source Academy';
  content = content || '';

  store.dispatch(actions.disableFileSystemContextMenus());

  const contentEncoded = Buffer.from(content, 'utf8').toString('base64');

  try {
    type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
    console.log(repoOwner);
    console.log(repoName);
    console.log(filePath);
    console.log(contentEncoded);
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
    showSuccessMessage('Successfully saved file!', 1000);
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to save the file.', 1000);
  } finally {
    store.dispatch(actions.enableFileSystemContextMenus());
    store.dispatch(actions.updateRefreshFileViewKey());
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
  content: string,
  parentFolderPath: string
) {
  if (octokit === undefined) return;

  githubEmail = githubEmail || 'No public email provided';
  githubName = githubName || 'Source Academy User';
  commitMessage = commitMessage || 'Changes made from Source Academy';
  content = content || '';
  const githubFilePath = parentFolderPath + filePath;

  const contentEncoded = Buffer.from(content, 'utf8').toString('base64');
  try {
    store.dispatch(actions.disableFileSystemContextMenus());
    await octokit.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo: repoName,
      path: githubFilePath,
      message: commitMessage,
      content: contentEncoded,
      committer: { name: githubName, email: githubEmail },
      author: { name: githubName, email: githubEmail }
    });
    showSuccessMessage('Successfully created file!', 1000);
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to save the file.', 1000);
  } finally {
    store.dispatch(actions.enableFileSystemContextMenus());
    store.dispatch(updateRefreshFileViewKey());
  }
}

export async function performMultipleCreatingSave(
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  folderPath: string,
  githubName: string | null,
  githubEmail: string | null,
  commitMessage: string,
) {
  if (octokit === undefined) return;

  githubEmail = githubEmail || 'No public email provided';
  githubName = githubName || 'Source Academy User';
  commitMessage = commitMessage || 'Changes made from Source Academy';
  folderPath = folderPath + '/';

  const fileSystem: FSModule | null = store.getState().fileSystem.inBrowserFileSystem;
  // If the file system is not initialised, do nothing.
  if (fileSystem === null) {
    console.log("no filesystem!");
    return;
  }
  console.log("there is a filesystem");
  const currFiles: Record<string, string> = await retrieveFilesInWorkspaceAsRecord("playground", fileSystem);
  try {
    store.dispatch(actions.disableFileSystemContextMenus());
    for (const filePath of Object.keys(currFiles)) {
      console.log(folderPath);
      console.log(filePath);
      const content = currFiles[filePath];
      const contentEncoded = Buffer.from(content, 'utf8').toString('base64');
      await octokit.repos.createOrUpdateFileContents({
        owner: repoOwner,
        repo: repoName,
        path: folderPath + filePath.slice(12),
        message: commitMessage,
        content: contentEncoded,
        committer: { name: githubName, email: githubEmail },
        author: { name: githubName, email: githubEmail }
      });
      store.dispatch(addGithubSaveInfo({
        id: '',
        name: '',
        repoName: repoName,
        path: filePath,
        parentFolderPath: folderPath,
        lastSaved: new Date()
      }));
      showSuccessMessage('Successfully created file!', 1000);
    }
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to save the file.', 1000);
  } finally {
    store.dispatch(actions.enableFileSystemContextMenus());
    store.dispatch(updateRefreshFileViewKey());
  }
}

export async function performFileDeletion (
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  filePath: string,
  githubName: string | null,
  githubEmail: string | null,
  commitMessage: string,
  parentFolderPath: string
) {
  if (octokit === undefined) return;

  githubEmail = githubEmail || 'No public email provided';
  githubName = githubName || 'Source Academy User';
  commitMessage = commitMessage || 'Changes made from Source Academy';
  const githubFilePath = parentFolderPath + filePath;

  try {
    store.dispatch(actions.disableFileSystemContextMenus());
    type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
    const results: GetContentResponse = await octokit.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: githubFilePath
    });

    type GetContentData = GetResponseDataTypeFromEndpointMethod<typeof octokit.repos.getContent>;
    const files: GetContentData = results.data;

    if (Array.isArray(files)) {
      return;
    }

    const sha = files.sha;
    
    await octokit.repos.deleteFile({
      owner: repoOwner,
      repo: repoName,
      path: githubFilePath,
      message: commitMessage,
      sha: sha
    });

    const persistenceFileArray = store.getState().fileSystem.persistenceFileArray;
    console.log(persistenceFileArray);
    const persistenceFile = persistenceFileArray.find(e => 
      e.path === "/playground/" + filePath);
    if (!persistenceFile) {
      console.log("Cannot find persistence file for " + "/playground/" + filePath);
      return;
    }
    console.log(persistenceFile);
    store.dispatch(actions.deleteGithubSaveInfo(persistenceFile));
    showSuccessMessage('Successfully deleted file from GitHub!', 1000);
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to delete the file.', 1000);
  } finally {
    store.dispatch(updateRefreshFileViewKey());
    store.dispatch(actions.enableFileSystemContextMenus());
  }
}

export async function performFolderDeletion(
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  filePath: string,
  githubName: string | null,
  githubEmail: string | null,
  commitMessage: string,
  parentFolderPath: string
) {
  if (octokit === undefined) return;

  githubEmail = githubEmail || 'No public email provided';
  githubName = githubName || 'Source Academy User';
  commitMessage = commitMessage || 'Changes made from Source Academy';
  const githubFilePath = parentFolderPath + filePath;

  try {
    store.dispatch(disableFileSystemContextMenus());
    const results = await octokit.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: githubFilePath
    });
    type GetContentData = GetResponseDataTypeFromEndpointMethod<typeof octokit.repos.getContent>;
    const files: GetContentData = results.data;

    if (!Array.isArray(files)) {
      showWarningMessage('The folder you are trying to delete does not exist in Github', 1000);
      return;
    }

    const persistenceFileArray = store.getState().fileSystem.persistenceFileArray;
    
    for (let i = 0; i < persistenceFileArray.length; i++) {
      await checkPersistenceFile(persistenceFileArray[i]);
    }

    async function checkPersistenceFile(persistenceFile: PersistenceFile) {
      if (persistenceFile.path?.startsWith("/playground/" + filePath)) {
        console.log("Deleting" + persistenceFile.path);
        await performFileDeletion(
          octokit,
          repoOwner,
          repoName,
          persistenceFile.path.slice(12),
          githubName,
          githubEmail,
          commitMessage,
          parentFolderPath
        )
      }
    }

    showSuccessMessage('Successfully deleted folder from GitHub!', 1000);
    store.dispatch(updateRefreshFileViewKey());
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to delete the folder.', 1000);
  } finally {
    store.dispatch(actions.enableFileSystemContextMenus());
  }
}

export async function performFileRenaming (
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  oldFilePath: string,
  githubName: string | null,
  githubEmail: string | null,
  commitMessage: string,
  newFilePath: string,
  parentFolderPath: string
) {
  if (octokit === undefined) return;

  githubEmail = githubEmail || 'No public email provided';
  githubName = githubName || 'Source Academy User';
  commitMessage = commitMessage || 'Changes made from Source Academy';
  const oldGithubFilePath = parentFolderPath + oldFilePath;
  const newGithubFilePath = parentFolderPath + newFilePath;

  try {
    store.dispatch(actions.disableFileSystemContextMenus());
    type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
    console.log("repoOwner is " + repoOwner + " repoName is " + repoName + " oldfilepath is " + oldFilePath);
    const results: GetContentResponse = await octokit.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: oldGithubFilePath
    });

    type GetContentData = GetResponseDataTypeFromEndpointMethod<typeof octokit.repos.getContent>;
    const files: GetContentData = results.data;

    if (Array.isArray(files)) {
      showWarningMessage('The file you are trying to rename appears to be a folder in Github', 1000);
      return;
    }

    const sha = files.sha;
    const content = (results.data as any).content;
    const regexResult = /^(.*[\\\/])?(\.*.*?)(\.[^.]+?|)$/.exec(newFilePath);
        if (regexResult === null) {
          console.log("Regex null");
          return;
        }
    const newFileName = regexResult[2] + regexResult[3];

    await octokit.repos.deleteFile({
      owner: repoOwner,
      repo: repoName,
      path: oldGithubFilePath,
      message: commitMessage,
      sha: sha
    });


    await octokit.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo: repoName,
      path: newGithubFilePath,
      message: commitMessage,
      content: content,
      committer: { name: githubName, email: githubEmail },
      author: { name: githubName, email: githubEmail }
    });

    store.dispatch(actions.updatePersistenceFilePathAndNameByPath("/playground/" + oldFilePath, "/playground/" + newFilePath, newFileName));
    showSuccessMessage('Successfully renamed file in Github!', 1000);
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to rename the file.', 1000);
  } finally {
    store.dispatch(actions.enableFileSystemContextMenus());
    store.dispatch(updateRefreshFileViewKey());
  }
}

export async function performFolderRenaming (
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  oldFolderPath: string,
  githubName: string | null,
  githubEmail: string | null,
  commitMessage: string,
  newFolderPath: string,
  parentFolderPath: string
) {
  if (octokit === undefined) return;

  githubEmail = githubEmail || 'No public email provided';
  githubName = githubName || 'Source Academy User';
  commitMessage = commitMessage || 'Changes made from Source Academy';
  
  try {
    store.dispatch(actions.disableFileSystemContextMenus());
    const persistenceFileArray = store.getState().fileSystem.persistenceFileArray;
    type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
    type GetContentData = GetResponseDataTypeFromEndpointMethod<typeof octokit.repos.getContent>;
    
    for (let i = 0; i < persistenceFileArray.length; i++) {
      const persistenceFile = persistenceFileArray[i];
      if (persistenceFile.path?.startsWith("/playground/" + oldFolderPath)) {
        console.log("Deleting" + persistenceFile.path);
        const oldFilePath = parentFolderPath + persistenceFile.path.slice(12);
        const newFilePath = parentFolderPath + newFolderPath + persistenceFile.path.slice(12 + oldFolderPath.length);
        const results: GetContentResponse = await octokit.repos.getContent({
          owner: repoOwner,
          repo: repoName,
          path: oldFilePath
        });
        const file: GetContentData = results.data;
        const content = (results.data as any).content;
        // Cannot save over folder
        if (Array.isArray(file)) {
          return;
        }
        const sha = file.sha;

        const regexResult0 = /^(.*[\\\/])?(\.*.*?)(\.[^.]+?|)$/.exec(oldFolderPath);
        if (regexResult0 === null) {
          console.log("Regex null");
          return;
        }
        const oldFolderName = regexResult0[2];
        const regexResult = /^(.*[\\\/])?(\.*.*?)(\.[^.]+?|)$/.exec(newFolderPath);
        if (regexResult === null) {
          console.log("Regex null");
          return;
        }
        const newFolderName = regexResult[2];

        await octokit.repos.deleteFile({
          owner: repoOwner,
          repo: repoName,
          path: oldFilePath,
          message: commitMessage,
          sha: sha
        });

        await octokit.repos.createOrUpdateFileContents({
          owner: repoOwner,
          repo: repoName,
          path: newFilePath,
          message: commitMessage,
          content: content,
          committer: { name: githubName, email: githubEmail},
          author: { name: githubName, email: githubEmail}
        });

        console.log("oldfolderpath is " + oldFolderPath + " newfolderpath is " + newFolderPath + " oldfoldername is " + oldFolderName + " newfoldername is " + newFolderName);

        console.log(store.getState().fileSystem.persistenceFileArray);
        store.dispatch(actions.updatePersistenceFolderPathAndNameByPath(
          "/playground/" + oldFolderPath, 
          "/playground/" + newFolderPath, 
          oldFolderName, 
          newFolderName));
      }
    }

    showSuccessMessage('Successfully renamed folder in Github!', 1000);
  } catch(err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to rename the folder.', 1000);
  } finally {
    store.dispatch(updateRefreshFileViewKey());
    store.dispatch(actions.enableFileSystemContextMenus());
  }
}