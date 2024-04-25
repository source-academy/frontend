import { Intent } from '@blueprintjs/core';
import { Octokit } from '@octokit/rest';
import {
  GetResponseDataTypeFromEndpointMethod,
  GetResponseTypeFromEndpointMethod
} from '@octokit/types';
import { FSModule } from 'browserfs/dist/node/core/FS';
import { filePathRegex } from 'src/commons/utils/PersistenceHelper';
import { WORKSPACE_BASE_PATHS } from 'src/pages/fileSystem/createInBrowserFileSystem';

import {
  getPersistenceFile,
  retrieveFilesInWorkspaceAsRecord,
  rmFilesInDirRecursively,
  writeFileRecursively
} from '../../commons/fileSystem/FileSystemUtils';
import { actions } from '../../commons/utils/ActionsHelper';
import { showSimpleConfirmDialog } from '../../commons/utils/DialogHelper';
import {
  dismiss,
  showMessage,
  showSuccessMessage,
  showWarningMessage
} from '../../commons/utils/notifications/NotificationsHelper';
import { store } from '../../pages/createStore';
import { PersistenceFile } from '../persistence/PersistenceTypes';

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
  });

  const files = results.data;

  if (Array.isArray(files)) {
    return false;
  }

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
  store.dispatch(actions.disableFileSystemContextMenus());
  try {
    if (octokit === undefined) return;

    store.dispatch(actions.deleteAllGithubSaveInfo());
    const fileSystem: FSModule | null = store.getState().fileSystem.inBrowserFileSystem;
    if (fileSystem !== null) {
      await rmFilesInDirRecursively(fileSystem, '/playground');
    }
    type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
    const results: GetContentResponse = await octokit.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: filePath
    });
    const content = (results.data as any).content;

    const regexResult = filePathRegex.exec(filePath)!;
    const newFilePath = regexResult[2] + regexResult[3];

    const newEditorValue = Buffer.from(content, 'base64').toString();
    const activeEditorTabIndex = store.getState().workspaces.playground.activeEditorTabIndex;

    if (fileSystem !== null) {
      await writeFileRecursively(fileSystem, '/playground/' + newFilePath, newEditorValue);
    }
    store.dispatch(
      actions.addGithubSaveInfo({
        id: '',
        name: '',
        repoName: repoName,
        path: '/playground/' + newFilePath,
        lastSaved: new Date(),
        parentFolderPath: regexResult[1]
      })
    );

    // Delay to increase likelihood addPersistenceFile for last loaded file has completed
    // and for refreshfileview to happen after everything is loaded
    const wait = () => new Promise(resolve => setTimeout(resolve, 1000));
    await wait();

    store.dispatch(
      actions.playgroundUpdatePersistenceFile({
        id: '',
        name: newFilePath,
        repoName: repoName,
        path: '/playground/' + newFilePath,
        lastSaved: new Date(),
        parentFolderPath: regexResult[1]
      })
    );
    if (activeEditorTabIndex === null) {
      store.dispatch(
        actions.addEditorTab('playground', '/playground/' + newFilePath, newEditorValue)
      );
    } else {
      store.dispatch(
        actions.updateActiveEditorTab('playground', {
          filePath: '/playground/' + newFilePath,
          value: newEditorValue
        })
      );
    }

    if (content) {
      showSuccessMessage('Successfully loaded file!', 1000);
    } else {
      showWarningMessage('Successfully loaded file but file was empty!', 1000);
    }
  } catch (e) {
    console.error(e);
    showWarningMessage('Something went wrong when trying to open the file.', 1000);
  } finally {
    store.dispatch(actions.enableFileSystemContextMenus());
    store.dispatch(actions.updateRefreshFileViewKey());
  }
}

