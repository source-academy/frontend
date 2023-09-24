import { Action } from '@reduxjs/toolkit'
import { SagaIterator } from "redux-saga";
import { put, take } from "redux-saga/effects";

import { allWorkspaceActions } from "../redux/workspace/AllWorkspacesRedux";
import { safeTakeEvery as takeEvery } from "./SafeEffects";

const isNotifyProgramEvaluated = (action: Action): action is ReturnType<typeof allWorkspaceActions.notifyProgramEvaluated> => action.type === allWorkspaceActions.notifyProgramEvaluated.type

export default function* SideContentSaga(): SagaIterator {
  yield takeEvery(allWorkspaceActions.beginAlertSideContent, function* ({ payload }: ReturnType<typeof allWorkspaceActions.beginAlertSideContent>): SagaIterator {
    yield take((action: Action) => isNotifyProgramEvaluated(action) && action.payload.location === payload.location)
    yield put(allWorkspaceActions.endAlertSideContent(payload.location, payload.payload))
  })
}
