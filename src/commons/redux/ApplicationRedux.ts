import { createSlice,PayloadAction } from "@reduxjs/toolkit"
import { setModulesStaticURL } from "js-slang/dist/modules/moduleLoader"
import { SagaIterator } from "redux-saga"
import { call } from "redux-saga/effects"

import { safeTakeEvery } from "../sagas/SafeEffects"
import Constants from "../utils/Constants"

export type ApplicationState = {
  readonly modulesBackend: string
}

export const defaultApplication: ApplicationState = {
  modulesBackend: Constants.moduleBackendUrl
}

export const { actions: applicationActions, reducer: applicationReducer } = createSlice({
  name: 'application',
  initialState: defaultApplication,
  reducers: {
    changeModuleBackend(state, { payload }: PayloadAction<string>) {
      state.modulesBackend = payload
    }
  }
})

export function* ApplicationSaga(): SagaIterator {
  yield safeTakeEvery(applicationActions.changeModuleBackend, function* ({ payload }): SagaIterator {
    yield call(setModulesStaticURL, payload)
    yield call(console.log, `Using module backend: ${payload}`)
  })
}
