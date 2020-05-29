import { Variant } from 'js-slang/dist/types';
import { compressToEncodedURIComponent } from 'lz-string';
import * as qs from 'query-string';
import { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery } from 'redux-saga/effects';

import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import {
  changeQueryString,
  shortenURL,
  updateShortURL
} from '../../features/playground/PlaygroundActions';
import { GENERATE_LZ_STRING, SHORTEN_URL } from '../../features/playground/PlaygroundTypes';
import { URL_SHORTENER, URL_SHORTENER_SIGNATURE } from '../utils/Constants';
import { showSuccessMessage, showWarningMessage } from '../../utils/notification';
import { defaultEditorValue, OverallState } from '../application/ApplicationTypes';

export default function* PlaygroundSaga(): SagaIterator {
  yield takeEvery(GENERATE_LZ_STRING, updateQueryString);

  yield takeEvery(SHORTEN_URL, function*(action: ReturnType<typeof shortenURL>) {
    const queryString = yield select((state: OverallState) => state.playground.queryString);
    const keyword = action.payload;
    const errorMsg = 'ERROR';

    const resp = yield call(shortenURLRequest, queryString, keyword);
    if (!resp) {
      yield put(updateShortURL(errorMsg));
      return yield call(
        showWarningMessage,
        'Something went wrong trying to shorten the url. Please try again'
      );
    }

    if (resp.status !== 'success' && !resp.shorturl) {
      yield put(updateShortURL(errorMsg));
      return yield call(showWarningMessage, resp.message);
    }

    if (resp.status !== 'success') {
      yield call(showSuccessMessage, resp.message);
    }
    yield put(updateShortURL(resp.shorturl));
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
  let url = `${window.location.protocol}//${window.location.hostname}/playground#${queryString}`;
  if (window.location.port !== '') {
    url = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/playground#${queryString}`;
  }

  const method = 'GET';
  const fetchOpts: any = {
    method
  };
  const params = {
    signature: URL_SHORTENER_SIGNATURE,
    action: 'shorturl',
    format: 'json',
    keyword,
    url
  };

  const query = Object.keys(params)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    .join('&');

  const resp = await fetch(URL_SHORTENER + '?' + query, fetchOpts);
  if (!resp || !resp.ok) {
    return null;
  }

  const res = await resp.json();
  return res;
}
