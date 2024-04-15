import {
  GetResponseDataTypeFromEndpointMethod,
  GetResponseTypeFromEndpointMethod
} from '@octokit/types';
import { FSModule } from 'browserfs/dist/node/core/FS';
import { SagaIterator } from 'redux-saga';
import { call, put, select, takeLatest } from 'redux-saga/effects';

import {
  GITHUB_CREATE_FILE,
  GITHUB_DELETE_FILE,
  GITHUB_DELETE_FOLDER,
  GITHUB_OPEN_FILE,
  GITHUB_RENAME_FILE,
  GITHUB_RENAME_FOLDER,
  GITHUB_SAVE_ALL,
  GITHUB_SAVE_FILE,
  GITHUB_SAVE_FILE_AS
} from '../../features/github/GitHubTypes';
import * as GitHubUtils from '../../features/github/GitHubUtils';
import { getGitHubOctokitInstance, performCreatingSave, performFileDeletion, performFileRenaming, performFolderDeletion, performFolderRenaming, performOverwritingSave } from '../../features/github/GitHubUtils';
import { store } from '../../pages/createStore';
import { OverallState } from '../application/ApplicationTypes';
import { LOGIN_GITHUB, LOGOUT_GITHUB } from '../application/types/SessionTypes';
import {
  getPersistenceFile,
  isGithubSyncing,
  retrieveFilesInWorkspaceAsRecord
} from '../fileSystem/FileSystemUtils';
import FileExplorerDialog, { FileExplorerDialogProps } from '../gitHubOverlay/FileExplorerDialog';
import RepositoryDialog, { RepositoryDialogProps } from '../gitHubOverlay/RepositoryDialog';
import { actions } from '../utils/ActionsHelper';
import Constants from '../utils/Constants';
import { promisifyDialog, showSimpleErrorDialog } from '../utils/DialogHelper';
import { dismiss, showMessage, showSuccessMessage, showWarningMessage } from '../utils/notifications/NotificationsHelper';
import { EditorTabState } from '../workspace/WorkspaceTypes';
import { Intent } from '@blueprintjs/core';
import { filePathRegex } from '../utils/PersistenceHelper';

export function* GitHubPersistenceSaga(): SagaIterator {
  yield takeLatest(LOGIN_GITHUB, githubLoginSaga);
  yield takeLatest(LOGOUT_GITHUB, githubLogoutSaga);
  yield takeLatest(GITHUB_OPEN_FILE, githubOpenFile);
  yield takeLatest(GITHUB_SAVE_FILE, githubSaveFile);
  yield takeLatest(GITHUB_SAVE_FILE_AS, githubSaveFileAs);
  yield takeLatest(GITHUB_SAVE_ALL, githubSaveAll);
  yield takeLatest(GITHUB_CREATE_FILE, githubCreateFile);
  yield takeLatest(GITHUB_DELETE_FILE, githubDeleteFile);
  yield takeLatest(GITHUB_DELETE_FOLDER, githubDeleteFolder);
  yield takeLatest(GITHUB_RENAME_FILE, githubRenameFile);
  yield takeLatest(GITHUB_RENAME_FOLDER, githubRenameFolder);
}

function* githubLoginSaga() {
  const githubOauthLoginLink = `https://github.com/login/oauth/authorize?client_id=${Constants.githubClientId}&scope=repo`;
  const windowName = 'Connect With OAuth';
  const windowSpecs = 'height=600,width=400';

  // Create the broadcast channel
  const broadcastChannel = new BroadcastChannel('GitHubOAuthAccessToken');

  broadcastChannel.onmessage = receivedMessage => {
    store.dispatch(actions.setGitHubOctokitObject(receivedMessage.data));
    store.dispatch(actions.setGitHubAccessToken(receivedMessage.data));
    showSuccessMessage('Logged in to GitHub', 1000);
  };

  if (!Constants.githubClientId) {
    // Direct to the callback page to show the error messages
    yield call(window.open, `/callback/github`, windowName, windowSpecs);
  } else {
    // Creates a window directed towards the GitHub oauth link for this app
    // After the app has been approved by the user, it will be redirected to our GitHub callback page
    // We receive the auth token through our broadcast channel
    yield call(window.open, githubOauthLoginLink, windowName, windowSpecs);
  }
}

