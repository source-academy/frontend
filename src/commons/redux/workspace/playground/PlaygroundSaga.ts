import type { FSModule } from 'browserfs/dist/node/core/FS';
import { Chapter, Variant } from 'js-slang/dist/types';
import { compressToEncodedURIComponent } from 'lz-string';
import * as qs from 'query-string';
import { call, delay, put, race, select } from 'redux-saga/effects';
import { retrieveFilesInWorkspaceAsRecord } from 'src/commons/fileSystem/utils';
import Constants from 'src/commons/utils/Constants';
import {
  showSuccessMessage,
  showWarningMessage
} from 'src/commons/utils/notifications/NotificationsHelper';

import { OverallState } from '../../AllTypes';
import { combineSagaHandlers } from '../../utils';
import { selectWorkspace } from '../../utils/Selectors';
import { PlaygroundState } from '../WorkspaceReduxTypes';
import { EditorTabState } from '../WorkspaceStateTypes';
import { playgroundActions, playgroundSagaActions } from './PlaygroundRedux';

export const PlaygroundSaga = combineSagaHandlers(playgroundSagaActions, {
  generateLzString: updateQueryString,
  shortenUrl: function* ({ payload: keyword }) {
    const { queryString }: PlaygroundState = yield selectWorkspace('playground');
    const errorMsg = 'ERROR';

    let resp, timeout;

    //we catch and move on if there are errors (plus have a timeout in case)
    try {
      const { result, hasTimedOut } = yield race({
        result: call(shortenURLRequest, queryString!, keyword),
        hasTimedOut: delay(10000)
      });

      resp = result;
      timeout = hasTimedOut;
    } catch (_) {}

    if (!resp || timeout) {
      yield put(playgroundActions.updateShortURL(errorMsg));
      return yield call(showWarningMessage, 'Something went wrong trying to create the link.');
    }

    if (resp.status !== 'success' && !resp.shorturl) {
      yield put(playgroundActions.updateShortURL(errorMsg));
      return yield call(showWarningMessage, resp.message);
    }

    if (resp.status !== 'success') {
      yield call(showSuccessMessage, resp.message);
    }
    yield put(playgroundActions.updateShortURL(Constants.urlShortenerBase + resp.url.keyword));
  }
});

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

export function* updateQueryString() {
  const {
    editorState: { activeEditorTabIndex, editorTabs, isFolderModeEnabled }
  }: PlaygroundState = yield selectWorkspace('playground');

  const fileSystem: FSModule = yield select(
    (state: OverallState) => state.fileSystem.inBrowserFileSystem
  );
  const files: Record<string, string> = yield call(
    retrieveFilesInWorkspaceAsRecord,
    'playground',
    fileSystem
  );

  const editorTabFilePaths = editorTabs
    .map((editorTab: EditorTabState) => editorTab.filePath)
    .filter((filePath): filePath is string => filePath !== undefined);

  const chapter: Chapter = yield select(
    (state: OverallState) => state.workspaces.playground.context.chapter
  );
  const variant: Variant = yield select(
    (state: OverallState) => state.workspaces.playground.context.variant
  );
  // const external: ExternalLibraryName = yield select(
  //   (state: OverallState) => state.workspaces.playground.externalLibrary
  // );
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
    exec: execTime
  });
  yield put(playgroundActions.changeQueryString(newQueryString));
}
