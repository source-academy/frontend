import { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery } from 'redux-saga/effects';

import { FETCH_GROUP_GRADING_SUMMARY } from '../../features/dashboard/DashboardTypes';
import { Grading, GradingOverview, GradingQuestion } from '../../features/grading/GradingTypes';
import {
  OverallState,
  Role,
  SourceLanguage,
  styliseSublanguage
} from '../application/ApplicationTypes';
import {
  ACKNOWLEDGE_NOTIFICATIONS,
  AdminPanelCourseRegistration,
  FETCH_ADMIN_PANEL_COURSE_REGISTRATIONS,
  FETCH_ASSESSMENT,
  FETCH_AUTH,
  FETCH_COURSE_CONFIG,
  FETCH_GRADING,
  FETCH_GRADING_OVERVIEWS,
  FETCH_NOTIFICATIONS,
  FETCH_USER_AND_COURSE,
  SUBMIT_ANSWER,
  SUBMIT_GRADING,
  SUBMIT_GRADING_AND_CONTINUE,
  Tokens,
  UNSUBMIT_SUBMISSION,
  UPDATE_ASSESSMENT_CONFIGS,
  UPDATE_COURSE_CONFIG,
  UPDATE_LATEST_VIEWED_COURSE
} from '../application/types/SessionTypes';
import {
  AssessmentOverview,
  AssessmentStatuses,
  FETCH_ASSESSMENT_OVERVIEWS,
  Question,
  SUBMIT_ASSESSMENT
} from '../assessment/AssessmentTypes';
import {
  Notification,
  NotificationFilterFunction
} from '../notificationBadge/NotificationBadgeTypes';
import { actions } from '../utils/ActionsHelper';
import { history } from '../utils/HistoryHelper';
import { showSuccessMessage, showWarningMessage } from '../utils/NotificationsHelper';
import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import {
  mockAssessmentConfigurations,
  mockAssessmentOverviews,
  mockAssessments
} from './AssessmentMocks';
import { mockFetchGrading, mockFetchGradingOverview, mockGradingSummary } from './GradingMocks';
import {
  mockAdminPanelCourseRegistrations,
  mockCourseConfigurations,
  mockCourseRegistrations,
  mockNotifications,
  mockUser
} from './UserMocks';

