import { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery } from 'redux-saga/effects';

import { store } from '../../createStore';
import { FETCH_GROUP_OVERVIEWS } from '../../features/dashboard/DashboardTypes';
import { Grading, GradingOverview, GradingQuestion } from '../../features/grading/GradingTypes';
import { GameState, OverallState, Role } from '../application/ApplicationTypes';
import {
  ACKNOWLEDGE_NOTIFICATIONS,
  FETCH_ASSESSMENT,
  FETCH_AUTH,
  FETCH_GRADING,
  FETCH_GRADING_OVERVIEWS,
  FETCH_NOTIFICATIONS,
  SUBMIT_ANSWER,
  SUBMIT_GRADING,
  SUBMIT_GRADING_AND_CONTINUE,
  UNSUBMIT_SUBMISSION
} from '../application/types/SessionTypes';
import { FETCH_ASSESSMENT_OVERVIEWS, Question } from '../assessment/AssessmentTypes';
import {
  Notification,
  NotificationFilterFunction
} from '../notificationBadge/NotificationBadgeTypes';
import { actions } from '../utils/ActionsHelper';
import { history } from '../utils/HistoryHelper';
import { showSuccessMessage, showWarningMessage } from '../utils/NotificationsHelper';
import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import { mockAssessmentOverviews, mockAssessments } from './AssessmentMocks';
import { mockFetchGrading, mockFetchGradingOverview } from './GradingMocks';
import { mockGroupOverviews } from './GroupMocks';
import { mockNotifications } from './UserMocks';

export function* mockBackendSaga(): SagaIterator {
  yield takeEvery(FETCH_AUTH, function*(action: ReturnType<typeof actions.fetchAuth>) {
    const tokens = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken'
    };
    const user = {
      name: 'DevStaff',
      role: 'staff' as Role,
      group: '1F',
      story: {
        story: 'mission-1',
        playStory: true
      },
      grade: 0,
      gameState: {} as GameState
    };
    store.dispatch(actions.setTokens(tokens));
    store.dispatch(actions.setUser(user));
    yield history.push('/academy');
  });

  yield takeEvery(FETCH_ASSESSMENT_OVERVIEWS, function*() {
    yield put(actions.updateAssessmentOverviews([...mockAssessmentOverviews]));
  });

  yield takeEvery(FETCH_ASSESSMENT, function*(action: ReturnType<typeof actions.fetchAssessment>) {
    const id = action.payload;
    const assessment = mockAssessments[id - 1];
    yield put(actions.updateAssessment({ ...assessment }));
  });

  yield takeEvery(FETCH_GRADING_OVERVIEWS, function*(
    action: ReturnType<typeof actions.fetchGradingOverviews>
  ) {
    const accessToken = yield select((state: OverallState) => state.session.accessToken);
    const filterToGroup = action.payload;
    const gradingOverviews = yield call(() => mockFetchGradingOverview(accessToken, filterToGroup));
    if (gradingOverviews !== null) {
      yield put(actions.updateGradingOverviews([...gradingOverviews]));
    }
  });

  yield takeEvery(FETCH_GRADING, function*(action: ReturnType<typeof actions.fetchGrading>) {
    const submissionId = action.payload;
    const accessToken = yield select((state: OverallState) => state.session.accessToken);
    const grading = yield call(() => mockFetchGrading(accessToken, submissionId));
    if (grading !== null) {
      yield put(actions.updateGrading(submissionId, [...grading]));
    }
  });

  yield takeEvery(SUBMIT_ANSWER, function*(action: ReturnType<typeof actions.submitAnswer>) {
    const questionId = action.payload.id;
    const answer = action.payload.answer;
    // Now, update the answer for the question in the assessment in the store
    const assessmentId = yield select(
      (state: OverallState) => state.workspaces.assessment.currentAssessment!
    );
    const assessment = yield select((state: OverallState) =>
      state.session.assessments.get(assessmentId)
    );
    const newQuestions = assessment.questions.slice().map((question: Question) => {
      if (question.id === questionId) {
        question.answer = answer;
      }
      return question;
    });
    const newAssessment = {
      ...assessment,
      questions: newQuestions
    };
    yield put(actions.updateAssessment(newAssessment));
    yield call(showSuccessMessage, 'Saved!', 1000);
    return yield put(actions.updateHasUnsavedChanges('assessment' as WorkspaceLocation, false));
  });

  yield takeEvery(UNSUBMIT_SUBMISSION, function*(
    action: ReturnType<typeof actions.unsubmitSubmission>
  ) {
    const { submissionId } = action.payload;
    const overviews: GradingOverview[] = yield select(
      (state: OverallState) => state.session.gradingOverviews || []
    );
    const index = overviews.findIndex(
      overview =>
        overview.submissionId === submissionId && overview.submissionStatus === 'submitted'
    );
    if (index === -1) {
      yield call(showWarningMessage, '400: Bad Request');
      return;
    }
    const newOverviews = (overviews as GradingOverview[]).map(overview => {
      if (overview.submissionId === submissionId) {
        return { ...overview, submissionStatus: 'attempted' };
      }
      return overview;
    });
    yield call(showSuccessMessage, 'Unsubmitted!', 1000);
    yield put(actions.updateGradingOverviews(newOverviews));
  });

  const sendGrade = function*(
    action: ReturnType<typeof actions.submitGrading | typeof actions.submitGradingAndContinue>
  ) {
    const { submissionId, questionId, gradeAdjustment, xpAdjustment, comments } = action.payload;
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
    yield call(showSuccessMessage, 'Submitted!', 1000);
  };

  const sendGradeAndContinue = function*(
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
    yield history.push('/academy/grading' + `/${submissionId}` + `/${(currentQuestion || 0) + 1}`);
  };

  yield takeEvery(SUBMIT_GRADING, sendGrade);

  yield takeEvery(SUBMIT_GRADING_AND_CONTINUE, sendGradeAndContinue);

  yield takeEvery(ACKNOWLEDGE_NOTIFICATIONS, function*(
    action: ReturnType<typeof actions.acknowledgeNotifications>
  ) {
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
  });

  yield takeEvery(FETCH_NOTIFICATIONS, function*(
    action: ReturnType<typeof actions.fetchNotifications>
  ) {
    yield put(actions.updateNotifications(mockNotifications));
  });

  yield takeEvery(FETCH_GROUP_OVERVIEWS, function*() {
    yield put(actions.updateGroupOverviews([...mockGroupOverviews]));
  });
}
