import { call, debounce, put, select, takeEvery } from 'redux-saga/effects';

import SessionActions from '../../../application/actions/SessionActions';
import type { OverallState } from '../../../application/ApplicationTypes';
import type { Tokens } from '../../../application/types/SessionTypes';
import { showWarningMessage } from '../../../utils/notifications/NotificationsHelper';
import WorkspaceActions from '../../../workspace/WorkspaceActions';
import type { WorkspaceLocation } from '../../../workspace/WorkspaceTypes';
import { getVersionHistory, postAnswer, updateVersionName } from '../../RequestsSaga';

/**
 * Helper to get the current question ID for assessment or grading workspace.
 */
function* getCurrentQuestionId(workspaceLocation: WorkspaceLocation) {
  const questionId: number | undefined = yield select((state: OverallState) => {
    const workspace = state.workspaces[workspaceLocation];

    if (!('currentQuestion' in workspace)) {
      return undefined;
    }

    const questionIndex = workspace.currentQuestion;
    if (questionIndex === undefined) {
      return undefined;
    }

    if (workspaceLocation === 'assessment') {
      const assessmentId = state.workspaces.assessment.currentAssessment;
      if (assessmentId === undefined) {
        return undefined;
      }
      return state.session.assessments[assessmentId]?.questions[questionIndex]?.id;
    }

    if (workspaceLocation === 'grading') {
      const submissionId = state.workspaces.grading.currentSubmission;
      if (submissionId === undefined) {
        return undefined;
      }
      return state.session.gradings[submissionId]?.answers[questionIndex]?.question?.id;
    }

    return undefined;
  });

  return questionId;
}

/**
 * Saga to handle fetching version history
 */
export function* fetchVersionHistorySaga(
  action: ReturnType<typeof WorkspaceActions.fetchVersionHistory>
) {
  const { workspaceLocation } = action.payload;

  // Get the current question ID
  const questionId: number | undefined = yield call(getCurrentQuestionId, workspaceLocation);

  if (questionId === undefined) {
    // Set loading to false with empty versions
    yield call(showWarningMessage, 'Version history is only available for questions');
    yield put(WorkspaceActions.receiveVersionHistory(workspaceLocation, []));
    return;
  }

  // get authentication tokens from state
  const tokens: Tokens = yield select((state: OverallState) => ({
    accessToken: state.session.accessToken,
    refreshToken: state.session.refreshToken
  }));

  // call API
  const versions: any[] | null = yield call(getVersionHistory, questionId, tokens);

  if (versions) {
    // action to store versions in state
    yield put(WorkspaceActions.receiveVersionHistory(workspaceLocation, versions));
  } else {
    // call with empty versions array to set loading to false and display warning
    yield put(WorkspaceActions.receiveVersionHistory(workspaceLocation, []));
    yield call(showWarningMessage, 'Failed to load version history');
  }
}

/**
 * Saga to handle naming a version
 */
export function* nameVersionSaga(action: ReturnType<typeof WorkspaceActions.nameVersion>) {
  const { workspaceLocation, versionId, name } = action.payload;

  // Get the current question ID
  const questionId: number | undefined = yield call(getCurrentQuestionId, workspaceLocation);

  if (questionId === undefined) {
    yield call(showWarningMessage, 'Error renaming version: No question ID found');
    return;
  }

  // Get authentication tokens
  const tokens: Tokens = yield select((state: OverallState) => ({
    accessToken: state.session.accessToken,
    refreshToken: state.session.refreshToken
  }));

  // Call the API to update the name
  const resp: Response | null = yield call(updateVersionName, questionId, versionId, name, tokens);

  if (!resp || !resp.ok) {
    yield call(showWarningMessage, 'Failed to rename version');
    // Refetch to revert the optimistic update
    yield call(fetchVersionHistorySaga, {
      payload: { workspaceLocation },
      type: WorkspaceActions.fetchVersionHistory.type
    });
  }
}

/**
 * Saga to handle restoring a version
 */
