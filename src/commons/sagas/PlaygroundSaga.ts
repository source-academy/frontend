import { Variant } from 'js-slang/dist/types';
import { compressToEncodedURIComponent } from 'lz-string';
import * as qs from 'query-string';
import { SagaIterator } from 'redux-saga';
import { call, delay, put, race, select } from 'redux-saga/effects';

import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import {
  changeQueryString,
  shortenURL,
  updateShortURL
} from '../../features/playground/PlaygroundActions';
import { GENERATE_LZ_STRING, SHORTEN_URL } from '../../features/playground/PlaygroundTypes';
import { defaultEditorValue, OverallState } from '../application/ApplicationTypes';
import Constants from '../utils/Constants';
import { showSuccessMessage, showWarningMessage } from '../utils/NotificationsHelper';
import { safeTakeEvery as takeEvery } from './SafeEffects';

export default function* PlaygroundSaga(): SagaIterator {
  yield takeEvery(GENERATE_LZ_STRING, updateQueryString);

  yield takeEvery(SHORTEN_URL, function* (action: ReturnType<typeof shortenURL>): any {
    const queryString = yield select((state: OverallState) => state.playground.queryString);
    const keyword = action.payload;
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
      yield put(updateShortURL(errorMsg));
      return yield call(showWarningMessage, 'Something went wrong trying to create the link.');
    }

    if (resp.status !== 'success' && !resp.shorturl) {
      yield put(updateShortURL(errorMsg));
      return yield call(showWarningMessage, resp.message);
    }

    if (resp.status !== 'success') {
      yield call(showSuccessMessage, resp.message);
    }
    yield put(updateShortURL(Constants.urlShortenerBase + resp.url.keyword));
  });
}

function* updateQueryString() {
  const code: string | null = yield select(
    (state: OverallState) => state.workspaces.playground.editorValue
  );
  if (!code || code === defaultEditorValue) {
    yield put(changeQueryString(''));
    return;
  }
  const codeString: string = code as string;
  const chapter: number = yield select(
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
  const newQueryString: string = qs.stringify({
    prgrm: compressToEncodedURIComponent(codeString),
    chap: chapter,
    variant,
    ext: external,
    exec: execTime
  });
  yield put(changeQueryString(newQueryString));
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
