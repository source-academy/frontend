/*eslint no-eval: "error"*/
/*eslint-env browser*/
import { SagaIterator } from 'redux-saga';
import { call, put, select } from 'redux-saga/effects';

import { OverallState, Role, SourceLanguage } from '../../commons/application/ApplicationTypes';
import {
  Assessment,
  AssessmentOverview,
  AssessmentStatuses,
  FETCH_ASSESSMENT_OVERVIEWS,
  Question,
  SUBMIT_ASSESSMENT
} from '../../commons/assessment/AssessmentTypes';
import {
  Notification,
  NotificationFilterFunction
} from '../../commons/notificationBadge/NotificationBadgeTypes';
import {
  CHANGE_SUBLANGUAGE,
  FETCH_SUBLANGUAGE,
  WorkspaceLocation
} from '../../commons/workspace/WorkspaceTypes';
import { FETCH_GROUP_GRADING_SUMMARY } from '../../features/dashboard/DashboardTypes';
import { Grading, GradingOverview, GradingQuestion } from '../../features/grading/GradingTypes';
import {
  CHANGE_DATE_ASSESSMENT,
  DELETE_ASSESSMENT,
  PUBLISH_ASSESSMENT,
  UPLOAD_ASSESSMENT
} from '../../features/groundControl/GroundControlTypes';
import { setResetLoggingFlag } from '../../features/keystrokes/KeystrokesHelper';
import { FETCH_SOURCECAST_INDEX } from '../../features/sourceRecorder/sourcecast/SourcecastTypes';
import { SAVE_SOURCECAST_DATA } from '../../features/sourceRecorder/SourceRecorderTypes';
import { DELETE_SOURCECAST_ENTRY } from '../../features/sourceRecorder/sourcereel/SourcereelTypes';
import {
  ACKNOWLEDGE_NOTIFICATIONS,
  FETCH_ASSESSMENT,
  FETCH_AUTH,
  FETCH_GRADING,
  FETCH_GRADING_OVERVIEWS,
  FETCH_NOTIFICATIONS,
  REAUTOGRADE_ANSWER,
  REAUTOGRADE_SUBMISSION,
  SUBMIT_ANSWER,
  SUBMIT_GRADING,
  SUBMIT_GRADING_AND_CONTINUE,
  UNSUBMIT_SUBMISSION,
  UPLOAD_KEYSTROKE_LOGS
} from '../application/types/SessionTypes';
import { actions } from '../utils/ActionsHelper';
import { computeRedirectUri, getClientId, getDefaultProvider } from '../utils/AuthHelper';
import { history } from '../utils/HistoryHelper';
import { showSuccessMessage, showWarningMessage } from '../utils/NotificationsHelper';
import { AsyncReturnType } from '../utils/TypeHelper';
import {
  changeDateAssessment,
  deleteAssessment,
  deleteSourcecastEntry,
  getAssessment,
  getAssessmentOverviews,
  getGrading,
  getGradingOverviews,
  getGradingSummary,
  getNotifications,
  getSourcecastIndex,
  getSublanguage,
  getUser,
  handleResponseError,
  postAcknowledgeNotifications,
  postAnswer,
  postAssessment,
  postAuth,
  postGrading,
  postKeystrokeLogs,
  postReautogradeAnswer,
  postReautogradeSubmission,
  postSourcecast,
  postSublanguage,
  postUnsubmit,
  publishAssessment,
  uploadAssessment
} from './RequestsSaga';
import { safeTakeEvery as takeEvery } from './SafeEffects';

