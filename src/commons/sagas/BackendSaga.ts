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
import {
  FETCH_GROUP_GRADING_SUMMARY,
  GradingSummary
} from '../../features/dashboard/DashboardTypes';
import { Grading, GradingOverview, GradingQuestion } from '../../features/grading/GradingTypes';
import {
  CHANGE_DATE_ASSESSMENT,
  DELETE_ASSESSMENT,
  PUBLISH_ASSESSMENT,
  UPLOAD_ASSESSMENT
} from '../../features/groundControl/GroundControlTypes';
import { FETCH_SOURCECAST_INDEX } from '../../features/sourceRecorder/sourcecast/SourcecastTypes';
import {
  SAVE_SOURCECAST_DATA,
  SourcecastData
} from '../../features/sourceRecorder/SourceRecorderTypes';
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
  Tokens,
  UNSUBMIT_SUBMISSION,
  User
} from '../application/types/SessionTypes';
import { actions } from '../utils/ActionsHelper';
import { computeRedirectUri, getClientId, getDefaultProvider } from '../utils/AuthHelper';
import { history } from '../utils/HistoryHelper';
import { showSuccessMessage, showWarningMessage } from '../utils/NotificationsHelper';
import {
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
  postReautogradeAnswer,
  postReautogradeSubmission,
  postSourcecast,
  postSublanguage,
  postUnsubmit,
  updateAssessment,
  uploadAssessment
} from './RequestsSaga';
import { safeTakeEvery as takeEvery } from './SafeEffects';

