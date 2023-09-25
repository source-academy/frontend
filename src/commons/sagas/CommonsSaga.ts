import { setModulesStaticURL } from 'js-slang/dist/modules/moduleLoader';
import { SagaIterator } from 'redux-saga';
import { call } from 'redux-saga/effects';

import { changeModuleBackend } from '../application/actions/CommonsActions';
import { CHANGE_MODULE_BACKEND } from '../application/types/CommonsTypes';
import { safeTakeEvery } from './SafeEffects';

export default function* CommonsSaga(): SagaIterator {
  yield safeTakeEvery(
    CHANGE_MODULE_BACKEND,
    function* ({ payload }: ReturnType<typeof changeModuleBackend>) {
      yield call(setModulesStaticURL, payload);
      yield call(console.log, `Using module backend: ${payload}`);
    }
  );
}
