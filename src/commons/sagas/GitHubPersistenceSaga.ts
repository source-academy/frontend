import {
  GetResponseDataTypeFromEndpointMethod,
  GetResponseTypeFromEndpointMethod
} from '@octokit/types';
import { FSModule } from 'browserfs/dist/node/core/FS';
import { SagaIterator } from 'redux-saga';
import { call, put, select, takeLatest } from 'redux-saga/effects';

import {
  GITHUB_OPEN_FILE,
  GITHUB_SAVE_ALL,
  GITHUB_SAVE_FILE,
  GITHUB_SAVE_FILE_AS,
  GITHUB_CREATE_FILE,
  GITHUB_DELETE_FILE,
  GITHUB_DELETE_FOLDER,
  GITHUB_RENAME_FILE,
  GITHUB_RENAME_FOLDER,
} from '../../features/github/GitHubTypes';
import * as GitHubUtils from '../../features/github/GitHubUtils';
import { getGitHubOctokitInstance } from '../../features/github/GitHubUtils';
import { store } from '../../pages/createStore';
import { OverallState } from '../application/ApplicationTypes';
import { LOGIN_GITHUB, LOGOUT_GITHUB } from '../application/types/SessionTypes';
import { getGithubSaveInfo, retrieveFilesInWorkspaceAsRecord } from '../fileSystem/FileSystemUtils';
import FileExplorerDialog, { FileExplorerDialogProps } from '../gitHubOverlay/FileExplorerDialog';
import RepositoryDialog, { RepositoryDialogProps } from '../gitHubOverlay/RepositoryDialog';
import { actions } from '../utils/ActionsHelper';
import Constants from '../utils/Constants';
import { promisifyDialog } from '../utils/DialogHelper';
import { showSuccessMessage } from '../utils/notifications/NotificationsHelper';
import { EditorTabState } from '../workspace/WorkspaceTypes';

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
  yield call(showSuccessMessage, `Logged out from GitHub`, 1000);
}

function* githubOpenFile(): any {
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
}

function* githubSaveFile(): any {
  const octokit = getGitHubOctokitInstance();
  if (octokit === undefined) return;

  type GetAuthenticatedResponse = GetResponseTypeFromEndpointMethod<
    typeof octokit.users.getAuthenticated
  >;
  const authUser: GetAuthenticatedResponse = yield call(octokit.users.getAuthenticated);

  const githubLoginId = authUser.data.login;
  const githubSaveInfo = getGithubSaveInfo();
  const repoName = githubSaveInfo.repoName;
  const filePath = githubSaveInfo.filePath || '';
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

  GitHubUtils.performOverwritingSave(
    octokit,
    githubLoginId,
    repoName || '',
    filePath.slice(12),
    githubEmail,
    githubName,
    commitMessage,
    content
  );

  store.dispatch(actions.updateRefreshFileViewKey());
}

function* githubSaveFileAs(): any {
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
  
}

function* githubSaveAll(): any {
  const octokit = getGitHubOctokitInstance();
  if (octokit === undefined) return;

  type GetAuthenticatedResponse = GetResponseTypeFromEndpointMethod<
    typeof octokit.users.getAuthenticated
  >;

  if (store.getState().fileSystem.persistenceFileArray.length === 0) {
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
      const pickerType = 'Saveall';
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
  }




  const authUser: GetAuthenticatedResponse = yield call(octokit.users.getAuthenticated);
  
  const githubLoginId = authUser.data.login;
  const githubSaveInfo = getGithubSaveInfo();
  // console.log(githubSaveInfo);
  const repoName = githubSaveInfo.repoName;
  const githubEmail = authUser.data.email;
  const githubName = authUser.data.name;
  const commitMessage = 'Changes made from Source Academy';
  const fileSystem: FSModule | null = yield select(
    (state: OverallState) => state.fileSystem.inBrowserFileSystem
  );
  // If the file system is not initialised, do nothing.
  if (fileSystem === null) {
    yield call(console.log, "no filesystem!");
    return;
  }
  yield call(console.log, "there is a filesystem");
  const currFiles: Record<string, string> = yield call(retrieveFilesInWorkspaceAsRecord, "playground", fileSystem);
  const modifiedcurrFiles : Record<string, string> = {};
  for (const filePath of Object.keys(currFiles)) {
    modifiedcurrFiles[filePath.slice(12)] = currFiles[filePath];
  }
  console.log(modifiedcurrFiles);

  yield call(GitHubUtils.performMultipleOverwritingSave,
      octokit,
      githubLoginId,
      repoName || '',
      githubEmail,
      githubName,
      { commitMessage: commitMessage, files: modifiedcurrFiles});
  
  store.dispatch(actions.updateRefreshFileViewKey());
}

function* githubCreateFile({ payload }: ReturnType<typeof actions.githubCreateFile>): any {
  //yield call(store.dispatch, actions.disableFileSystemContextMenus());

  const filePath = payload;

  const octokit = getGitHubOctokitInstance();
  if (octokit === undefined) return;

  type GetAuthenticatedResponse = GetResponseTypeFromEndpointMethod<
    typeof octokit.users.getAuthenticated
  >;
  const authUser: GetAuthenticatedResponse = yield call(octokit.users.getAuthenticated);

  const githubLoginId = authUser.data.login;
  const repoName = getGithubSaveInfo().repoName;
  const githubEmail = authUser.data.email;
  const githubName = authUser.data.name;
  const commitMessage = 'Changes made from Source Academy';
  const content = ''

  if (repoName === '') {
    yield call(console.log, "not synced to github");
    return;
  }

  GitHubUtils.performCreatingSave(
    octokit,
    githubLoginId,
    repoName || '',
    filePath.slice(12),
    githubEmail,
    githubName,
    commitMessage,
    content
  );
  
  yield call(store.dispatch, actions.addGithubSaveInfo({
    repoName: repoName,
    filePath: filePath,
    lastSaved: new Date()
  }))
  yield call(store.dispatch, actions.enableFileSystemContextMenus());
  yield call(store.dispatch, actions.updateRefreshFileViewKey());
}

