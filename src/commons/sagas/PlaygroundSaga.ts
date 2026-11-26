import type { FSModule } from 'browserfs/dist/node/core/FS';
import { compressToEncodedURIComponent } from 'lz-string';
import qs from 'query-string';
import { call, delay, put, race, select } from 'redux-saga/effects';
import { languageShareFields } from 'src/features/directory/languageIdCodec';

import PlaygroundActions from '../../features/playground/PlaygroundActions';
import type { OverallState } from '../application/ApplicationTypes';
import { retrieveFilesInWorkspaceAsRecord } from '../fileSystem/utils';
import { combineSagaHandlers } from '../redux/utils';
import Constants from '../utils/Constants';
import { showSuccessMessage, showWarningMessage } from '../utils/notifications/NotificationsHelper';
import { selectWorkspace } from './SafeEffects';

const PlaygroundSaga = combineSagaHandlers({
  [PlaygroundActions.generateLzString.type]: updateQueryString,
  [PlaygroundActions.shortenURL.type]: function* ({ payload: keyword }) {
    const queryString = yield select((state: OverallState) => state.playground.queryString);
    const errorMsg = 'ERROR';

    let resp, timeout;

    //we catch and move on if there are errors (plus have a timeout in case)
    try {
      const { result, hasTimedOut } = yield race({
        result: call(shortenURLRequest, queryString, keyword),
        hasTimedOut: delay(10000),
      });

      resp = result;
      timeout = hasTimedOut;
    } catch (_) {}

    if (!resp || timeout) {
      yield put(PlaygroundActions.updateShortURL(errorMsg));
      return yield call(showWarningMessage, 'Something went wrong trying to create the link.');
    }

    if (resp.status !== 'success' && !resp.shorturl) {
      yield put(PlaygroundActions.updateShortURL(errorMsg));
      return yield call(showWarningMessage, resp.message);
    }

    if (resp.status !== 'success') {
      yield call(showSuccessMessage, resp.message);
    }
    yield put(PlaygroundActions.updateShortURL(Constants.urlShortenerBase + resp.url.keyword));
  },
});

export default PlaygroundSaga;

function* updateQueryString() {
  const fileSystem: FSModule = yield select(
    (state: OverallState) => state.fileSystem.inBrowserFileSystem,
  );
  const files: Record<string, string> = yield call(
    retrieveFilesInWorkspaceAsRecord,
    'playground',
    fileSystem,
  );

  const { activeEditorTabIndex, editorTabs, isFolderModeEnabled } =
    yield* selectWorkspace('playground');

  const { selectedLanguageId, selectedEvaluatorId } = yield select(
    (state: OverallState) => state.languageDirectory,
  );

  // Decompose the compound directory ids (e.g. "python2" / "python2Pvml") into the three
  // fields a share link exposes, instead of leaking the raw id-concatenation convention.
  const languageFields = languageShareFields(selectedLanguageId, selectedEvaluatorId);

  const editorTabFilePaths = editorTabs
    .map(editorTab => editorTab.filePath)
    .filter((filePath): filePath is string => filePath !== undefined);

  const newQueryString = qs.stringify({
    isFolder: isFolderModeEnabled,
    files: compressToEncodedURIComponent(qs.stringify(files)),
    tabs: editorTabFilePaths.map(compressToEncodedURIComponent),
    tabIdx: activeEditorTabIndex,
    // `chap` is deliberately not encoded: it always has a real default value, so it would win
    // on decode and shadow `language`.
    ...languageFields,
  });
  yield put(PlaygroundActions.changeQueryString(newQueryString));
}

/**
 * Gets short url from microservice
 * @returns {(Response|null)} Response if successful, otherwise null.
 */
export async function shortenURLRequest(
  queryString: string,
  keyword: string,
): Promise<Response | null> {
  const url = `${window.location.protocol}//${window.location.host}/playground#${queryString}`;

  const params = {
    signature: Constants.urlShortenerSignature,
    action: 'shorturl',
    format: 'json',
    keyword,
    url,
  };
  const fetchOpts: RequestInit = {
    method: 'POST',
    body: Object.entries(params).reduce((formData, [k, v]) => {
      formData.append(k, v!);
      return formData;
    }, new FormData()),
  };

  const resp = await fetch(`${Constants.urlShortenerBase}yourls-api.php`, fetchOpts);
  if (!resp || !resp.ok) {
    return null;
  }

  const res = await resp.json();
  return res;
}
