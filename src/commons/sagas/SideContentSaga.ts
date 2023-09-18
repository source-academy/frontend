import { SagaIterator } from "redux-saga";
import { put, take } from "redux-saga/effects";

import { sideContentActions } from "../sideContent/SideContentRedux";
import { safeTakeEvery as takeEvery } from "./SafeEffects";

export default function* SideContentSaga(): SagaIterator {
  yield takeEvery(sideContentActions.beginAlertSideContent, function* ({ payload }: ReturnType<typeof sideContentActions.beginAlertSideContent>) {
    yield take(sideContentActions.notifyProgramEvaluated)
    yield put(sideContentActions.endAlertSideContent(payload.location, payload.payload))
  })
}