export function* restoreVersionSaga(
  action: ReturnType<typeof WorkspaceActions.restoreVersion>
): any {
  const { workspaceLocation, versionId } = action.payload;

  if (workspaceLocation !== 'assessment') {
    return;
  }

  // Find the restored version's code from state
  const code: string | undefined = yield select((state: OverallState) => {
    const version = state.workspaces[workspaceLocation].versionHistory.versions.find(
      v => v.id === versionId
    );
    return version?.code;
  });

  if (code === undefined) {
    return;
  }

  const questionId: number | undefined = yield call(getCurrentQuestionId, workspaceLocation);
  if (questionId === undefined) {
    return;
  }

  // Get authentication tokens
  const tokens: Tokens = yield select((state: OverallState) => ({
    accessToken: state.session.accessToken,
    refreshToken: state.session.refreshToken
  }));

  // Submit the restored code as the answer
  const resp: Response | null = yield call(postAnswer, questionId, code, tokens);

  if (resp && resp.ok) {
    // Fetch updated version history to get the new version's ID
    yield call(fetchVersionHistorySaga, {
      payload: { workspaceLocation },
      type: WorkspaceActions.fetchVersionHistory.type
    });

    // Name the newest version (first in the sorted list) as "timestamp-restored"
    const newestVersion: { id: string; timestamp: number } | undefined = yield select(
      (state: OverallState) => {
        const versions = state.workspaces[workspaceLocation].versionHistory.versions;
        if (versions.length === 0) return undefined;
        return versions.reduce((latest, v) => (v.timestamp > latest.timestamp ? v : latest));
      }
    );

    if (newestVersion) {
      const date = new Date(newestVersion.timestamp);
      const formattedTimestamp = date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const restoredName = `${formattedTimestamp}-restored`;

      // Optimistically update the name in state
      yield put(WorkspaceActions.nameVersion(workspaceLocation, newestVersion.id, restoredName));
    }
  } else {
    yield put(WorkspaceActions.updateSaveStatus(workspaceLocation, 'saveFailed'));
  }
}

/**
 * Performs auto-save by submitting the answer to the backend.
 * The backend handles saving as a version on submission.
 */
function* performAutoSave(workspaceLocation: WorkspaceLocation): any {
  // Only assessment workspaces auto-save
  if (workspaceLocation !== 'assessment') {
    return;
  }

  // Get the current code from the active editor tab
  const { editorTabs, activeEditorTabIndex } = yield select(
    (state: OverallState) => state.workspaces[workspaceLocation]
  );

  if (activeEditorTabIndex === null) {
    return;
  }

  const code = editorTabs[activeEditorTabIndex].value;

  const questionId: number | undefined = yield call(getCurrentQuestionId, workspaceLocation);

  if (questionId === undefined) {
    return;
  }

  // Skip if code is unchanged from the latest saved version
  const latestVersion: string | undefined = yield select((state: OverallState) => {
    const versions = state.workspaces[workspaceLocation].versionHistory.versions;
    return versions.length > 0 ? versions[0].code : undefined;
  });

  if (code === latestVersion) {
    return;
  }

  // Submit the answer; the backend handles saving as a version
  yield put(SessionActions.submitAnswer(questionId, code));
  yield put(WorkspaceActions.updateSaveStatus(workspaceLocation, 'saved'));
}

/**
 * Watcher saga that debounces auto-save calls per workspace
 * Waits 3 seconds after the last edit before saving
 */
export function* watchAutoSave() {
  yield debounce(
    3000,
    WorkspaceActions.updateEditorValue.type,
    function* (action: ReturnType<typeof WorkspaceActions.updateEditorValue>) {
      const { workspaceLocation } = action.payload;
      yield* performAutoSave(workspaceLocation);
    }
  );
}

/**
 * Watcher saga that immediately sets save status to 'saving' when the user types.
 * This ensures the indicator shows "Saving" during the debounce wait period.
 */
export function* watchSavingStatus() {
  yield takeEvery(
    WorkspaceActions.updateEditorValue.type,
    function* (action: ReturnType<typeof WorkspaceActions.updateEditorValue>) {
      const { workspaceLocation } = action.payload;
      // Only set saving status for workspaces that actually auto-save
      if (workspaceLocation === 'grading') {
        return;
      }
      yield put(WorkspaceActions.updateSaveStatus(workspaceLocation, 'saving'));
    }
  );
}
