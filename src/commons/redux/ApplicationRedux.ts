import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setModulesStaticURL } from 'js-slang/dist/modules/moduleLoader';
import { SagaIterator } from 'redux-saga';
import { call } from 'redux-saga/effects';

import Constants from '../utils/Constants';
import { safeTakeEvery } from './utils/SafeEffects';

export enum ApplicationEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test'
}

export type ApplicationState = {
  readonly environment: ApplicationEnvironment;
  readonly modulesBackend: string;
};

const currentEnvironment = (): ApplicationEnvironment => {
  switch (process.env.NODE_ENV) {
    case 'development':
      return ApplicationEnvironment.Development;
    case 'production':
      return ApplicationEnvironment.Production;
    default:
      return ApplicationEnvironment.Test;
  }
};

export const defaultApplication: ApplicationState = {
  environment: currentEnvironment(),
  modulesBackend: Constants.moduleBackendUrl
};

export const { actions: applicationActions, reducer: applicationReducer } = createSlice({
  name: 'application',
  initialState: defaultApplication,
  reducers: {
    changeModuleBackend(state, { payload }: PayloadAction<string>) {
      state.modulesBackend = payload;
    }
  }
});

export function* ApplicationSaga(): SagaIterator {
  yield safeTakeEvery(
    applicationActions.changeModuleBackend,
    function* ({ payload }) {
      yield call(setModulesStaticURL, payload);
      yield call(console.log, `Using module backend: ${payload}`);
    }
  );
}