export async function openFolderInFolderMode(
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  filePath: string
) {
  //In order to get the file paths recursively, we require the tree_sha,
  // which is obtained from the most recent commit(any commit works but the most recent)
  // is the easiest
  let toastKey: string | undefined;
  try {
    store.dispatch(actions.disableFileSystemContextMenus());
    if (octokit === undefined) return;
    toastKey = showMessage({
      message: `Opening files...`,
      timeout: 0,
      intent: Intent.PRIMARY
    });
    store.dispatch(actions.deleteAllGithubSaveInfo());

    const requests = await octokit.request('GET /repos/{owner}/{repo}/branches/master', {
      owner: repoOwner,
      repo: repoName
    });

    const tree_sha = requests.data.commit.commit.tree.sha;

    const results = await octokit.request(
      'GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=1',
      {
        owner: repoOwner,
        repo: repoName,
        tree_sha: tree_sha
      }
    );

    const files_and_folders = results.data.tree;
    const files: any[] = [];

    //Filters out the files only since the tree returns both file and folder paths
    for (let index = 0; index < files_and_folders.length; index++) {
      if (files_and_folders[index].type === 'blob') {
        files[files.length] = files_and_folders[index].path;
      }
    }

    store.dispatch(actions.setFolderMode('playground', true)); //automatically opens folder mode
    const fileSystem: FSModule | null = store.getState().fileSystem.inBrowserFileSystem;
    if (fileSystem === null) {
      throw new Error('No filesystem!');
    }

    let parentFolderPath = filePath + '.js';
    const regexResult = filePathRegex.exec(parentFolderPath)!;
    parentFolderPath = regexResult[1] || '';
    await rmFilesInDirRecursively(fileSystem, '/playground');
    type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
    for (const file of files) {
      let results = {} as GetContentResponse;
      if (file.startsWith(filePath + '/')) {
        results = await octokit.repos.getContent({
          owner: repoOwner,
          repo: repoName,
          path: file
        });
        const content = (results.data as any)?.content;

        const fileContent = Buffer.from(content, 'base64').toString();
        await writeFileRecursively(
          fileSystem,
          '/playground/' + file.slice(parentFolderPath.length),
          fileContent
        );
        store.dispatch(
          actions.addGithubSaveInfo({
            id: '',
            name: '',
            repoName: repoName,
            path: '/playground/' + file.slice(parentFolderPath.length),
            lastSaved: new Date(),
            parentFolderPath: parentFolderPath
          })
        );
        const regexResult = filePathRegex.exec(filePath)!;
        store.dispatch(
          actions.playgroundUpdatePersistenceFile({
            id: '',
            name: regexResult[2],
            repoName: repoName,
            lastSaved: new Date(),
            parentFolderPath: parentFolderPath
          })
        );
      }
    }

    // Delay to increase likelihood addPersistenceFile for last loaded file has completed
    // and for refreshfileview to happen after everything is loaded
    const wait = () => new Promise(resolve => setTimeout(resolve, 1000));
    await wait();
    store.dispatch(
      actions.removeEditorTabsForDirectory('playground', WORKSPACE_BASE_PATHS['playground'])
    );
    showSuccessMessage('Successfully loaded file!', 1000);
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to open the folder', 1000);
  } finally {
    if (toastKey) {
      dismiss(toastKey);
    }
    store.dispatch(actions.enableFileSystemContextMenus());
    store.dispatch(actions.updateRefreshFileViewKey());
  }
}

export async function performOverwritingSave(
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  filePath: string, // filepath of the file in folder mode file system (does not include "/playground/")
  githubName: string | null,
  githubEmail: string | null,
  commitMessage: string,
  content: string,
  parentFolderPath: string // path of the parent of the opened subfolder in github
) {
  let toastKey: string | undefined;
  try {
    const regexResult = filePathRegex.exec(filePath)!;
    toastKey = showMessage({
      message: `Saving ${regexResult[2] + regexResult[3]} to Github...`,
      timeout: 0,
      intent: Intent.PRIMARY
    });
    store.dispatch(actions.disableFileSystemContextMenus());
    if (octokit === undefined) return;

    githubEmail = githubEmail || 'No public email provided';
    githubName = githubName || 'Source Academy User';
    commitMessage = commitMessage || 'Changes made from Source Academy';
    content = content || '';
    const githubFilePath = parentFolderPath + filePath;

    const contentEncoded = Buffer.from(content, 'utf8').toString('base64');

    type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
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

    store.dispatch(
      actions.addGithubSaveInfo({
        id: '',
        name: '',
        repoName: repoName,
        path: '/playground/' + filePath,
        lastSaved: new Date(),
        parentFolderPath: parentFolderPath
      })
    );
    const playgroundPersistenceFile = store.getState().playground.persistenceFile;
    store.dispatch(
      actions.playgroundUpdatePersistenceFile({
        id: '',
        name: playgroundPersistenceFile?.name || '',
        repoName: repoName,
        lastSaved: new Date(),
        parentFolderPath: parentFolderPath
      })
    );

    showSuccessMessage('Successfully saved file!', 800);
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to save the file.', 1000);
  } finally {
    if (toastKey) {
      dismiss(toastKey);
    }
    store.dispatch(actions.enableFileSystemContextMenus());
    store.dispatch(actions.updateRefreshFileViewKey());
  }
}

