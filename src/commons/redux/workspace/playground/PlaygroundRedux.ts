import { createAction,PayloadAction } from "@reduxjs/toolkit";
import { FSModule } from "browserfs/dist/node/core/FS";
import { Chapter, Variant } from "js-slang/dist/types";
import { compressToEncodedURIComponent } from "lz-string";
import * as qs from 'query-string';
import { SagaIterator } from "redux-saga";
import { call, delay, put, race, select } from "redux-saga/effects";
import { defaultEditorValue, defaultLanguageConfig, getDefaultFilePath, OverallState, SALanguage } from "src/commons/application/ApplicationTypes";
import { ExternalLibraryName } from "src/commons/application/types/ExternalTypes";
import { retrieveFilesInWorkspaceAsRecord } from "src/commons/fileSystem/utils";
import { safeTakeEvery as takeEvery } from "src/commons/sagas/SafeEffects";
import Constants from "src/commons/utils/Constants";
import { showSuccessMessage, showWarningMessage } from "src/commons/utils/notifications/NotificationsHelper";
import { EditorTabState } from "src/commons/workspace/WorkspaceTypes";
import { GitHubSaveInfo } from "src/features/github/GitHubTypes";
import { PersistenceFile } from "src/features/persistence/PersistenceTypes";

import { createPlaygroundSlice, getDefaultPlaygroundState, PlaygroundWorkspaceState } from "./PlaygroundBase";

export type PlaygroundState = PlaygroundWorkspaceState & {
  readonly githubSaveInfo: GitHubSaveInfo
  readonly languageConfig: SALanguage
  readonly persistenceFile?: PersistenceFile
  readonly queryString?: string
  readonly shortURL?: string
}

export const defaultPlayground: PlaygroundState = {
  ...getDefaultPlaygroundState([{
    breakpoints: [],
    filePath: getDefaultFilePath('playground'),
    highlightedLines: [],
    value: defaultEditorValue
  }]),
  githubSaveInfo: { repoName: '', filePath: '' },
  languageConfig: defaultLanguageConfig
}

export const { actions: playgroundWorkspaceActions, reducer: playgroundReducer } = createPlaygroundSlice('playground', defaultPlayground, {
  changeQueryString(state, { payload }: PayloadAction<string>) {
    state.queryString = payload
  },
  playgroundUpdateGithubSaveInfo(state, { payload }: PayloadAction<GitHubSaveInfo>) {
    state.githubSaveInfo = payload
  },
  playgroundUpdatePersistenceFile(state, { payload }: PayloadAction<PersistenceFile | undefined>) {
    state.persistenceFile = payload
  },
  playgroundUpdateLanguageConfig(state, { payload }: PayloadAction<SALanguage>) {
    state.languageConfig = payload
  },
  updateShortURL(state, { payload }: PayloadAction<string>) {
    state.shortURL = payload
  }
})

export const playgroundActions = {
  ...playgroundWorkspaceActions,
  generateLzString: createAction('playground/generateLzString'),
  shortenUrl: createAction('playground/shortenURL', (url: string) => ({ payload: url }))
}

export function* playgroundSaga(): SagaIterator {
  yield takeEvery(playgroundActions.generateLzString, updateQueryString)

  yield takeEvery(playgroundActions.shortenUrl, function* ({ payload: keyword }): SagaIterator {
    const queryString = yield select((state: OverallState) => state.playground.queryString);
    const errorMsg = 'ERROR';

    let resp, timeout;

    //we catch and move on if there are errors (plus have a timeout in case)
    try {
      const { result, hasTimedOut } = yield race({
        result: call(shortenURLRequest, queryString, keyword),
        hasTimedOut: delay(10000)
      });

      resp = result;
      timeout = hasTimedOut;
    } catch (_) {}

    if (!resp || timeout) {
      yield put(playgroundWorkspaceActions.updateShortURL(errorMsg));
      return yield call(showWarningMessage, 'Something went wrong trying to create the link.');
    }

    if (resp.status !== 'success' && !resp.shorturl) {
      yield put(playgroundActions.updateShortURL(errorMsg));
      return yield call(showWarningMessage, resp.message);
    }

    if (resp.status !== 'success') {
      yield call(showSuccessMessage, resp.message);
    }
    yield put(playgroundWorkspaceActions.updateShortURL(Constants.urlShortenerBase + resp.url.keyword));
  })
}

function* updateQueryString() {
  const isFolderModeEnabled: boolean = yield select(
    (state: OverallState) => state.workspaces.playground.isFolderModeEnabled
  );
  const fileSystem: FSModule = yield select(
    (state: OverallState) => state.fileSystem.inBrowserFileSystem
  );
  const files: Record<string, string> = yield call(
    retrieveFilesInWorkspaceAsRecord,
    'playground',
    fileSystem
  );
  const editorTabs: EditorTabState[] = yield select(
    (state: OverallState) => state.workspaces.playground.editorTabs
  );
  const editorTabFilePaths = editorTabs
    .map((editorTab: EditorTabState) => editorTab.filePath)
    .filter((filePath): filePath is string => filePath !== undefined);
  const activeEditorTabIndex: number | null = yield select(
    (state: OverallState) => state.workspaces.playground.activeEditorTabIndex
  );
  const chapter: Chapter = yield select(
    (state: OverallState) => state.workspaces.playground.context.chapter
  );
  const variant: Variant = yield select(
    (state: OverallState) => state.workspaces.playground.context.variant
  );
  const external: ExternalLibraryName = yield select(
    (state: OverallState) => state.workspaces.playground.externalLibrary
  );
  const execTime: number = yield select(
    (state: OverallState) => state.workspaces.playground.execTime
  );
  const newQueryString = qs.stringify({
    isFolder: isFolderModeEnabled,
    files: compressToEncodedURIComponent(qs.stringify(files)),
    tabs: editorTabFilePaths.map(compressToEncodedURIComponent),
    tabIdx: activeEditorTabIndex,
    chap: chapter,
    variant,
    ext: external,
    exec: execTime
  });
  yield put(playgroundWorkspaceActions.changeQueryString(newQueryString));
}


/**
 * Gets short url from microservice
 * @returns {(Response|null)} Response if successful, otherwise null.
 */
export async function shortenURLRequest(
  queryString: string,
  keyword: string
): Promise<Response | null> {
  const url = `${window.location.protocol}//${window.location.host}/playground#${queryString}`;

  const params = {
    signature: Constants.urlShortenerSignature,
    action: 'shorturl',
    format: 'json',
    keyword,
    url
  };
  const fetchOpts: RequestInit = {
    method: 'POST',
    body: Object.entries(params).reduce((formData, [k, v]) => {
      formData.append(k, v!);
      return formData;
    }, new FormData())
  };

  const resp = await fetch(`${Constants.urlShortenerBase}yourls-api.php`, fetchOpts);
  if (!resp || !resp.ok) {
    return null;
  }

  const res = await resp.json();
  return res;
}