function* githubLogoutSaga() {
  yield put(actions.removeGitHubOctokitObjectAndAccessToken());
  yield call(store.dispatch, actions.deleteAllGithubSaveInfo());
  yield call(store.dispatch, actions.updateRefreshFileViewKey());
  yield call(showSuccessMessage, `Logged out from GitHub`, 1000);
}

function* githubOpenFile(): any {
  store.dispatch(actions.disableFileSystemContextMenus());
  try {
    const octokit = GitHubUtils.getGitHubOctokitInstance();
    if (octokit === undefined) {
      return;
    }

    type ListForAuthenticatedUserData = GetResponseDataTypeFromEndpointMethod<
      typeof octokit.repos.listForAuthenticatedUser
    >;
    const userRepos: ListForAuthenticatedUserData = yield call(
      async () =>
        await octokit.paginate(octokit.repos.listForAuthenticatedUser, {
          // 100 is the maximum number of results that can be retrieved per page.
          per_page: 100
        })
    );

    const getRepoName = async () =>
      await promisifyDialog<RepositoryDialogProps, string>(RepositoryDialog, resolve => ({
        userRepos: userRepos,
        onSubmit: resolve
      }));
    const repoName = yield call(getRepoName);

    const editorContent = '';

    if (repoName !== '') {
      const pickerType = 'Open';
      const promisifiedDialog = async () =>
        await promisifyDialog<FileExplorerDialogProps, string>(FileExplorerDialog, resolve => ({
          repoName: repoName,
          pickerType: pickerType,
          octokit: octokit,
          editorContent: editorContent,
          onSubmit: resolve
        }));

      yield call(promisifiedDialog);
    }
  } catch (e) {
    yield call(console.log, e);
    yield call(showWarningMessage, "Something went wrong when saving the file", 1000);
  } finally {
    store.dispatch(actions.enableFileSystemContextMenus());
    store.dispatch(actions.updateRefreshFileViewKey());
  }
}

function* githubSaveFile(): any {
  let toastKey: string | undefined;
  try {
    store.dispatch(actions.disableFileSystemContextMenus());
    const octokit = getGitHubOctokitInstance();
    if (octokit === undefined) return;

    type GetAuthenticatedResponse = GetResponseTypeFromEndpointMethod<
      typeof octokit.users.getAuthenticated
    >;
    const authUser: GetAuthenticatedResponse = yield call(octokit.users.getAuthenticated);

    const githubLoginId = authUser.data.login;
    const githubEmail = authUser.data.email;
    const githubName = authUser.data.name;
    const commitMessage = 'Changes made from Source Academy';
    const activeEditorTabIndex: number | null = yield select(
      (state: OverallState) => state.workspaces.playground.activeEditorTabIndex
    );
    if (activeEditorTabIndex === null) {
      throw new Error('No active editor tab found.');
    }
    const editorTabs: EditorTabState[] = yield select(
      (state: OverallState) => state.workspaces.playground.editorTabs
    );
    const content = editorTabs[activeEditorTabIndex].value;
    const filePath = editorTabs[activeEditorTabIndex].filePath;
    if (filePath === undefined) {
      throw new Error('No file found for this editor tab.');
    }
    toastKey = yield call(showMessage, {
      message: `Saving ${filePath} to Github...`,
      timeout: 0,
      intent: Intent.PRIMARY
    });
    console.log("showing message");
    const persistenceFile = getPersistenceFile(filePath);
    if (persistenceFile === undefined) {
      throw new Error('No persistence file found for this filepath');
    }
    const repoName = persistenceFile.repoName || '';
    const parentFolderPath = persistenceFile.parentFolderPath || '';
    if (repoName === undefined || parentFolderPath === undefined) {
      throw new Error(
        'repository name or parentfolderpath not found for this persistencefile: ' + persistenceFile
      );
    }

    yield call(performOverwritingSave,
      octokit,
      githubLoginId,
      repoName,
      filePath.slice(12),
      githubEmail,
      githubName,
      commitMessage,
      content,
      parentFolderPath
    );
  } catch (e) {
    yield call(console.log, e);
    yield call(showWarningMessage, "Something went wrong when saving the file", 1000);
  } finally {
    store.dispatch(actions.enableFileSystemContextMenus());
    if (toastKey){
      dismiss(toastKey);
    }
    store.dispatch(actions.updateRefreshFileViewKey());
  }
}