export async function performMultipleOverwritingSave(
  octokit: Octokit,
  repoOwner: string,
  githubName: string | null,
  githubEmail: string | null,
  changes: { commitMessage: string; files: Record<string, string> }
) {
  let toastKey: string | undefined;
  try {
    toastKey = showMessage({
      message: `Saving all your files to Github...`,
      timeout: 0,
      intent: Intent.PRIMARY
    });
    if (octokit === undefined) return;

    githubEmail = githubEmail || 'No public email provided';
    githubName = githubName || 'Source Academy User';
    changes.commitMessage = changes.commitMessage || 'Changes made from Source Academy';

    for (const filePath of Object.keys(changes.files)) {
      //this will create a separate commit for each file changed, which is not ideal.
      //the simple solution is to use a plugin github-commit-multiple-files
      //but this changes file sha, which causes many problems down the road
      //eventually this should be changed to be done using git data api to build a commit from scratch
      const persistenceFile = getPersistenceFile(filePath);
      if (persistenceFile === undefined) {
        throw new Error('No persistence file found for this filePath: ' + filePath);
      }
      const repoName = persistenceFile.repoName;
      const parentFolderPath = persistenceFile.parentFolderPath;
      const lastSaved = persistenceFile.lastSaved;
      const lastEdit = persistenceFile.lastEdit;
      if (parentFolderPath === undefined || repoName === undefined) {
        throw new Error(
          'No parent folder path or repository name or last saved found for this persistencefile: ' +
            persistenceFile
        );
      }
      if (lastEdit) {
        if (!lastSaved || lastSaved < lastEdit) {
          const githubFilePath = parentFolderPath + filePath.slice(12);
          type GetContentResponse = GetResponseTypeFromEndpointMethod<
            typeof octokit.repos.getContent
          >;
          const results: GetContentResponse = await octokit.repos.getContent({
            owner: repoOwner,
            repo: repoName,
            path: githubFilePath
          });

          type GetContentData = GetResponseDataTypeFromEndpointMethod<
            typeof octokit.repos.getContent
          >;
          const files: GetContentData = results.data;

          // Cannot save over folder
          if (Array.isArray(files)) {
            return;
          }

          const sha = files.sha;
          const contentEncoded = Buffer.from(changes.files[filePath], 'utf8').toString('base64');

          await octokit.repos.createOrUpdateFileContents({
            owner: repoOwner,
            repo: repoName,
            path: githubFilePath,
            message: changes.commitMessage,
            content: contentEncoded,
            sha: sha,
            committer: { name: githubName, email: githubEmail },
            author: { name: githubName, email: githubEmail }
          });

          store.dispatch(
            actions.addGithubSaveInfo({
              id: '',
              name: '',
              repoName: repoName,
              path: filePath,
              lastSaved: new Date(),
              parentFolderPath: parentFolderPath
            })
          );
          const playgroundPersistenceFile = store.getState().playground.persistenceFile;
          store.dispatch(
            actions.playgroundUpdatePersistenceFile({
              id: '',
              name: playgroundPersistenceFile?.name || '',
              repoName: repoName,
              lastSaved: new Date(),
              parentFolderPath: parentFolderPath
            })
          );
        }
      }
    }

    const wait = () => new Promise(resolve => setTimeout(resolve, 1000));
    await wait();

    showSuccessMessage('Successfully saved all files!', 1000);
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to save the file.', 1000);
  } finally {
    if (toastKey) {
      dismiss(toastKey);
    }
    store.dispatch(actions.updateRefreshFileViewKey());
    store.dispatch(actions.enableFileSystemContextMenus());
  }
}

