import { compressToEncodedURIComponent } from 'lz-string';
import * as qs from 'query-string';
import { SagaIterator } from 'redux-saga';
import { put, select, takeEvery } from 'redux-saga/effects';
import * as actions from '../actions';
import * as actionTypes from '../actions/actionTypes';
import { defaultEditorValue, IState } from '../reducers/states';

export default function* playgroundSaga(): SagaIterator {
  yield takeEvery(actionTypes.GENERATE_LZ_STRING, updateQueryString);
}

function* updateQueryString() {
  const code = yield select((state: IState) => state.workspaces.playground.editorValue);
  const chapter = yield select((state: IState) => state.workspaces.playground.context.chapter);
  const external = yield select((state: IState) => state.workspaces.playground.playgroundExternal);
  const newQueryString =
    code === '' || code === defaultEditorValue
      ? undefined
      : qs.stringify({
          prgrm: compressToEncodedURIComponent(code),
          chap: chapter,
          ext: external
        });
  yield put(actions.changeQueryString(newQueryString));
}