function* githubSaveFileAs(): any {
  let toastKey: string | undefined;
  try {
    store.dispatch(actions.disableFileSystemContextMenus());
    toastKey = yield call(showMessage, {
      message: `Saving as...`,
      timeout: 0,
      intent: Intent.PRIMARY
    });
    const octokit = GitHubUtils.getGitHubOctokitInstance();
    if (octokit === undefined) {
      return;
    }

    type ListForAuthenticatedUserData = GetResponseDataTypeFromEndpointMethod<
      typeof octokit.repos.listForAuthenticatedUser
    >;

    const userRepos: ListForAuthenticatedUserData = yield call(
      async () =>
        await octokit.paginate(octokit.repos.listForAuthenticatedUser, {
          // 100 is the maximum number of results that can be retrieved per page.
          per_page: 100
        })
    );

    const getRepoName = async () =>
      await promisifyDialog<RepositoryDialogProps, string>(RepositoryDialog, resolve => ({
        userRepos: userRepos,
        onSubmit: resolve
      }));
    const repoName = yield call(getRepoName);

    const activeEditorTabIndex: number | null = yield select(
      (state: OverallState) => state.workspaces.playground.activeEditorTabIndex
    );
    if (activeEditorTabIndex === null) {
      throw new Error('No active editor tab found.');
    }
    const editorTabs: EditorTabState[] = yield select(
      (state: OverallState) => state.workspaces.playground.editorTabs
    );
    const editorContent = editorTabs[activeEditorTabIndex].value;

    if (repoName !== '') {
      const pickerType = 'Save';

      const promisifiedFileExplorer = async () =>
        await promisifyDialog<FileExplorerDialogProps, string>(FileExplorerDialog, resolve => ({
          repoName: repoName,
          pickerType: pickerType,
          octokit: octokit,
          editorContent: editorContent,
          onSubmit: resolve
        }));

      yield call(promisifiedFileExplorer);
    }
  } catch (e) {
    yield call(console.log, e);
    yield call(showWarningMessage, "Something went wrong when saving as", 1000);
  } finally {
    store.dispatch(actions.enableFileSystemContextMenus());
    if (toastKey) {
      dismiss(toastKey);
    }
  }
}

function* githubSaveAll(): any {
  let toastKey: string | undefined;
  try {
    store.dispatch(actions.disableFileSystemContextMenus());
    toastKey = yield call(showMessage, {
      message: `Saving all your files to Github...`,
      timeout: 0,
      intent: Intent.PRIMARY
    });
    const octokit = getGitHubOctokitInstance();
    if (octokit === undefined) return;

    type GetAuthenticatedResponse = GetResponseTypeFromEndpointMethod<
      typeof octokit.users.getAuthenticated
    >;

    if (store.getState().fileSystem.persistenceFileArray.length === 0) {
      // check if there is only one top level folder 
      const fileSystem: FSModule | null = yield select(
        (state: OverallState) => state.fileSystem.inBrowserFileSystem
      );

      // If the file system is not initialised, do nothing.
      if (fileSystem === null) {
        yield call(console.log, 'no filesystem!'); // TODO change to throw new Error
        return;
      }
      const currFiles: Record<string, string> = yield call(
        retrieveFilesInWorkspaceAsRecord,
        'playground',
        fileSystem
      );
      const testPaths: Set<string> = new Set();
        Object.keys(currFiles).forEach(e => {
          const regexResult = filePathRegex.exec(e)!;
          testPaths.add(regexResult![1].slice('/playground/'.length, -1).split('/')[0]); //TODO hardcoded playground
        });
      if (testPaths.size !== 1) {
        yield call(showSimpleErrorDialog, {
          title: 'Unable to Save All',
          contents: (
            "There must be exactly one top level folder present in order to use Save All."
          ),
          label: 'OK'
        });
        return;
      }

      //only one top level folder, proceeding to selection

      type ListForAuthenticatedUserData = GetResponseDataTypeFromEndpointMethod<
        typeof octokit.repos.listForAuthenticatedUser
      >;
      const userRepos: ListForAuthenticatedUserData = yield call(
        async () =>
          await octokit.paginate(octokit.repos.listForAuthenticatedUser, {
            // 100 is the maximum number of results that can be retrieved per page.
            per_page: 100
          })
      );

      const getRepoName = async () =>
        await promisifyDialog<RepositoryDialogProps, string>(RepositoryDialog, resolve => ({
          userRepos: userRepos,
          onSubmit: resolve
        }));
      const repoName = yield call(getRepoName);

      const editorContent = '';

      if (repoName !== '') {
        const pickerType = 'Save All';
        const promisifiedDialog = async () =>
          await promisifyDialog<FileExplorerDialogProps, string>(FileExplorerDialog, resolve => ({
            repoName: repoName,
            pickerType: pickerType,
            octokit: octokit,
            editorContent: editorContent,
            onSubmit: resolve
          }));

        yield call(promisifiedDialog);
      }
    } else {
      const authUser: GetAuthenticatedResponse = yield call(octokit.users.getAuthenticated);

      const githubLoginId = authUser.data.login;
      const githubEmail = authUser.data.email;
      const githubName = authUser.data.name;
      const commitMessage = 'Changes made from Source Academy';
      const fileSystem: FSModule | null = yield select(
        (state: OverallState) => state.fileSystem.inBrowserFileSystem
      );
      // If the file system is not initialised, do nothing.
      if (fileSystem === null) {
        yield call(console.log, 'no filesystem!');
        return;
      }
      yield call(console.log, 'there is a filesystem');
      const currFiles: Record<string, string> = yield call(
        retrieveFilesInWorkspaceAsRecord,
        'playground',
        fileSystem
      );

      yield call(
        GitHubUtils.performMultipleOverwritingSave,
        octokit,
        githubLoginId,
        githubEmail,
        githubName,
        { commitMessage: commitMessage, files: currFiles }
      );
    }
   } catch (e) {
    yield call(console.log, e);
    yield call(showWarningMessage, "Something went wrong when saving all your files");
  } finally {
    store.dispatch(actions.updateRefreshFileViewKey());
    store.dispatch(actions.enableFileSystemContextMenus());
    if (toastKey) {
      dismiss(toastKey);
    }
  }
}