export async function performOverwritingSaveForSaveAs(
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
  let toastKey: string | undefined;
  try {
    const regexResult = filePathRegex.exec(filePath)!;
    toastKey = showMessage({
      message: `Saving ${regexResult[2] + regexResult[3]} to Github...`,
      timeout: 0,
      intent: Intent.PRIMARY
    });
    store.dispatch(actions.disableFileSystemContextMenus());
    if (octokit === undefined) return;
    githubEmail = githubEmail || 'No public email provided';
    githubName = githubName || 'Source Academy User';
    commitMessage = commitMessage || 'Changes made from Source Academy';
    content = content || '';

    const contentEncoded = Buffer.from(content, 'utf8').toString('base64');
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
    const persistenceFile = getPersistenceFile(
      '/playground/' + filePath.slice(parentFolderPath.length)
    );
    if (persistenceFile !== undefined) {
      //case where user saves as into the same folder
      const parentFolderPath = persistenceFile.parentFolderPath;
      const filePath = persistenceFile.path;
      if (parentFolderPath === undefined || filePath === undefined) {
        throw new Error(
          'parentfolderpath or filepath not found for this persistencefile: ' + persistenceFile
        );
      }

      const fileSystem: FSModule | null = store.getState().fileSystem.inBrowserFileSystem;
      if (fileSystem === null) {
        throw new Error('No filesystem!');
      }

      writeFileRecursively(fileSystem, filePath, content);

      store.dispatch(
        actions.addGithubSaveInfo({
          id: '',
          name: '',
          repoName: repoName,
          path: filePath,
          lastSaved: new Date(),
          parentFolderPath: parentFolderPath
        })
      );
    }

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
    if (toastKey) {
      dismiss(toastKey);
    }
    store.dispatch(actions.updateRefreshFileViewKey());
    store.dispatch(actions.enableFileSystemContextMenus());
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
  githubEmail = githubEmail || 'No public email provided';
  githubName = githubName || 'Source Academy User';
  commitMessage = commitMessage || 'Changes made from Source Academy';
  content = content || '';
  const githubFilePath = parentFolderPath + filePath;

  const contentEncoded = Buffer.from(content, 'utf8').toString('base64');
  let toastKey: string | undefined;
  try {
    const regexResult = filePathRegex.exec(filePath)!;
    toastKey = showMessage({
      message: `Saving ${regexResult[2] + regexResult[3]} to Github...`,
      timeout: 0,
      intent: Intent.PRIMARY
    });
    store.dispatch(actions.disableFileSystemContextMenus());
    if (octokit === undefined) return;
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
    if (toastKey) {
      dismiss(toastKey);
    }
    store.dispatch(actions.updateRefreshFileViewKey());
    store.dispatch(actions.enableFileSystemContextMenus());
  }
}

export async function performMultipleCreatingSave(
  octokit: Octokit,
  repoOwner: string,
  repoName: string,
  folderPath: string,
  githubName: string | null,
  githubEmail: string | null,
  commitMessage: string
) {
  let toastKey: string | undefined;
  store.dispatch(actions.disableFileSystemContextMenus());
  githubEmail = githubEmail || 'No public email provided';
  githubName = githubName || 'Source Academy User';
  commitMessage = commitMessage || 'Changes made from Source Academy';
  folderPath = folderPath + '/';

  const fileSystem: FSModule | null = store.getState().fileSystem.inBrowserFileSystem;
  // If the file system is not initialised, do nothing.
  if (fileSystem === null) {
    throw new Error('No filesystem!');
  }
  const currFiles: Record<string, string> = await retrieveFilesInWorkspaceAsRecord(
    'playground',
    fileSystem
  );
  try {
    if (octokit === undefined) return;
    toastKey = showMessage({
      message: `Saving all your files to Github...`,
      timeout: 0,
      intent: Intent.PRIMARY
    });
    for (const filePath of Object.keys(currFiles)) {
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
      store.dispatch(
        actions.addGithubSaveInfo({
          id: '',
          name: '',
          repoName: repoName,
          path: filePath,
          parentFolderPath: folderPath,
          lastSaved: new Date()
        })
      );
      showSuccessMessage('Successfully created file!', 1000);
    }
    const regexResult = filePathRegex.exec(folderPath)!;
    store.dispatch(
      actions.playgroundUpdatePersistenceFile({
        id: '',
        name: regexResult[2],
        repoName: repoName,
        parentFolderPath: folderPath,
        lastSaved: new Date()
      })
    );

    const wait = () => new Promise(resolve => setTimeout(resolve, 1000));
    await wait();
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to save the file.', 1000);
  } finally {
    store.dispatch(actions.enableFileSystemContextMenus());
    store.dispatch(actions.updateRefreshFileViewKey());
    if (toastKey) {
      dismiss(toastKey);
    }
  }
}

export async function performFileDeletion(
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
    const persistenceFile = persistenceFileArray.find(e => e.path === '/playground/' + filePath);
    if (!persistenceFile) {
      throw new Error('Cannot find persistence file for /playground/' + filePath);
    }
    store.dispatch(actions.deleteGithubSaveInfo(persistenceFile));
    showSuccessMessage('Successfully deleted file from GitHub!', 1000);
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to delete the file.', 1000);
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
      if (persistenceFile.path?.startsWith('/playground/' + filePath + '/')) {
        await performFileDeletion(
          octokit,
          repoOwner,
          repoName,
          persistenceFile.path.slice(12),
          githubName,
          githubEmail,
          commitMessage,
          parentFolderPath
        );
      }
    }

    showSuccessMessage('Successfully deleted folder from GitHub!', 1000);
    store.dispatch(actions.updateRefreshFileViewKey());
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to delete the folder.', 1000);
  }
}

