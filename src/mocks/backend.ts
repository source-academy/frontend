import { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery } from 'redux-saga/effects';

import * as actions from '../actions';
import * as actionTypes from '../actions/actionTypes';
import { WorkspaceLocation } from '../actions/workspaces';
import {
  Grading,
  GradingOverview,
  GradingQuestion
} from '../components/academy/grading/gradingShape';
import { IQuestion } from '../components/assessment/assessmentShape';
import {
  Notification,
  NotificationFilterFunction
} from '../components/notification/notificationShape';
import { store } from '../createStore';
import { GameState, IState, Role } from '../reducers/states';
import { history } from '../utils/history';
import { showSuccessMessage, showWarningMessage } from '../utils/notification';
import { mockAssessmentOverviews, mockAssessments } from './assessmentAPI';
import { mockFetchGrading, mockFetchGradingOverview } from './gradingAPI';
import { mockNotifications } from './userAPI';

export function* mockBackendSaga(): SagaIterator {
  yield takeEvery(actionTypes.FETCH_AUTH, function*(action: ReturnType<typeof actions.fetchAuth>) {
    const tokens = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken'
    };
    const user = {
      name: 'DevStaff',
      role: 'staff' as Role,
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

  yield takeEvery(actionTypes.FETCH_ASSESSMENT_OVERVIEWS, function*() {
    yield put(actions.updateAssessmentOverviews([...mockAssessmentOverviews]));
  });

  yield takeEvery(actionTypes.FETCH_ASSESSMENT, function*(
    action: ReturnType<typeof actions.fetchAssessment>
  ) {
    const id = action.payload;
    const assessment = mockAssessments[id - 1];
    yield put(actions.updateAssessment({ ...assessment }));
  });

  yield takeEvery(actionTypes.FETCH_GRADING_OVERVIEWS, function*(
    action: ReturnType<typeof actions.fetchGradingOverviews>
  ) {
    const accessToken = yield select((state: IState) => state.session.accessToken);
    const filterToGroup = action.payload;
    const gradingOverviews = yield call(() => mockFetchGradingOverview(accessToken, filterToGroup));
    if (gradingOverviews !== null) {
      yield put(actions.updateGradingOverviews([...gradingOverviews]));
    }
  });

  yield takeEvery(actionTypes.FETCH_GRADING, function*(
    action: ReturnType<typeof actions.fetchGrading>
  ) {
    const submissionId = action.payload;
    const accessToken = yield select((state: IState) => state.session.accessToken);
    const grading = yield call(() => mockFetchGrading(accessToken, submissionId));
    if (grading !== null) {
      yield put(actions.updateGrading(submissionId, [...grading]));
    }
  });

  yield takeEvery(actionTypes.SUBMIT_ANSWER, function*(
    action: ReturnType<typeof actions.submitAnswer>
  ) {
    const questionId = action.payload.id;
    const answer = action.payload.answer;
    // Now, update the answer for the question in the assessment in the store
    const assessmentId = yield select(
      (state: IState) => state.workspaces.assessment.currentAssessment!
    );
    const assessment = yield select((state: IState) => state.session.assessments.get(assessmentId));
    const newQuestions = assessment.questions.slice().map((question: IQuestion) => {
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

  yield takeEvery(actionTypes.UNSUBMIT_SUBMISSION, function*(
    action: ReturnType<typeof actions.unsubmitSubmission>
  ) {
    const { submissionId } = action.payload;
    const overviews: GradingOverview[] = yield select(
      (state: IState) => state.session.gradingOverviews || []
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
    const grading: Grading = yield select((state: IState) =>
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
      (state: IState) => state.workspaces.grading.currentQuestion
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

  yield takeEvery(actionTypes.SUBMIT_GRADING, sendGrade);

  yield takeEvery(actionTypes.SUBMIT_GRADING_AND_CONTINUE, sendGradeAndContinue);

  yield takeEvery(actionTypes.ACKNOWLEDGE_NOTIFICATIONS, function*(
    action: ReturnType<typeof actions.acknowledgeNotifications>
  ) {
    const notificationFilter: NotificationFilterFunction | undefined = action.payload.withFilter;

    const notifications: Notification[] = yield select(
      (state: IState) => state.session.notifications
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

  yield takeEvery(actionTypes.FETCH_NOTIFICATIONS, function*(
    action: ReturnType<typeof actions.fetchNotifications>
  ) {
    yield put(actions.updateNotifications(mockNotifications));
  });
}