function* githubCreateFile({ payload }: ReturnType<typeof actions.githubCreateFile>): any {
  let toastKey: string | undefined;
  if (!isGithubSyncing()) {
    return;
  }
  try {
    store.dispatch(actions.disableFileSystemContextMenus());
    toastKey = yield call(showMessage, {
      message: `Creating file in Github...`,
      timeout: 0,
      intent: Intent.PRIMARY
    });

    const filePath = payload;

    const octokit = getGitHubOctokitInstance();
    if (octokit === undefined) return;

    type GetAuthenticatedResponse = GetResponseTypeFromEndpointMethod<
      typeof octokit.users.getAuthenticated
    >;
    const authUser: GetAuthenticatedResponse = yield call(octokit.users.getAuthenticated);

    const githubLoginId = authUser.data.login;
    const persistenceFile = getPersistenceFile('');
    if (persistenceFile === undefined) {
      throw new Error('persistencefile not found for this filepath: ' + filePath);
    }
    const repoName = persistenceFile.repoName;
    const githubEmail = authUser.data.email;
    const githubName = authUser.data.name;
    const commitMessage = 'Changes made from Source Academy';
    const content = '';
    const parentFolderPath = persistenceFile.parentFolderPath;
    if (repoName === undefined || parentFolderPath === undefined) {
      throw new Error(
        'repository name or parentfolderpath not found for this persistencefile: ' + persistenceFile
      );
    }

    if (repoName === '') {
      yield call(console.log, 'not synced to github');
      return;
    }

    console.log(repoName);
    yield call(performCreatingSave,
      octokit,
      githubLoginId,
      repoName,
      filePath.slice(12),
      githubEmail,
      githubName,
      commitMessage,
      content,
      parentFolderPath
    );

    yield call(
      store.dispatch,
      actions.addGithubSaveInfo({
        id: '',
        name: '',
        path: filePath,
        repoName: repoName,
        lastSaved: new Date(),
        parentFolderPath: parentFolderPath
      })
    );
  } catch (e) {
    yield call(showWarningMessage, 'Something went wrong when trying to save the file.', 1000);
    yield call(console.log, e);
  } finally {
    yield call(store.dispatch, actions.enableFileSystemContextMenus());
    yield call(store.dispatch, actions.updateRefreshFileViewKey());
    if (toastKey) {
      dismiss(toastKey);
    }
  }
}