export async function performFileRenaming(
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
    type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
    const results: GetContentResponse = await octokit.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: oldGithubFilePath
    });

    type GetContentData = GetResponseDataTypeFromEndpointMethod<typeof octokit.repos.getContent>;
    const files: GetContentData = results.data;

    if (Array.isArray(files)) {
      showWarningMessage(
        'The file you are trying to rename appears to be a folder in Github',
        1000
      );
      return;
    }

    const sha = files.sha;
    const content = (results.data as any).content;
    const regexResult = filePathRegex.exec(newFilePath)!;
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

    store.dispatch(
      actions.updatePersistenceFilePathAndNameByPath(
        '/playground/' + oldFilePath,
        '/playground/' + newFilePath,
        newFileName
      )
    );
    showSuccessMessage('Successfully renamed file in Github!', 1000);
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to rename the file.', 1000);
  }
}

export async function performFolderRenaming(
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
    const persistenceFileArray = store.getState().fileSystem.persistenceFileArray;
    type GetContentResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getContent>;
    type GetContentData = GetResponseDataTypeFromEndpointMethod<typeof octokit.repos.getContent>;

    for (let i = 0; i < persistenceFileArray.length; i++) {
      const persistenceFile = persistenceFileArray[i];
      if (persistenceFile.path?.startsWith('/playground/' + oldFolderPath + '/')) {
        const oldFilePath = parentFolderPath + persistenceFile.path.slice(12);
        const newFilePath =
          parentFolderPath + newFolderPath + persistenceFile.path.slice(12 + oldFolderPath.length);
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

        const regexResult0 = filePathRegex.exec(oldFolderPath)!;
        const oldFolderName = regexResult0[2];
        const regexResult = filePathRegex.exec(newFolderPath)!;
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
          committer: { name: githubName, email: githubEmail },
          author: { name: githubName, email: githubEmail }
        });

        store.dispatch(
          actions.updatePersistenceFolderPathAndNameByPath(
            '/playground/' + oldFolderPath,
            '/playground/' + newFolderPath,
            oldFolderName,
            newFolderName
          )
        );
      }
    }

    showSuccessMessage('Successfully renamed folder in Github!', 1000);
  } catch (err) {
    console.error(err);
    showWarningMessage('Something went wrong when trying to rename the folder.', 1000);
  }
}
