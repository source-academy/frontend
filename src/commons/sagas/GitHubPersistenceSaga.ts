import {
  GetResponseDataTypeFromEndpointMethod,
  GetResponseTypeFromEndpointMethod
} from '@octokit/types';
import { SagaIterator } from 'redux-saga';
import { call, put, select, takeLatest } from 'redux-saga/effects';

import {
  GITHUB_OPEN_FILE,
  GITHUB_SAVE_FILE,
  GITHUB_SAVE_FILE_AS
} from '../../features/github/GitHubTypes';
import * as GitHubUtils from '../../features/github/GitHubUtils';
import { getGitHubOctokitInstance } from '../../features/github/GitHubUtils';
import { store } from '../../pages/createStore';
import { OverallState } from '../application/ApplicationTypes';
import { LOGIN_GITHUB, LOGOUT_GITHUB } from '../application/types/SessionTypes';
import FileExplorerDialog, { FileExplorerDialogProps } from '../gitHubOverlay/FileExplorerDialog';
import RepositoryDialog, { RepositoryDialogProps } from '../gitHubOverlay/RepositoryDialog';
import { actions } from '../utils/ActionsHelper';
import Constants from '../utils/Constants';
import { promisifyDialog } from '../utils/DialogHelper';
import { showSuccessMessage, showWarningMessage } from '../utils/NotificationsHelper';
import { EditorTabState } from '../workspace/WorkspaceTypes';

export function* GitHubPersistenceSaga(): SagaIterator {
  yield takeLatest(LOGIN_GITHUB, githubLoginSaga);
  yield takeLatest(LOGOUT_GITHUB, githubLogoutSaga);

  yield takeLatest(GITHUB_OPEN_FILE, githubOpenFile);
  yield takeLatest(GITHUB_SAVE_FILE, githubSaveFile);
  yield takeLatest(GITHUB_SAVE_FILE_AS, githubSaveFileAs);
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
  if (store.getState() && store.getState().workspaces.githubAssessment.hasUnsavedChanges) {
    yield call(showWarningMessage, 'You have unsaved changes!', 2000);
    return;
  }

  yield put(actions.removeGitHubOctokitObjectAndAccessToken());
  yield call(showSuccessMessage, `Logged out from GitHub`, 1000);
}

function* githubOpenFile(action: ReturnType<typeof actions.githubOpenFile>): any {
  const isStories = action.payload;

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

  let repoName = Constants.storiesRepoName;

  if (!isStories) {
    const getRepoName = async () =>
      await promisifyDialog<RepositoryDialogProps, string>(RepositoryDialog, resolve => ({
        userRepos: userRepos,
        onSubmit: resolve
      }));
    repoName = yield call(getRepoName);
  }

  const editorContent = '';

  if (repoName !== '') {
    const pickerType = 'Open';
    const promisifiedDialog = async () =>
      await promisifyDialog<FileExplorerDialogProps, string>(FileExplorerDialog, resolve => ({
        repoName: repoName,
        pickerType: pickerType,
        octokit: octokit,
        editorContent: editorContent,
        onSubmit: resolve,
        isStories: isStories
      }));

    yield call(promisifiedDialog);
  }
}

function* githubSaveFile(action: ReturnType<typeof actions.githubSaveFile>): any {
  const isStories = action.payload;

  const octokit = getGitHubOctokitInstance();
  if (octokit === undefined) return;

  type GetAuthenticatedResponse = GetResponseTypeFromEndpointMethod<
    typeof octokit.users.getAuthenticated
  >;
  const authUser: GetAuthenticatedResponse = yield call(octokit.users.getAuthenticated);

  const githubLoginId = authUser.data.login;
  const repoName = isStories
    ? store.getState().stories.githubSaveInfo.repoName
    : store.getState().playground.githubSaveInfo.repoName;
  const filePath = isStories
    ? store.getState().stories.githubSaveInfo.filePath
    : store.getState().playground.githubSaveInfo.filePath;
  const githubEmail = authUser.data.email;
  const githubName = authUser.data.name;
  const commitMessage = 'Changes made from Source Academy';

  let content = '';
  if (isStories) {
    content = store.getState().stories.content;
  } else {
    const activeEditorTabIndex: number | null = yield select(
      (state: OverallState) => state.workspaces.playground.activeEditorTabIndex
    );
    if (activeEditorTabIndex === null) {
      throw new Error('No active editor tab found.');
    }
    const editorTabs: EditorTabState[] = yield select(
      (state: OverallState) => state.workspaces.playground.editorTabs
    );
    content = editorTabs[activeEditorTabIndex].value;
  }

  GitHubUtils.performOverwritingSave(
    octokit,
    githubLoginId,
    repoName,
    filePath,
    githubEmail,
    githubName,
    commitMessage,
    content,
    isStories
  );
}

function* githubSaveFileAs(action: ReturnType<typeof actions.githubSaveFileAs>): any {
  const isStories = action.payload;

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

  let repoName = Constants.storiesRepoName;

  if (!isStories) {
    const getRepoName = async () =>
      await promisifyDialog<RepositoryDialogProps, string>(RepositoryDialog, resolve => ({
        userRepos: userRepos,
        onSubmit: resolve
      }));
    repoName = yield call(getRepoName);
  }

  let editorContent = '';
  if (isStories) {
    editorContent = store.getState().stories.content;
  } else {
    const activeEditorTabIndex: number | null = yield select(
      (state: OverallState) => state.workspaces.playground.activeEditorTabIndex
    );
    if (activeEditorTabIndex === null) {
      throw new Error('No active editor tab found.');
    }
    const editorTabs: EditorTabState[] = yield select(
      (state: OverallState) => state.workspaces.playground.editorTabs
    );
    editorContent = editorTabs[activeEditorTabIndex].value;
  }

  if (repoName !== '') {
    const pickerType = 'Save';

    const promisifiedFileExplorer = async () =>
      await promisifyDialog<FileExplorerDialogProps, string>(FileExplorerDialog, resolve => ({
        repoName: repoName,
        pickerType: pickerType,
        octokit: octokit,
        editorContent: editorContent,
        onSubmit: resolve,
        isStories
      }));

    yield call(promisifiedFileExplorer);
  }
}

export default GitHubPersistenceSaga;
