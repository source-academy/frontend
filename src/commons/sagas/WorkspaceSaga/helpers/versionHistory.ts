import { SagaIterator } from 'redux-saga';
import { call, debounce, put, select, take, takeEvery } from 'redux-saga/effects';

import SessionActions from '../../../application/actions/SessionActions';
import type { OverallState } from '../../../application/ApplicationTypes';
import type { Tokens } from '../../../application/types/SessionTypes';
import { QuestionTypes } from '../../../assessment/AssessmentTypes';
import { showWarningMessage } from '../../../utils/notifications/NotificationsHelper';
import WorkspaceActions from '../../../workspace/WorkspaceActions';
import type { WorkspaceLocation } from '../../../workspace/WorkspaceTypes';
import { getVersionCode, getVersionHistory, updateVersionName } from '../../RequestsSaga';

/**
 * Checks whether autosave is enabled for the current assessment workspace.
 * Defaults to false if the config cannot be found.
 * Defaults to true for assessments created before feature implementation
 */
function* isAutosaveEnabledForCurrentAssessment(): SagaIterator<boolean> {
  return yield select((state: OverallState) => {
    const assessmentId = state.workspaces.assessment.currentAssessment;
    if (assessmentId === undefined) return false;
    const overview = state.session.assessmentOverviews?.find(o => o.id === assessmentId);
    if (!overview) return false;
    return overview.isAutosaveEnabled ?? true;
  });
}

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
  const { workspaceLocation, skipAutoSave } = action.payload;

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

  // Save current code before fetching
  if (!skipAutoSave) {
    yield call(performAutoSave, workspaceLocation);
  }

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
 * Saga to fetch the code for a selected version
 */
export function* selectVersionSaga(
  action: ReturnType<typeof WorkspaceActions.selectVersion>
): SagaIterator {
  const { workspaceLocation, version } = action.payload;

  if (version === null) return;

  const questionId: number | undefined = yield call(getCurrentQuestionId, workspaceLocation);

  if (questionId === undefined) {
    yield call(showWarningMessage, 'Error loading version: No question ID found');
    yield put(WorkspaceActions.receiveVersionCode(workspaceLocation, version.id, ''));
    return;
  }

  const tokens: Tokens = yield select((state: OverallState) => ({
    accessToken: state.session.accessToken,
    refreshToken: state.session.refreshToken
  }));

  const versionWithCode: any | null = yield call(getVersionCode, questionId, version.id, tokens);

  if (versionWithCode) {
    yield put(
      WorkspaceActions.receiveVersionCode(workspaceLocation, version.id, versionWithCode.code)
    );
  } else {
    yield call(showWarningMessage, 'Failed to load version code');
    yield put(WorkspaceActions.receiveVersionCode(workspaceLocation, version.id, ''));
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
      payload: { workspaceLocation, skipAutoSave: true },
      type: WorkspaceActions.fetchVersionHistory.type
    });
  }
}

/**
 * Saga to handle restoring a version
 */
export function* restoreVersionSaga(
  action: ReturnType<typeof WorkspaceActions.restoreVersion>
): SagaIterator {
  const {
    workspaceLocation,
    name: restoredVersionName,
    timestamp: restoredVersionTimestamp
  } = action.payload;

  if (workspaceLocation !== 'assessment') {
    return;
  }

  // Check if this is a team assessment
  const isTeamAssessment: boolean = yield select((state: OverallState) => {
    const assessmentId = state.workspaces.assessment.currentAssessment;
    if (assessmentId === undefined) return false;
    const overview = state.session.assessmentOverviews?.find(o => o.id === assessmentId);
    return overview ? overview.maxTeamSize !== 1 : false;
  });

  const autosaveEnabled: boolean = yield call(isAutosaveEnabledForCurrentAssessment);

  if (isTeamAssessment || !autosaveEnabled) {
    // For team assessments, dont submit
    yield put(WorkspaceActions.updateHasUnsavedChanges(workspaceLocation, true));
    return;
  }

  // Auto-save the restored code
  yield put(WorkspaceActions.updateHasUnsavedChanges(workspaceLocation, true));
  yield put(WorkspaceActions.updateSaveStatus(workspaceLocation, 'saving'));
  const newVersionCreated: boolean = yield call(performAutoSave, workspaceLocation);

  if (!newVersionCreated) {
    // Ensure save did not fail before updating unsaved changes to false
    const saveStatus: string = yield select(
      (state: OverallState) => state.workspaces[workspaceLocation].saveStatus
    );
    if (saveStatus !== 'saveFailed') {
      yield put(WorkspaceActions.updateHasUnsavedChanges(workspaceLocation, false));
    }
    return;
  }

  // Refetch version history to get the newly created version before renaming.
  yield call(fetchVersionHistorySaga, {
    payload: { workspaceLocation, skipAutoSave: true },
    type: WorkspaceActions.fetchVersionHistory.type
  });

  // Name the restored version as "(name)-restored"
  const newestVersionId: string | undefined = yield select((state: OverallState) => {
    const versions = state.workspaces[workspaceLocation].versionHistory.versions;
    return versions[versions.length - 1]?.id;
  });

  if (newestVersionId) {
    const restoredLabel =
      restoredVersionName || new Date(restoredVersionTimestamp).toLocaleString();
    const restoredName = `${restoredLabel}-restored`;

    // Optimistically update the name in state
    yield put(WorkspaceActions.nameVersion(workspaceLocation, newestVersionId, restoredName));
  }
}