function* githubDeleteFile({ payload }: ReturnType<typeof actions.githubDeleteFile>): any {
  let toastKey: string | undefined;
  if (!isGithubSyncing()) {
    return;
  }
  try {
    store.dispatch(actions.disableFileSystemContextMenus());
    toastKey = yield call(showMessage, {
      message: `Deleting file in Github...`,
      timeout: 0,
      intent: Intent.PRIMARY
    });

    const filePath = payload;

    const octokit = getGitHubOctokitInstance();
    if (octokit === undefined) return;

    type GetAuthenticatedResponse = GetResponseTypeFromEndpointMethod<
      typeof octokit.users.getAuthenticated
    >;
    const authUser: GetAuthenticatedResponse = yield call(octokit.users.getAuthenticated);

    const githubLoginId = authUser.data.login;
    const persistenceFile = getPersistenceFile(filePath);
    if (persistenceFile === undefined) {
      throw new Error('persistence file not found for this filepath: ' + filePath);
    }
    const repoName = persistenceFile.repoName;
    const parentFolderPath = persistenceFile.parentFolderPath;
    const githubEmail = authUser.data.email;
    const githubName = authUser.data.name;
    const commitMessage = 'Changes made from Source Academy';
    if (repoName === undefined || parentFolderPath === undefined) {
      throw new Error(
        'repository name or parentfolderpath not found for this persistencefile: ' + persistenceFile
      );
    }

    if (repoName === '') {
      yield call(console.log, 'not synced to github');
      return;
    }

    yield call(performFileDeletion,
      octokit,
      githubLoginId,
      repoName || '',
      filePath.slice(12),
      githubEmail,
      githubName,
      commitMessage,
      parentFolderPath
    );
  } catch (e) {
    yield call(showWarningMessage, 'Something went wrong when trying to save the file.', 1000);
    yield call(console.log, e);
  } finally {
    yield call(store.dispatch, actions.enableFileSystemContextMenus());
    yield call(store.dispatch, actions.updateRefreshFileViewKey());
    if (toastKey) {
      dismiss(toastKey);
    }
  }
}

function* githubDeleteFolder({ payload }: ReturnType<typeof actions.githubDeleteFolder>): any {
  let toastKey: string | undefined;
  if (!isGithubSyncing()) {
    return;
  }
  try {
    store.dispatch(actions.disableFileSystemContextMenus());
    toastKey = yield call(showMessage, {
      message: `Deleting folder in Github...`,
      timeout: 0,
      intent: Intent.PRIMARY
    });

    const filePath = payload;
  
    const octokit = getGitHubOctokitInstance();
    if (octokit === undefined) return;
  
    type GetAuthenticatedResponse = GetResponseTypeFromEndpointMethod<
      typeof octokit.users.getAuthenticated
    >;
    const authUser: GetAuthenticatedResponse = yield call(octokit.users.getAuthenticated);
  
    const githubLoginId = authUser.data.login;
    const persistenceFile = getPersistenceFile('');
    if (persistenceFile === undefined) {
      throw new Error('persistence file not found for this filepath: ' + filePath);
    }
    const repoName = persistenceFile.repoName;
    const parentFolderPath = persistenceFile.parentFolderPath;
    if (repoName === undefined || parentFolderPath === undefined) {
      throw new Error(
        'repository name or parentfolderpath not found for this persistencefile: ' + persistenceFile
      );
    }
    const githubEmail = authUser.data.email;
    const githubName = authUser.data.name;
    const commitMessage = 'Changes made from Source Academy';
  
    if (repoName === '') {
      yield call(console.log, 'not synced to github');
      return;
    }
  
    yield call(performFolderDeletion,
      octokit,
      githubLoginId,
      repoName || '',
      filePath.slice(12),
      githubEmail,
      githubName,
      commitMessage,
      parentFolderPath
    );
  } catch (e) {
    yield call(showWarningMessage, 'Something went wrong when trying to save the file.', 1000);
    yield call(console.log, e);
  } finally {
    yield call(store.dispatch, actions.enableFileSystemContextMenus());
    yield call(store.dispatch, actions.updateRefreshFileViewKey());
    if(toastKey) {
      dismiss(toastKey);
    }
  }
}

