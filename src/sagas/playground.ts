import { compressToEncodedURIComponent } from 'lz-string';
import * as qs from 'query-string';
import { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import * as actions from '../actions';
import * as actionTypes from '../actions/actionTypes';
import { ExternalLibraryName } from '../components/assessment/assessmentShape';
import { defaultEditorValue, IState } from '../reducers/states';
import { showSuccessMessage, showWarningMessage } from '../utils/notification';

import { Variant } from 'js-slang/dist/types';
import { URL_SHORTENER, URL_SHORTENER_SIGNATURE } from '../utils/constants';

export default function* playgroundSaga(): SagaIterator {
  yield takeEvery(actionTypes.GENERATE_LZ_STRING, updateQueryString);

  yield takeEvery(actionTypes.SHORTEN_URL, function*(
    action: ReturnType<typeof actions.shortenURL>
  ) {
    const queryString = yield select((state: IState) => state.playground.queryString);
    const keyword = action.payload;
    const errorMsg = 'ERROR';

    const resp = yield call(shortenURLRequest, queryString, keyword);
    if (!resp) {
      yield put(actions.updateShortURL(errorMsg));
      return yield call(
        showWarningMessage,
        'Something went wrong trying to shorten the url. Please try again'
      );
    }

    if (resp.status !== 'success' && !resp.shorturl) {
      yield put(actions.updateShortURL(errorMsg));
      return yield call(showWarningMessage, resp.message);
    }

    if (resp.status !== 'success') {
      yield call(showSuccessMessage, resp.message);
    }
    yield put(actions.updateShortURL(resp.shorturl));
  });
}

function* updateQueryString() {
  const code: string | null = yield select(
    (state: IState) => state.workspaces.playground.editorValue
  );
  if (!code || code === defaultEditorValue) {
    yield put(actions.changeQueryString(''));
    return;
  }
  const codeString: string = code as string;
  const chapter: number = yield select(
    (state: IState) => state.workspaces.playground.context.chapter
  );
  const variant: Variant = yield select(
    (state: IState) => state.workspaces.playground.context.variant
  );
  const external: ExternalLibraryName = yield select(
    (state: IState) => state.workspaces.playground.externalLibrary
  );
  const execTime: number = yield select((state: IState) => state.workspaces.playground.execTime);
  const newQueryString: string = qs.stringify({
    prgrm: compressToEncodedURIComponent(codeString),
    chap: chapter,
    variant,
    ext: external,
    exec: execTime
  });
  yield put(actions.changeQueryString(newQueryString));
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