/**
 * Performs auto-save by submitting the answer to the backend.
 * The backend handles saving as a version on submission.
 */
function* performAutoSave(workspaceLocation: WorkspaceLocation): SagaIterator {
  // Only assessment workspaces auto-save
  if (workspaceLocation !== 'assessment') {
    return false;
  }

  // Skip auto-save if autosave is disabled for this assessment
  const autosaveEnabled: boolean = yield call(isAutosaveEnabledForCurrentAssessment);
  if (!autosaveEnabled) {
    return false;
  }

  // Skip auto-save for MCQ questions
  const currentQuestionType: string | undefined = yield select((state: OverallState) => {
    const assessmentId = state.workspaces.assessment.currentAssessment;
    if (assessmentId === undefined) return undefined;
    const questionIndex = state.workspaces.assessment.currentQuestion;
    if (questionIndex === undefined) return undefined;
    return state.session.assessments[assessmentId]?.questions[questionIndex]?.type;
  });

  if (currentQuestionType !== QuestionTypes.programming) {
    return false;
  }

  // Skip auto-save for team assessments
  const isTeamAssessment: boolean = yield select((state: OverallState) => {
    const assessmentId = state.workspaces.assessment.currentAssessment;
    if (assessmentId === undefined) return false;
    const overview = state.session.assessmentOverviews?.find(o => o.id === assessmentId);
    return overview ? overview.maxTeamSize !== 1 : false;
  });

  if (isTeamAssessment) {
    return false;
  }

  // If another save is already in flight for this workspace, wait for it to finish before proceeding.
  const isAlreadySaving: boolean = yield select(
    (state: OverallState) => state.workspaces[workspaceLocation].versionHistory.isAutoSaving
  );
  if (isAlreadySaving) {
    yield take(
      (action: any) =>
        action.type === WorkspaceActions.setIsAutoSaving.type &&
        action.payload.workspaceLocation === workspaceLocation &&
        action.payload.isAutoSaving === false
    );
  }

  yield put(WorkspaceActions.setIsAutoSaving(workspaceLocation, true));

  try {
    // Get the current code from the active editor tab
    const { editorTabs, activeEditorTabIndex } = yield select(
      (state: OverallState) => state.workspaces[workspaceLocation]
    );

    if (activeEditorTabIndex === null) {
      return false;
    }

    const code = editorTabs[activeEditorTabIndex].value;

    const questionId: number | undefined = yield call(getCurrentQuestionId, workspaceLocation);

    if (questionId === undefined) {
      return false;
    }

    // Skip if code matches the last submitted answer
    const lastSubmittedAnswer: string | undefined = yield select((state: OverallState) => {
      const assessmentId = state.workspaces.assessment.currentAssessment;
      const questionIndex = state.workspaces.assessment.currentQuestion;
      if (assessmentId === undefined || questionIndex === undefined) return undefined;
      return state.session.assessments[assessmentId]?.questions[questionIndex]?.answer as
        | string
        | undefined;
    });

    if (code === lastSubmittedAnswer) {
      yield put(WorkspaceActions.updateSaveStatus(workspaceLocation, 'saved'));
      return false;
    }

    // Submit the answer; the backend handles saving as a version.
    yield put(SessionActions.submitAnswer(questionId, code));

    // Wait for submit to complete before refreshing
    const saveAction: ReturnType<typeof WorkspaceActions.updateSaveStatus> = yield take(
      (action: any) =>
        action.type === WorkspaceActions.updateSaveStatus.type &&
        action.payload.workspaceLocation === workspaceLocation &&
        (action.payload.saveStatus === 'saved' || action.payload.saveStatus === 'saveFailed')
    );

    if (saveAction.payload.saveStatus === 'saveFailed') {
      return false;
    }

    return true;
  } finally {
    yield put(WorkspaceActions.setIsAutoSaving(workspaceLocation, false));
  }
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
      if (workspaceLocation !== 'assessment') return;
      const autosaveEnabled: boolean = yield call(isAutosaveEnabledForCurrentAssessment);
      if (!autosaveEnabled) return;
      yield call(performAutoSave, workspaceLocation);
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
      if (workspaceLocation !== 'assessment') return;
      const autosaveEnabled: boolean = yield call(isAutosaveEnabledForCurrentAssessment);
      if (!autosaveEnabled) return;
      yield put(WorkspaceActions.updateSaveStatus(workspaceLocation, 'saving'));
    }
  );
}