export function* mockBackendSaga(): SagaIterator {
  yield takeEvery(FETCH_AUTH, function* (action: ReturnType<typeof actions.fetchAuth>) {
    const tokens: Tokens = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken'
    };

    yield put(actions.setTokens(tokens));
    yield mockGetUserAndCourse();
    yield history.push('/academy');
  });

  const mockGetUserAndCourse = function* () {
    const user = { ...mockUser };
    const courseRegistration = { ...mockCourseRegistrations[0] };
    const courseConfiguration = { ...mockCourseConfigurations[0] };
    const assessmentConfigurations = [...mockAssessmentConfigurations[0]];
    const sublanguage: SourceLanguage = {
      chapter: courseConfiguration.sourceChapter,
      variant: courseConfiguration.sourceVariant,
      displayName: styliseSublanguage(
        courseConfiguration.sourceChapter,
        courseConfiguration.sourceVariant
      )
    };

    yield put(actions.setUser(user));
    yield put(actions.setCourseRegistration(courseRegistration));
    yield put(actions.setCourseConfiguration(courseConfiguration));
    yield put(actions.setAssessmentConfigurations(assessmentConfigurations));
    yield put(actions.updateSublanguage(sublanguage));
  };

  yield takeEvery(FETCH_USER_AND_COURSE, mockGetUserAndCourse);

  yield takeEvery(FETCH_COURSE_CONFIG, function* () {
    const courseConfiguration = { ...mockCourseConfigurations[0] };
    yield put(actions.setCourseConfiguration(courseConfiguration));
  });

  yield takeEvery(FETCH_ASSESSMENT_OVERVIEWS, function* () {
    yield put(actions.updateAssessmentOverviews([...mockAssessmentOverviews]));
  });

  yield takeEvery(FETCH_ASSESSMENT, function* (action: ReturnType<typeof actions.fetchAssessment>) {
    const id = action.payload;
    const assessment = mockAssessments[id - 1];
    yield put(actions.updateAssessment({ ...assessment }));
  });

  yield takeEvery(SUBMIT_ANSWER, function* (action: ReturnType<typeof actions.submitAnswer>): any {
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

  yield takeEvery(
    SUBMIT_ASSESSMENT,
    function* (action: ReturnType<typeof actions.submitAssessment>): any {
      const assessmentId = action.payload;

      // Update the status of the assessment overview in the store
      const overviews: AssessmentOverview[] = yield select(
        (state: OverallState) => state.session.assessmentOverviews
      );
      const newOverviews = overviews.map(overview => {
        if (overview.id === assessmentId) {
          return { ...overview, status: AssessmentStatuses.submitted };
        }
        return overview;
      });

      yield call(showSuccessMessage, 'Submitted!', 2000);
      return yield put(actions.updateAssessmentOverviews(newOverviews));
    }
  );

  yield takeEvery(
    FETCH_GRADING_OVERVIEWS,
    function* (action: ReturnType<typeof actions.fetchGradingOverviews>): any {
      const accessToken = yield select((state: OverallState) => state.session.accessToken);
      const filterToGroup = action.payload;
      const gradingOverviews = yield call(() =>
        mockFetchGradingOverview(accessToken, filterToGroup)
      );
      if (gradingOverviews !== null) {
        yield put(actions.updateGradingOverviews([...gradingOverviews]));
      }
    }
  );

  yield takeEvery(FETCH_GRADING, function* (action: ReturnType<typeof actions.fetchGrading>): any {
    const submissionId = action.payload;
    const accessToken = yield select((state: OverallState) => state.session.accessToken);
    const grading = yield call(() => mockFetchGrading(accessToken, submissionId));
    if (grading !== null) {
      yield put(actions.updateGrading(submissionId, [...grading]));
    }
  });

  yield takeEvery(
    UNSUBMIT_SUBMISSION,
    function* (action: ReturnType<typeof actions.unsubmitSubmission>) {
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
      yield call(showSuccessMessage, 'Unsubmit successful!', 1000);
      yield put(actions.updateGradingOverviews(newOverviews));
    }
  );

  const sendGrade = function* (
    action: ReturnType<typeof actions.submitGrading | typeof actions.submitGradingAndContinue>
  ): any {
    const role: Role = yield select((state: OverallState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can submit answers.');
    }

    const { submissionId, questionId, xpAdjustment, comments } = action.payload;
    // Now, update the grade for the question in the Grading in the store
    const grading: Grading = yield select((state: OverallState) =>
      state.session.gradings.get(submissionId)
    );
    const newGrading = grading.slice().map((gradingQuestion: GradingQuestion) => {
      if (gradingQuestion.question.id === questionId) {
        gradingQuestion.grade = {
          xpAdjustment,
          xp: gradingQuestion.grade.xp,
          comments
        };
      }
      return gradingQuestion;
    });
    yield put(actions.updateGrading(submissionId, newGrading));
    yield call(showSuccessMessage, 'Submitted!', 1000);
  };

  const sendGradeAndContinue = function* (
    action: ReturnType<typeof actions.submitGradingAndContinue>
  ): any {
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

  yield takeEvery(
    FETCH_NOTIFICATIONS,
    function* (action: ReturnType<typeof actions.fetchNotifications>) {
      yield put(actions.updateNotifications([...mockNotifications]));
    }
  );

  yield takeEvery(
    ACKNOWLEDGE_NOTIFICATIONS,
    function* (action: ReturnType<typeof actions.acknowledgeNotifications>) {
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
    }
  );

  yield takeEvery(
    UPDATE_LATEST_VIEWED_COURSE,
    function* (action: ReturnType<typeof actions.updateLatestViewedCourse>) {
      const { courseId } = action.payload;
      const idx = courseId - 1; // zero-indexed

      const courseConfiguration = { ...mockCourseConfigurations[idx] };
      yield put(actions.setCourseConfiguration(courseConfiguration));
      yield put(actions.setCourseRegistration({ ...mockCourseRegistrations[idx] }));
      yield put(actions.setAssessmentConfigurations([...mockAssessmentConfigurations[idx]]));
      yield put(
        actions.updateSublanguage({
          chapter: courseConfiguration.sourceChapter,
          variant: courseConfiguration.sourceVariant,
          displayName: styliseSublanguage(
            courseConfiguration.sourceChapter,
            courseConfiguration.sourceVariant
          )
        })
      );
      yield call(showSuccessMessage, `Switched to ${courseConfiguration.courseName}!`, 5000);
      yield history.push('/academy');
    }
  );

  yield takeEvery(
    UPDATE_COURSE_CONFIG,
    function* (action: ReturnType<typeof actions.updateCourseConfig>) {
      const courseConfig = action.payload;

      yield put(actions.setCourseConfiguration(courseConfig));
      yield call(showSuccessMessage, 'Updated successfully!', 1000);
    }
  );

  yield takeEvery(
    UPDATE_ASSESSMENT_CONFIGS,
    function* (action: ReturnType<typeof actions.updateAssessmentConfigs>): any {
      const assessmentConfig = action.payload;

      yield put(actions.setAssessmentConfigurations(assessmentConfig));
      yield call(showSuccessMessage, 'Updated successfully!', 1000);
    }
  );

  yield takeEvery(
    FETCH_ADMIN_PANEL_COURSE_REGISTRATIONS,
    function* (action: ReturnType<typeof actions.fetchAdminPanelCourseRegistrations>) {
      const courseRegistrations: AdminPanelCourseRegistration[] = [
        ...mockAdminPanelCourseRegistrations
      ];
      yield put(actions.setAdminPanelCourseRegistrations(courseRegistrations));
    }
  );

  yield takeEvery(FETCH_GROUP_GRADING_SUMMARY, function* () {
    yield put(actions.updateGroupGradingSummary({ ...mockGradingSummary }));
  });
}