function* githubDeleteFile({ payload }: ReturnType<typeof actions.githubDeleteFile>): any {
  //yield call(store.dispatch, actions.disableFileSystemContextMenus());

  const filePath = payload;

  const octokit = getGitHubOctokitInstance();
  if (octokit === undefined) return;

  type GetAuthenticatedResponse = GetResponseTypeFromEndpointMethod<
    typeof octokit.users.getAuthenticated
  >;
  const authUser: GetAuthenticatedResponse = yield call(octokit.users.getAuthenticated);

  const githubLoginId = authUser.data.login;
  const repoName = getGithubSaveInfo().repoName;
  const githubEmail = authUser.data.email;
  const githubName = authUser.data.name;
  const commitMessage = 'Changes made from Source Academy';


  if (repoName === '') {
    yield call(console.log, "not synced to github");
    return;
  }

  GitHubUtils.performFileDeletion(
    octokit,
    githubLoginId,
    repoName || '',
    filePath.slice(12),
    githubEmail,
    githubName,
    commitMessage,
  );
  
  yield call(store.dispatch, actions.enableFileSystemContextMenus());
  yield call(store.dispatch, actions.updateRefreshFileViewKey());
}

function* githubDeleteFolder({ payload }: ReturnType<typeof actions.githubDeleteFolder>): any {
  //yield call(store.dispatch, actions.disableFileSystemContextMenus());

  const filePath = payload;

  const octokit = getGitHubOctokitInstance();
  if (octokit === undefined) return;

  type GetAuthenticatedResponse = GetResponseTypeFromEndpointMethod<
    typeof octokit.users.getAuthenticated
  >;
  const authUser: GetAuthenticatedResponse = yield call(octokit.users.getAuthenticated);

  const githubLoginId = authUser.data.login;
  const repoName = getGithubSaveInfo().repoName;
  const githubEmail = authUser.data.email;
  const githubName = authUser.data.name;
  const commitMessage = 'Changes made from Source Academy';

  if (repoName === '') {
    yield call(console.log, "not synced to github");
    return;
  }

  GitHubUtils.performFolderDeletion(
    octokit,
    githubLoginId,
    repoName || '',
    filePath.slice(12),
    githubEmail,
    githubName,
    commitMessage
  );

  yield call(store.dispatch, actions.enableFileSystemContextMenus());
  yield call(store.dispatch, actions.updateRefreshFileViewKey());
}

function* githubRenameFile({ payload }: ReturnType<typeof actions.githubRenameFile>): any {
  //yield call(store.dispatch, actions.disableFileSystemContextMenus());

  const newFilePath = payload.newFilePath;
  const oldFilePath = payload.oldFilePath;

  const octokit = getGitHubOctokitInstance();
  if (octokit === undefined) return;

  type GetAuthenticatedResponse = GetResponseTypeFromEndpointMethod<
    typeof octokit.users.getAuthenticated
  >;
  const authUser: GetAuthenticatedResponse = yield call(octokit.users.getAuthenticated);

  const githubLoginId = authUser.data.login;
  const githubSaveInfo = getGithubSaveInfo();
  const repoName = githubSaveInfo.repoName;
  const githubEmail = authUser.data.email;
  const githubName = authUser.data.name;
  const commitMessage = 'Changes made from Source Academy';

  if (repoName === '' || repoName === undefined) {
    yield call(console.log, "not synced to github");
    return;
  }

  GitHubUtils.performFileRenaming(
    octokit,
    githubLoginId,
    repoName,
    oldFilePath.slice(12),
    githubName,
    githubEmail,
    commitMessage,
    newFilePath.slice(12)
  )

  yield call(store.dispatch, actions.enableFileSystemContextMenus());
  yield call(store.dispatch, actions.updateRefreshFileViewKey());
}

function* githubRenameFolder({ payload }: ReturnType<typeof actions.githubRenameFile>): any {
  //yield call(store.dispatch, actions.disableFileSystemContextMenus());

  const newFilePath = payload.newFilePath;
  const oldFilePath = payload.oldFilePath;

  const octokit = getGitHubOctokitInstance();
  if (octokit === undefined) return;

  type GetAuthenticatedResponse = GetResponseTypeFromEndpointMethod<
    typeof octokit.users.getAuthenticated
  >;
  const authUser: GetAuthenticatedResponse = yield call(octokit.users.getAuthenticated);

  const githubLoginId = authUser.data.login;
  const githubSaveInfo = getGithubSaveInfo();
  const repoName = githubSaveInfo.repoName;
  const githubEmail = authUser.data.email;
  const githubName = authUser.data.name;
  const commitMessage = 'Changes made from Source Academy';

  if (repoName === '' || repoName === undefined) {
    yield call(console.log, "not synced to github");
    return;
  }

  GitHubUtils.performFolderRenaming(
    octokit,
    githubLoginId,
    repoName,
    oldFilePath.slice(12),
    githubName,
    githubEmail,
    commitMessage,
    newFilePath.slice(12)
  )

  yield call(store.dispatch, actions.enableFileSystemContextMenus());
  yield call(store.dispatch, actions.updateRefreshFileViewKey());
}

export default GitHubPersistenceSaga;