function selectTokens() {
  return select((state: OverallState) => ({
    accessToken: state.session.accessToken,
    refreshToken: state.session.refreshToken
  }));
}

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

    const tokens: Tokens | null = yield call(postAuth, code, providerId, clientId, redirectUrl);
    if (!tokens) {
      return yield history.push('/');
    }

    const user: User | null = yield call(getUser, tokens);
    if (!user) {
      return yield history.push('/');
    }

    yield put(actions.setTokens(tokens));
    yield put(actions.setUser(user));
    yield history.push('/academy');
  });

  yield takeEvery(FETCH_ASSESSMENT_OVERVIEWS, function* () {
    const tokens: Tokens = yield selectTokens();

    const assessmentOverviews: AssessmentOverview[] | null = yield call(
      getAssessmentOverviews,
      tokens
    );
    if (assessmentOverviews) {
      yield put(actions.updateAssessmentOverviews(assessmentOverviews));
    }
  });

  yield takeEvery(FETCH_ASSESSMENT, function* (action: ReturnType<typeof actions.fetchAssessment>) {
    const tokens: Tokens = yield selectTokens();

    const id = action.payload;

    const assessment: Assessment | null = yield call(getAssessment, id, tokens);
    if (assessment) {
      yield put(actions.updateAssessment(assessment));
    }
  });

  yield takeEvery(SUBMIT_ANSWER, function* (action: ReturnType<typeof actions.submitAnswer>) {
    const tokens: Tokens = yield selectTokens();
    const questionId = action.payload.id;
    const answer = action.payload.answer;

    const resp: Response | null = yield call(postAnswer, questionId, answer, tokens);
    if (!resp || !resp.ok) {
      return yield handleResponseError(resp);
    }

    yield call(showSuccessMessage, 'Saved!', 1000);

    // Now, update the answer for the question in the assessment in the store
    const assessmentId: number = yield select(
      (state: OverallState) => state.workspaces.assessment.currentAssessment!
    );
    const assessment: any = yield select((state: OverallState) =>
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

  yield takeEvery(
    SUBMIT_ASSESSMENT,
    function* (action: ReturnType<typeof actions.submitAssessment>) {
      const tokens: Tokens = yield selectTokens();
      const assessmentId = action.payload;

      const resp: Response | null = yield call(postAssessment, assessmentId, tokens);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
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
    }
  );

  yield takeEvery(
    FETCH_GRADING_OVERVIEWS,
    function* (action: ReturnType<typeof actions.fetchGradingOverviews>) {
      const tokens: Tokens = yield selectTokens();

      const filterToGroup = action.payload;

      const gradingOverviews: GradingOverview[] | null = yield call(
        getGradingOverviews,
        tokens,
        filterToGroup
      );
      if (gradingOverviews) {
        yield put(actions.updateGradingOverviews(gradingOverviews));
      }
    }
  );

  yield takeEvery(FETCH_GRADING, function* (action: ReturnType<typeof actions.fetchGrading>) {
    const tokens: Tokens = yield selectTokens();
    const id = action.payload;

    const grading: Grading | null = yield call(getGrading, id, tokens);
    if (grading) {
      yield put(actions.updateGrading(id, grading));
    }
  });

  /**
   * Unsubmits the submission and updates the grading overviews of the new status.
   */
  yield takeEvery(
    UNSUBMIT_SUBMISSION,
    function* (action: ReturnType<typeof actions.unsubmitSubmission>) {
      const tokens: Tokens = yield selectTokens();
      const { submissionId } = action.payload;

      const resp: Response | null = yield postUnsubmit(submissionId, tokens);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      const overviews: GradingOverview[] = yield select(
        (state: OverallState) => state.session.gradingOverviews || []
      );
      const newOverviews = overviews.map(overview => {
        if (overview.submissionId === submissionId) {
          return { ...overview, submissionStatus: 'attempted' };
        }
        return overview;
      });

      yield call(showSuccessMessage, 'Unsubmit successful', 1000);
      yield put(actions.updateGradingOverviews(newOverviews));
    }
  );

  const sendGrade = function* (
    action:
      | ReturnType<typeof actions.submitGrading>
      | ReturnType<typeof actions.submitGradingAndContinue>
  ) {
    const role: Role = yield select((state: OverallState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can submit answers.');
    }

    const { submissionId, questionId, gradeAdjustment, xpAdjustment, comments } = action.payload;
    const tokens: Tokens = yield selectTokens();

    const resp: Response | null = yield postGrading(
      submissionId,
      questionId,
      gradeAdjustment,
      xpAdjustment,
      tokens,
      comments
    );
    if (!resp || !resp.ok) {
      return yield handleResponseError(resp);
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
    yield* sendGrade(action);

    const { submissionId } = action.payload;
    const currentQuestion: number | undefined = yield select(
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

  yield takeEvery(
    REAUTOGRADE_SUBMISSION,
    function* (action: ReturnType<typeof actions.reautogradeSubmission>) {
      const submissionId = action.payload;
      const tokens: Tokens = yield selectTokens();
      const resp: Response | null = yield call(postReautogradeSubmission, submissionId, tokens);

      yield call(handleReautogradeResponse, resp);
    }
  );

  yield takeEvery(
    REAUTOGRADE_ANSWER,
    function* (action: ReturnType<typeof actions.reautogradeAnswer>) {
      const { submissionId, questionId } = action.payload;
      const tokens: Tokens = yield selectTokens();
      const resp: Response | null = yield call(
        postReautogradeAnswer,
        submissionId,
        questionId,
        tokens
      );

      yield call(handleReautogradeResponse, resp);
    }
  );

  yield takeEvery(
    FETCH_NOTIFICATIONS,
    function* (action: ReturnType<typeof actions.fetchNotifications>) {
      const tokens: Tokens = yield selectTokens();
      const notifications: Notification[] = yield call(getNotifications, tokens);

      yield put(actions.updateNotifications(notifications));
    }
  );

  yield takeEvery(
    ACKNOWLEDGE_NOTIFICATIONS,
    function* (action: ReturnType<typeof actions.acknowledgeNotifications>) {
      const tokens: Tokens = yield selectTokens();
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

      const resp: Response | null = yield call(postAcknowledgeNotifications, ids, tokens);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }
    }
  );

  yield takeEvery(
    DELETE_SOURCECAST_ENTRY,
    function* (action: ReturnType<typeof actions.deleteSourcecastEntry>) {
      const role: Role = yield select((state: OverallState) => state.session.role!);
      if (role === Role.Student) {
        return yield call(showWarningMessage, 'Only staff can delete sourcecasts.');
      }

      const tokens: Tokens = yield selectTokens();
      const { id } = action.payload;

      const resp: Response | null = yield deleteSourcecastEntry(id, tokens);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      const sourcecastIndex: SourcecastData[] | null = yield call(getSourcecastIndex, tokens);
      if (sourcecastIndex) {
        yield put(actions.updateSourcecastIndex(sourcecastIndex, action.payload.workspaceLocation));
      }

      yield call(showSuccessMessage, 'Deleted successfully!', 1000);
    }
  );

  yield takeEvery(
    FETCH_SOURCECAST_INDEX,
    function* (action: ReturnType<typeof actions.fetchSourcecastIndex>) {
      const tokens: Tokens = yield selectTokens();

      const sourcecastIndex: SourcecastData[] | null = yield call(getSourcecastIndex, tokens);
      if (sourcecastIndex) {
        yield put(actions.updateSourcecastIndex(sourcecastIndex, action.payload.workspaceLocation));
      }
    }
  );

  yield takeEvery(
    SAVE_SOURCECAST_DATA,
    function* (action: ReturnType<typeof actions.saveSourcecastData>) {
      const role: Role = yield select((state: OverallState) => state.session.role!);
      if (role === Role.Student) {
        return yield call(showWarningMessage, 'Only staff can save sourcecasts.');
      }

      const { title, description, uid, audio, playbackData } = action.payload;
      const tokens: Tokens = yield selectTokens();

      const resp: Response | null = yield postSourcecast(
        title,
        description,
        uid,
        audio,
        playbackData,
        tokens
      );
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      yield call(showSuccessMessage, 'Saved successfully!', 1000);
      yield history.push('/sourcecast');
    }
  );

  yield takeEvery(
    FETCH_SUBLANGUAGE,
    function* (action: ReturnType<typeof actions.fetchSublanguage>) {
      const sublang: SourceLanguage | null = yield call(getSublanguage);
      if (!sublang) {
        return yield call(
          showWarningMessage,
          `Failed to load default Source sublanguage for Playground!`
        );
      }

      yield put(actions.updateSublanguage(sublang));
    }
  );

  yield takeEvery(
    CHANGE_SUBLANGUAGE,
    function* (action: ReturnType<typeof actions.changeSublanguage>) {
      const tokens: Tokens = yield selectTokens();
      const { sublang } = action.payload;

      const resp: Response | null = yield call(
        postSublanguage,
        sublang.chapter,
        sublang.variant,
        tokens
      );
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      yield put(actions.updateSublanguage(sublang));
      yield call(showSuccessMessage, 'Updated successfully!', 1000);
    }
  );

  yield takeEvery(
    FETCH_GROUP_GRADING_SUMMARY,
    function* (action: ReturnType<typeof actions.fetchGroupGradingSummary>) {
      const tokens: Tokens = yield selectTokens();

      const groupOverviews: GradingSummary | null = yield call(getGradingSummary, tokens);
      if (groupOverviews) {
        yield put(actions.updateGroupGradingSummary(groupOverviews));
      }
    }
  );

  yield takeEvery(
    CHANGE_DATE_ASSESSMENT,
    function* (action: ReturnType<typeof actions.changeDateAssessment>) {
      const tokens: Tokens = yield selectTokens();
      const id = action.payload.id;
      const closeAt = action.payload.closeAt;
      const openAt = action.payload.openAt;

      const resp: Response | null = yield updateAssessment(id, { openAt, closeAt }, tokens);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      yield put(actions.fetchAssessmentOverviews());
      yield call(showSuccessMessage, 'Updated successfully!', 1000);
    }
  );

  yield takeEvery(
    DELETE_ASSESSMENT,
    function* (action: ReturnType<typeof actions.deleteAssessment>) {
      const tokens: Tokens = yield selectTokens();
      const id = action.payload;

      const resp: Response | null = yield deleteAssessment(id, tokens);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      yield put(actions.fetchAssessmentOverviews());
      yield call(showSuccessMessage, 'Deleted successfully!', 1000);
    }
  );

  yield takeEvery(
    PUBLISH_ASSESSMENT,
    function* (action: ReturnType<typeof actions.publishAssessment>) {
      const tokens: Tokens = yield selectTokens();
      const id = action.payload.id;
      const togglePublishTo = action.payload.togglePublishTo;

      const resp: Response | null = yield updateAssessment(
        id,
        { isPublished: togglePublishTo },
        tokens
      );
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      yield put(actions.fetchAssessmentOverviews());

      if (togglePublishTo) {
        yield call(showSuccessMessage, 'Published successfully!', 1000);
      } else {
        yield call(showSuccessMessage, 'Unpublished successfully!', 1000);
      }
    }
  );

  yield takeEvery(
    UPLOAD_ASSESSMENT,
    function* (action: ReturnType<typeof actions.uploadAssessment>) {
      const tokens: Tokens = yield selectTokens();
      const file = action.payload.file;
      const forceUpdate = action.payload.forceUpdate;

      const resp: Response | null = yield uploadAssessment(file, tokens, forceUpdate);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      const respText: string = yield resp.text();
      if (respText === 'OK') {
        yield call(showSuccessMessage, 'Uploaded successfully!', 2000);
      } else if (respText === 'Force Update OK') {
        yield call(showSuccessMessage, 'Assessment force updated successfully!', 2000);
      }

      yield put(actions.fetchAssessmentOverviews());
    }
  );
}

function* handleReautogradeResponse(resp: Response | null) {
  if (resp && resp.ok) {
    return yield call(showSuccessMessage, 'Autograde job queued successfully.');
  }

  if (resp && resp.status === 400) {
    return yield call(showWarningMessage, 'Cannot reautograde non-submitted submission.');
  }

  return yield call(showWarningMessage, 'Failed to queue autograde job.');
}

export default BackendSaga;