function* githubRenameFile({ payload }: ReturnType<typeof actions.githubRenameFile>): any {
  let toastKey: string | undefined;
  if (!isGithubSyncing()) {
    return;
  }
  try {
    store.dispatch(actions.disableFileSystemContextMenus());
    toastKey = yield call(showMessage, {
      message: `Renaming file in Github...`,
      timeout: 0,
      intent: Intent.PRIMARY
    });

    const newFilePath = payload.newFilePath;
    const oldFilePath = payload.oldFilePath;

    const octokit = getGitHubOctokitInstance();
    if (octokit === undefined) return;

    type GetAuthenticatedResponse = GetResponseTypeFromEndpointMethod<
      typeof octokit.users.getAuthenticated
    >;
    const authUser: GetAuthenticatedResponse = yield call(octokit.users.getAuthenticated);

    const githubLoginId = authUser.data.login;
    const persistenceFile = getPersistenceFile(oldFilePath);
    if (persistenceFile === undefined) {
      throw new Error('persistence file not found for this filepath: ' + oldFilePath);
    }
    const repoName = persistenceFile.repoName;
    const parentFolderPath = persistenceFile.parentFolderPath;
    if (repoName === undefined || parentFolderPath === undefined) {
      throw new Error(
        'repository name or parentfolderpath not found for this persistencefile: ' + persistenceFile
      );
    }
    const githubEmail = authUser.data.email;
    const githubName = authUser.data.name;
    const commitMessage = 'Changes made from Source Academy';

    if (repoName === '' || repoName === undefined) {
      yield call(console.log, 'not synced to github');
      return;
    }

    yield call(performFileRenaming,
      octokit,
      githubLoginId,
      repoName,
      oldFilePath.slice(12),
      githubName,
      githubEmail,
      commitMessage,
      newFilePath.slice(12),
      parentFolderPath
    );
  } catch (e) {
    yield call(showWarningMessage, 'Something went wrong when trying to save the file.', 1000);
    yield call(console.log, e);
  } finally {
    yield call(store.dispatch, actions.enableFileSystemContextMenus());
    yield call(store.dispatch, actions.updateRefreshFileViewKey());
    if (toastKey) {
      dismiss(toastKey);
    }
  }
}

function* githubRenameFolder({ payload }: ReturnType<typeof actions.githubRenameFile>): any {
  let toastKey: string | undefined;
  if (!isGithubSyncing()) {
    return;
  }
  try {
    store.dispatch(actions.disableFileSystemContextMenus());
    toastKey = yield call(showMessage, {
      message: `Renaming folder in Github...`,
      timeout: 0,
      intent: Intent.PRIMARY
    });

    const newFilePath = payload.newFilePath;
    const oldFilePath = payload.oldFilePath;

    const octokit = getGitHubOctokitInstance();
    if (octokit === undefined) return;

    type GetAuthenticatedResponse = GetResponseTypeFromEndpointMethod<
      typeof octokit.users.getAuthenticated
    >;
    const authUser: GetAuthenticatedResponse = yield call(octokit.users.getAuthenticated);

    const githubLoginId = authUser.data.login;
    const persistenceFile = getPersistenceFile('');
    if (persistenceFile === undefined) {
      throw new Error('persistence file not found for this filepath: ' + oldFilePath);
    }
    const repoName = persistenceFile.repoName;
    const parentFolderPath = persistenceFile.parentFolderPath;
    if (repoName === undefined || parentFolderPath === undefined) {
      throw new Error(
        'repository name or parentfolderpath not found for this persistencefile: ' + persistenceFile
      );
    }
    const githubEmail = authUser.data.email;
    const githubName = authUser.data.name;
    const commitMessage = 'Changes made from Source Academy';

    if (repoName === '' || repoName === undefined) {
      yield call(console.log, 'not synced to github');
      return;
    }

    yield call(performFolderRenaming,
      octokit,
      githubLoginId,
      repoName,
      oldFilePath.slice(12),
      githubName,
      githubEmail,
      commitMessage,
      newFilePath.slice(12),
      parentFolderPath
    );
  } catch (e) {
    yield call(showWarningMessage, 'Something went wrong when trying to save the file.', 1000);
    yield call(console.log, e);
  } finally {
    yield call(store.dispatch, actions.enableFileSystemContextMenus());
    yield call(store.dispatch, actions.updateRefreshFileViewKey());
    if(toastKey) {
      dismiss(toastKey);
    }
  }
}

export default GitHubPersistenceSaga;