function* BackendSaga(): SagaIterator {
  yield takeEvery(FETCH_AUTH, function* (action: ReturnType<typeof actions.fetchAuth>) {
    const { code, providerId: payloadProviderId } = action.payload;
    const providerId = payloadProviderId || (getDefaultProvider() || [null])[0];
    if (!providerId) {
      yield call(
        showWarningMessage,
        'Could not log in; invalid provider or no providers configured.'
      );
      return yield history.push('/');
    }
    const clientId = getClientId(providerId);
    const redirectUrl = computeRedirectUri(providerId);
    const tokens = yield call(postAuth, code, providerId, clientId, redirectUrl);
    if (!tokens) {
      return yield history.push('/');
    }

    const user = yield call(getUser, tokens);
    if (!user) {
      return yield history.push('/');
    }

    // Old: Use dispatch instead of saga's put to guarantee the reducer has
    // finished setting values in the state before /academy begins rendering
    // New: Changed to yield put
    yield put(actions.setTokens(tokens));
    yield put(actions.setUser(user));
    yield history.push('/academy');
  });

  yield takeEvery(FETCH_ASSESSMENT_OVERVIEWS, function* () {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const assessmentOverviews = yield call(getAssessmentOverviews, tokens);
    if (assessmentOverviews) {
      yield put(actions.updateAssessmentOverviews(assessmentOverviews));
    }
  });

  yield takeEvery(FETCH_ASSESSMENT, function* (action: ReturnType<typeof actions.fetchAssessment>) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const id = action.payload;
    const assessment: Assessment = yield call(getAssessment, id, tokens);
    if (assessment) {
      yield put(actions.updateAssessment(assessment));
    }
  });

  yield takeEvery(SUBMIT_ANSWER, function* (action: ReturnType<typeof actions.submitAnswer>) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const questionId = action.payload.id;
    const answer = action.payload.answer;
    const resp = yield call(postAnswer, questionId, answer, tokens);

    const codes: Map<number, string> = new Map([
      [400, "Answer rejected - can't save an empty answer."],
      [403, 'Answer rejected - assessment not open or already finalised.']
    ]);
    if (!resp || !resp.ok) {
      yield handleResponseError(resp, codes);
      return;
    }

    yield call(showSuccessMessage, 'Saved!', 1000);
    // Now, update the answer for the question in the assessment in the store
    const assessmentId = yield select(
      (state: OverallState) => state.workspaces.assessment.currentAssessment!
    );
    const assessment = yield select((state: OverallState) =>
      state.session.assessments.get(assessmentId)
    );
    const newQuestions = assessment.questions.slice().map((question: Question) => {
      if (question.id === questionId) {
        return { ...question, answer };
      }
      return question;
    });
    const newAssessment = {
      ...assessment,
      questions: newQuestions
    };
    yield put(actions.updateAssessment(newAssessment));
    return yield put(actions.updateHasUnsavedChanges('assessment' as WorkspaceLocation, false));
  });

  yield takeEvery(SUBMIT_ASSESSMENT, function* (
    action: ReturnType<typeof actions.submitAssessment>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const assessmentId = action.payload;
    const resp = yield call(postAssessment, assessmentId, tokens);

    const codes: Map<number, string> = new Map([
      [400, 'Not allowed to finalise - some questions are unattempted.'],
      [403, 'Not allowed to finalise - assessment not open or already finalised.']
    ]);
    if (!resp || !resp.ok) {
      yield handleResponseError(resp, codes);
      return;
    }

    yield call(showSuccessMessage, 'Submitted!', 2000);
    // Now, update the status of the assessment overview in the store
    const overviews: AssessmentOverview[] = yield select(
      (state: OverallState) => state.session.assessmentOverviews
    );
    const newOverviews = overviews.map(overview => {
      if (overview.id === assessmentId) {
        return { ...overview, status: AssessmentStatuses.submitted };
      }
      return overview;
    });
    return yield put(actions.updateAssessmentOverviews(newOverviews));
  });

  yield takeEvery(FETCH_GRADING_OVERVIEWS, function* (
    action: ReturnType<typeof actions.fetchGradingOverviews>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const filterToGroup = action.payload;

    const gradingOverviews = yield call(getGradingOverviews, tokens, filterToGroup);
    if (gradingOverviews) {
      yield put(actions.updateGradingOverviews(gradingOverviews));
    }
  });

  yield takeEvery(FETCH_GRADING, function* (action: ReturnType<typeof actions.fetchGrading>) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const id = action.payload;
    const grading = yield call(getGrading, id, tokens);
    if (grading) {
      yield put(actions.updateGrading(id, grading));
    }
  });

  /**
   * Unsubmits the submission and updates the grading overviews of the new status.
   */
  yield takeEvery(UNSUBMIT_SUBMISSION, function* (
    action: ReturnType<typeof actions.unsubmitSubmission>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const { submissionId } = action.payload;

    const resp: Response = yield postUnsubmit(submissionId, tokens);

    const codes: Map<number, string> = new Map([
      [400, 'Not allowed to unsubmit - submission incomplete or not submitted.'],
      [403, "Not allowed to unsubmit - not this student's Avenger or an Admin."]
    ]);
    if (!resp || !resp.ok) {
      yield handleResponseError(resp, codes);
      return;
    }

    const overviews = yield select((state: OverallState) => state.session.gradingOverviews || []);
    const newOverviews = (overviews as GradingOverview[]).map(overview => {
      if (overview.submissionId === submissionId) {
        return { ...overview, submissionStatus: 'attempted' };
      }
      return overview;
    });
    yield call(showSuccessMessage, 'Unsubmit successful', 1000);
    yield put(actions.updateGradingOverviews(newOverviews));
  });

  const sendGrade = function* (
    action:
      | ReturnType<typeof actions.submitGrading>
      | ReturnType<typeof actions.submitGradingAndContinue>
  ) {
    const role = yield select((state: OverallState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can submit answers.');
    }
    const { submissionId, questionId, gradeAdjustment, xpAdjustment, comments } = action.payload;
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const resp = yield postGrading(
      submissionId,
      questionId,
      gradeAdjustment,
      xpAdjustment,
      tokens,
      comments
    );

    const codes: Map<number, string> = new Map([
      [400, 'Grading rejected - missing permissions or invalid grade parameters.'],
      [405, 'Not allowed to grade - submission incomplete or not submitted.']
    ]);
    if (!resp || !resp.ok) {
      yield handleResponseError(resp, codes);
      return;
    }

    yield call(showSuccessMessage, 'Submitted!', 1000);
    // Now, update the grade for the question in the Grading in the store
    const grading: Grading = yield select((state: OverallState) =>
      state.session.gradings.get(submissionId)
    );
    const newGrading = grading.slice().map((gradingQuestion: GradingQuestion) => {
      if (gradingQuestion.question.id === questionId) {
        gradingQuestion.grade = {
          gradeAdjustment,
          xpAdjustment,
          roomId: gradingQuestion.grade.roomId,
          grade: gradingQuestion.grade.grade,
          xp: gradingQuestion.grade.xp,
          comments
        };
      }
      return gradingQuestion;
    });
    yield put(actions.updateGrading(submissionId, newGrading));
  };

  const sendGradeAndContinue = function* (
    action: ReturnType<typeof actions.submitGradingAndContinue>
  ) {
    const { submissionId } = action.payload;
    yield* sendGrade(action);

    const currentQuestion = yield select(
      (state: OverallState) => state.workspaces.grading.currentQuestion
    );
    /**
     * Move to next question for grading: this only works because the
     * SUBMIT_GRADING_AND_CONTINUE Redux action is currently only
     * used in the Grading Workspace
     *
     * If the questionId is out of bounds, the componentDidUpdate callback of
     * GradingWorkspace will cause a redirect back to '/academy/grading'
     */
    yield history.push(`/academy/grading/${submissionId}/${(currentQuestion || 0) + 1}`);
  };

  yield takeEvery(SUBMIT_GRADING, sendGrade);

  yield takeEvery(SUBMIT_GRADING_AND_CONTINUE, sendGradeAndContinue);

  yield takeEvery(REAUTOGRADE_SUBMISSION, function* (
    action: ReturnType<typeof actions.reautogradeSubmission>
  ) {
    const submissionId = action.payload;
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const result = yield call(postReautogradeSubmission, submissionId, tokens);
    yield call(handleReautogradeResponse, result);
  });

  yield takeEvery(REAUTOGRADE_ANSWER, function* (
    action: ReturnType<typeof actions.reautogradeAnswer>
  ) {
    const { submissionId, questionId } = action.payload;
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const result = yield call(postReautogradeAnswer, submissionId, questionId, tokens);
    yield call(handleReautogradeResponse, result);
  });

  yield takeEvery(FETCH_NOTIFICATIONS, function* (
    action: ReturnType<typeof actions.fetchNotifications>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const notifications = yield call(getNotifications, tokens);

    yield put(actions.updateNotifications(notifications));
  });

  yield takeEvery(ACKNOWLEDGE_NOTIFICATIONS, function* (
    action: ReturnType<typeof actions.acknowledgeNotifications>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const notificationFilter: NotificationFilterFunction | undefined = action.payload.withFilter;

    const notifications: Notification[] = yield select(
      (state: OverallState) => state.session.notifications
    );

    let notificationsToAcknowledge = notifications;

    if (notificationFilter) {
      notificationsToAcknowledge = notificationFilter(notifications);
    }

    if (notificationsToAcknowledge.length === 0) {
      return;
    }

    const ids = notificationsToAcknowledge.map(n => n.id);

    const newNotifications: Notification[] = notifications.filter(
      notification => !ids.includes(notification.id)
    );

    yield put(actions.updateNotifications(newNotifications));

    const resp: Response | null = yield call(postAcknowledgeNotifications, tokens, ids);

    if (!resp || !resp.ok) {
      yield handleResponseError(resp);
      return;
    }
  });

  yield takeEvery(DELETE_SOURCECAST_ENTRY, function* (
    action: ReturnType<typeof actions.deleteSourcecastEntry>
  ) {
    const role: Role = yield select((state: OverallState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can delete sourcecasts.');
    }

    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const { id } = action.payload;
    const resp: Response = yield deleteSourcecastEntry(id, tokens);

    if (!resp || !resp.ok) {
      yield handleResponseError(resp);
      return;
    }

    const sourcecastIndex = yield call(getSourcecastIndex, tokens);
    if (sourcecastIndex) {
      yield put(actions.updateSourcecastIndex(sourcecastIndex, action.payload.workspaceLocation));
    }
    yield call(showSuccessMessage, 'Deleted successfully!', 1000);
  });

  yield takeEvery(FETCH_SOURCECAST_INDEX, function* (
    action: ReturnType<typeof actions.fetchSourcecastIndex>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const sourcecastIndex = yield call(getSourcecastIndex, tokens);
    if (sourcecastIndex) {
      yield put(actions.updateSourcecastIndex(sourcecastIndex, action.payload.workspaceLocation));
    }
  });

  yield takeEvery(SAVE_SOURCECAST_DATA, function* (
    action: ReturnType<typeof actions.saveSourcecastData>
  ) {
    const role = yield select((state: OverallState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can save sourcecasts.');
    }
    const { title, description, uid, audio, playbackData } = action.payload;
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const resp = yield postSourcecast(title, description, uid, audio, playbackData, tokens);

    if (!resp || !resp.ok) {
      yield handleResponseError(resp, new Map());
      return;
    }

    yield call(showSuccessMessage, 'Saved successfully!', 1000);
    yield history.push('/sourcecast');
  });

  yield takeEvery(FETCH_SUBLANGUAGE, function* (
    action: ReturnType<typeof actions.fetchSublanguage>
  ) {
    const sublang: SourceLanguage | null = yield call(getSublanguage);

    if (!sublang) {
      yield call(showWarningMessage, `Failed to load default Source sublanguage for Playground!`);
      return;
    }

    yield put(actions.updateSublanguage(sublang));
  });

  yield takeEvery(CHANGE_SUBLANGUAGE, function* (
    action: ReturnType<typeof actions.changeSublanguage>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const { sublang } = action.payload;
    const resp: Response = yield call(postSublanguage, sublang.chapter, sublang.variant, tokens);

    const codes: Map<number, string> = new Map([
      [400, 'Request rejected - invalid chapter-variant combination.'],
      [403, 'Request rejected - only staff are allowed to set the default sublanguage.']
    ]);
    if (!resp || !resp.ok) {
      yield handleResponseError(resp, codes);
      return;
    }

    yield put(actions.updateSublanguage(sublang));
    yield call(showSuccessMessage, 'Updated successfully!', 1000);
  });

  yield takeEvery(FETCH_GROUP_GRADING_SUMMARY, function* (
    action: ReturnType<typeof actions.fetchGroupGradingSummary>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const groupOverviews = yield call(getGradingSummary, tokens);
    if (groupOverviews) {
      yield put(actions.updateGroupGradingSummary(groupOverviews));
    }
  });

  yield takeEvery(CHANGE_DATE_ASSESSMENT, function* (
    action: ReturnType<typeof actions.changeDateAssessment>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const id = action.payload.id;
    const closeAt = action.payload.closeAt;
    const openAt = action.payload.openAt;
    const respMsg: string | null = yield changeDateAssessment(id, closeAt, openAt, tokens);
    if (respMsg == null) {
      yield handleResponseError(respMsg);
      return;
    } else if (respMsg !== 'OK') {
      yield call(showWarningMessage, respMsg, 5000);
      return;
    }

    yield put(actions.fetchAssessmentOverviews());
    yield call(showSuccessMessage, 'Updated successfully!', 1000);
  });

  yield takeEvery(DELETE_ASSESSMENT, function* (
    action: ReturnType<typeof actions.deleteAssessment>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const id = action.payload;
    const resp: Response = yield deleteAssessment(id, tokens);

    if (!resp || !resp.ok) {
      yield handleResponseError(resp);
      return;
    }

    yield put(actions.fetchAssessmentOverviews());
    yield call(showSuccessMessage, 'Deleted successfully!', 1000);
  });

  yield takeEvery(PUBLISH_ASSESSMENT, function* (
    action: ReturnType<typeof actions.publishAssessment>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const id = action.payload.id;
    const togglePublishTo = action.payload.togglePublishTo;
    const resp: Response = yield publishAssessment(id, togglePublishTo, tokens);

    if (!resp || !resp.ok) {
      yield handleResponseError(resp);
      return;
    }

    yield put(actions.fetchAssessmentOverviews());

    if (togglePublishTo) {
      yield call(showSuccessMessage, 'Published successfully!', 1000);
    } else {
      yield call(showSuccessMessage, 'Unpublished successfully!', 1000);
    }
  });

  yield takeEvery(UPLOAD_ASSESSMENT, function* (
    action: ReturnType<typeof actions.uploadAssessment>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const file = action.payload.file;
    const forceUpdate = action.payload.forceUpdate;
    const respMsg = yield uploadAssessment(file, tokens, forceUpdate);
    if (!respMsg) {
      yield handleResponseError(respMsg);
    } else if (respMsg === 'OK') {
      yield call(showSuccessMessage, 'Uploaded successfully!', 2000);
    } else if (respMsg === 'Force Update OK') {
      yield call(showSuccessMessage, 'Assessment force updated successfully!', 2000);
    } else {
      yield call(showWarningMessage, respMsg, 10000);
      return;
    }
    yield put(actions.fetchAssessmentOverviews());
  });

  yield takeEvery(UPLOAD_KEYSTROKE_LOGS, function* (
    action: ReturnType<typeof actions.uploadKeystrokeLogs>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const playbackData = action.payload.playbackData;
    const assessmentId = action.payload.assessmentId;
    const questionId = action.payload.questionId;
    const respMsg = yield postKeystrokeLogs(tokens, assessmentId, questionId, playbackData);
    if (!respMsg) {
      yield handleResponseError(respMsg);
      yield setResetLoggingFlag(false);
    } else {
      yield setResetLoggingFlag(true);
    }
  });

  /* yield takeEvery(actionTypes.FETCH_TEST_STORIES, function*(
    action: ReturnType<typeof actions.fetchTestStories>
  ) {
    // TODO: implement when stories backend is implemented
  }); */

  // Related to game, disabled for now
  /*
  yield takeEvery(SAVE_USER_STATE, function*(action: ReturnType<typeof actions.saveUserData>) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const gameState: GameState = action.payload;
    const resp = yield putUserGameState(gameState, tokens);
    if (!resp || !resp.ok) {
      yield handleResponseError(resp);
      return;
    }
    yield put(actions.setGameState(gameState));
  });
  */
}

function* handleReautogradeResponse(result: AsyncReturnType<typeof postReautogradeSubmission>) {
  switch (result) {
    case true:
      yield call(showSuccessMessage, 'Autograde job queued successfully.');
      break;
    case 'not_found':
    case false:
      yield call(showWarningMessage, 'Failed to queue autograde job.');
      break;
    case 'not_submitted':
      yield call(showWarningMessage, 'Cannot reautograde non-submitted submission.');
      break;
  }
}

export default BackendSaga;
