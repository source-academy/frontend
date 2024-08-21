import { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import DashboardActions from 'src/features/dashboard/DashboardActions';

import {
  GradingOverviews,
  GradingQuery,
  GradingQuestion,
  SortStates
} from '../../features/grading/GradingTypes';
import SessionActions from '../application/actions/SessionActions';
import {
  OverallState,
  Role,
  SALanguage,
  styliseSublanguage,
  SupportedLanguage
} from '../application/ApplicationTypes';
import { AdminPanelCourseRegistration, Tokens } from '../application/types/SessionTypes';
import {
  AssessmentOverview,
  AssessmentStatuses,
  ProgressStatuses,
  Question
} from '../assessment/AssessmentTypes';
import {
  Notification,
  NotificationFilterFunction
} from '../notificationBadge/NotificationBadgeTypes';
import { routerNavigate } from '../sagas/BackendSaga';
import { actions } from '../utils/ActionsHelper';
import { showSuccessMessage, showWarningMessage } from '../utils/notifications/NotificationsHelper';
import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import {
  mockAssessmentConfigurations,
  mockAssessmentOverviews,
  mockAssessments
} from './AssessmentMocks';
import { mockFetchGrading, mockFetchGradingOverview, mockGradingSummary } from './GradingMocks';
import {
  mockBulkUploadTeam,
  mockCreateTeam,
  mockDeleteTeam,
  mockFetchTeamFormationOverview,
  mockUpdateTeam
} from './TeamFormationMocks';
import {
  mockAdminPanelCourseRegistrations,
  mockCourseConfigurations,
  mockCourseRegistrations,
  mockFetchStudents,
  mockNotifications,
  mockUser
} from './UserMocks';

// TODO: Removal/implementation pending on outcome of
// https://github.com/source-academy/frontend/issues/2974
export function* mockBackendSaga(): SagaIterator {
  yield takeEvery(
    SessionActions.fetchAuth.type,
    function* (action: ReturnType<typeof actions.fetchAuth>) {
      const tokens: Tokens = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken'
      };

      yield put(actions.setTokens(tokens));
      yield mockGetUserAndCourse();
      const courseId: number = yield select((state: OverallState) => state.session.courseId!);
      yield routerNavigate(`/courses/${courseId}`);
    }
  );

  const mockGetUserAndCourse = function* () {
    const user = { ...mockUser };
    const courseRegistration = { ...mockCourseRegistrations[0] };
    const courseConfiguration = { ...mockCourseConfigurations[0] };
    const assessmentConfigurations = [...mockAssessmentConfigurations[0]];
    const sublanguage: SALanguage = {
      chapter: courseConfiguration.sourceChapter,
      variant: courseConfiguration.sourceVariant,
      displayName: styliseSublanguage(
        courseConfiguration.sourceChapter,
        courseConfiguration.sourceVariant
      ),
      mainLanguage: SupportedLanguage.JAVASCRIPT,
      supports: {}
    };

    yield put(actions.setUser(user));
    yield put(actions.setCourseRegistration(courseRegistration));
    yield put(actions.setCourseConfiguration(courseConfiguration));
    yield put(actions.setAssessmentConfigurations(assessmentConfigurations));
    yield put(actions.updateSublanguage(sublanguage));
  };

  yield takeEvery(SessionActions.fetchUserAndCourse.type, mockGetUserAndCourse);

  yield takeEvery(SessionActions.fetchCourseConfig.type, function* () {
    const courseConfiguration = { ...mockCourseConfigurations[0] };
    yield put(actions.setCourseConfiguration(courseConfiguration));
  });

  yield takeEvery(SessionActions.fetchAssessmentOverviews.type, function* () {
    yield put(actions.updateAssessmentOverviews([...mockAssessmentOverviews]));
  });

  yield takeEvery(
    SessionActions.fetchAssessment.type,
    function* (action: ReturnType<typeof actions.fetchAssessment>) {
      const { assessmentId: id } = action.payload;
      const assessment = mockAssessments[id - 1];
      yield put(actions.updateAssessment({ ...assessment }));
    }
  );

  yield takeEvery(
    SessionActions.submitAnswer.type,
    function* (action: ReturnType<typeof actions.submitAnswer>): any {
      const questionId = action.payload.id;
      const answer = action.payload.answer;
      // Now, update the answer for the question in the assessment in the store
      const assessmentId = yield select(
        (state: OverallState) => state.workspaces.assessment.currentAssessment!
      );
      const assessment = yield select(
        (state: OverallState) => state.session.assessments[assessmentId]
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
    }
  );

  yield takeEvery(
    SessionActions.submitAssessment.type,
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
    SessionActions.fetchGradingOverviews.type,
    function* (action: ReturnType<typeof actions.fetchGradingOverviews>): any {
      const accessToken = yield select((state: OverallState) => state.session.accessToken);
      const { filterToGroup, pageParams, filterParams, allColsSortStates } = action.payload;
      const sortedBy = {
        sortBy: allColsSortStates.sortBy,
        sortDirection: ''
      };

      Object.keys(allColsSortStates.currentState).forEach(key => {
        if (allColsSortStates.sortBy === key && key) {
          if (allColsSortStates.currentState[key] !== SortStates.NONE) {
            sortedBy.sortDirection = allColsSortStates.currentState[key];
          } else {
            sortedBy.sortBy = '';
            sortedBy.sortDirection = '';
          }
        }
      });

      const gradingOverviews = yield call(() =>
        mockFetchGradingOverview(accessToken, filterToGroup, pageParams, filterParams, sortedBy)
      );
      if (gradingOverviews !== null) {
        yield put(actions.updateGradingOverviews(gradingOverviews));
      }
    }
  );

  yield takeEvery(
    SessionActions.fetchTeamFormationOverviews.type,
    function* (action: ReturnType<typeof actions.fetchTeamFormationOverviews>): any {
      const accessToken = yield select((state: OverallState) => state.session.accessToken);
      const filterToGroup = action.payload;
      const teamFormationOverviews = yield call(() =>
        mockFetchTeamFormationOverview(accessToken, filterToGroup)
      );
      if (teamFormationOverviews !== null) {
        yield put(actions.updateTeamFormationOverviews([...teamFormationOverviews]));
      }
    }
  );

  yield takeEvery(
    SessionActions.createTeam.type,
    function* (action: ReturnType<typeof actions.createTeam>): any {
      const accessToken = yield select((state: OverallState) => state.session.accessToken);
      const { assessment, teams } = action.payload;

      const teamFormationOverviews = yield call(() =>
        mockCreateTeam(accessToken, assessment.id, assessment.title, assessment.type, teams)
      );
      if (teamFormationOverviews !== null) {
        yield put(actions.updateTeamFormationOverviews([...teamFormationOverviews]));
      }
    }
  );

  yield takeEvery(
    SessionActions.bulkUploadTeam.type,
    function* (action: ReturnType<typeof actions.bulkUploadTeam>): any {
      const accessToken = yield select((state: OverallState) => state.session.accessToken);
      const { assessment, file } = action.payload;

      const teamFormationOverviews = yield call(() =>
        mockBulkUploadTeam(accessToken, assessment.id, assessment.title, assessment.type, file)
      );
      if (teamFormationOverviews !== null) {
        yield put(actions.updateTeamFormationOverviews([...teamFormationOverviews]));
      }
    }
  );

  yield takeEvery(
    SessionActions.updateTeam.type,
    function* (action: ReturnType<typeof actions.updateTeam>): any {
      const accessToken = yield select((state: OverallState) => state.session.accessToken);
      const { teamId, assessment, teams } = action.payload;

      const teamFormationOverviews = yield call(() =>
        mockUpdateTeam(accessToken, teamId, assessment.id, assessment.title, assessment.type, teams)
      );
      if (teamFormationOverviews !== null) {
        yield put(actions.updateTeamFormationOverviews([...teamFormationOverviews]));
      }
    }
  );

  yield takeEvery(
    SessionActions.deleteTeam.type,
    function* (action: ReturnType<typeof actions.deleteTeam>): any {
      const accessToken = yield select((state: OverallState) => state.session.accessToken);
      const { teamId } = action.payload;

      const teamFormationOverviews = yield call(() => mockDeleteTeam(accessToken, teamId));
      if (teamFormationOverviews !== null) {
        yield put(actions.updateTeamFormationOverviews([...teamFormationOverviews]));
      }
    }
  );

  yield takeEvery(
    SessionActions.fetchStudents.type,
    function* (action: ReturnType<typeof actions.fetchStudents>): any {
      const accessToken = yield select((state: OverallState) => state.session.accessToken);
      const students = yield call(() => mockFetchStudents(accessToken));
      if (students !== null) {
        yield put(actions.updateStudents([...students]));
      }
    }
  );

  yield takeEvery(
    SessionActions.fetchGrading.type,
    function* (action: ReturnType<typeof actions.fetchGrading>): any {
      const submissionId = action.payload;
      const accessToken = yield select((state: OverallState) => state.session.accessToken);
      const grading = yield call(() => mockFetchGrading(accessToken, submissionId));
      if (grading !== null) {
        yield put(actions.updateGrading(submissionId, grading));
      }
    }
  );

  yield takeEvery(
    SessionActions.unsubmitSubmission.type,
    function* (action: ReturnType<typeof actions.unsubmitSubmission>) {
      const { submissionId } = action.payload;
      const overviews: GradingOverviews = yield select(
        (state: OverallState) =>
          state.session.gradingOverviews || {
            count: 0,
            data: []
          }
      );
      const index = overviews.data.findIndex(
        overview =>
          overview.submissionId === submissionId && overview.progress === ProgressStatuses.submitted
      );
      if (index === -1) {
        yield call(showWarningMessage, '400: Bad Request');
        return;
      }
      const newOverviews = overviews.data.map(overview => {
        if (overview.submissionId === submissionId) {
          overview.progress = ProgressStatuses.attempted;
        }
        return overview;
      });
      yield call(showSuccessMessage, 'Unsubmit successful!', 1000);
      yield put(actions.updateGradingOverviews({ ...overviews, data: newOverviews }));
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
    const grading: GradingQuery = yield select(
      (state: OverallState) => state.session.gradings[submissionId]
    );
    const newGrading = grading.answers.slice().map((gradingQuestion: GradingQuestion) => {
      if (gradingQuestion.question.id === questionId) {
        gradingQuestion.grade = {
          xpAdjustment,
          xp: gradingQuestion.grade.xp,
          comments,
          gradedAt: new Date().toISOString()
        };
      }
      return gradingQuestion;
    });
    yield put(
      actions.updateGrading(submissionId, { answers: newGrading, assessment: grading.assessment })
    );
    yield call(showSuccessMessage, 'Submitted!', 1000);
  };

  const sendGradeAndContinue = function* (
    action: ReturnType<typeof actions.submitGradingAndContinue>
  ): any {
    const { submissionId } = action.payload;
    yield* sendGrade(action);

    const [currentQuestion, courseId] = yield select((state: OverallState) => [
      state.workspaces.grading.currentQuestion,
      state.session.courseId!
    ]);
    /**
     * Move to next question for grading: this only works because the
     * SUBMIT_GRADING_AND_CONTINUE Redux action is currently only
     * used in the Grading Workspace
     *
     * If the questionId is out of bounds, the componentDidUpdate callback of
     * GradingWorkspace will cause a redirect back to '/courses/${courseId}/grading'
     */
    yield routerNavigate(
      `/courses/${courseId}/grading/${submissionId}/${(currentQuestion || 0) + 1}`
    );
  };

  yield takeEvery(SessionActions.submitGrading.type, sendGrade);

  yield takeEvery(SessionActions.submitGradingAndContinue.type, sendGradeAndContinue);

  yield takeEvery(
    SessionActions.fetchNotifications.type,
    function* (action: ReturnType<typeof actions.fetchNotifications>) {
      yield put(actions.updateNotifications([...mockNotifications]));
    }
  );

  yield takeEvery(
    SessionActions.acknowledgeNotifications.type,
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
    SessionActions.updateLatestViewedCourse.type,
    function* (action: ReturnType<typeof actions.updateLatestViewedCourse>) {
      const { courseId } = action.payload;
      const idx = courseId - 1; // zero-indexed

      const courseConfiguration = { ...mockCourseConfigurations[idx] };
      yield put(actions.setCourseConfiguration(courseConfiguration));
      yield put(actions.setAssessmentConfigurations([...mockAssessmentConfigurations[idx]]));
      yield put(actions.setCourseRegistration({ ...mockCourseRegistrations[idx] }));
      yield put(
        actions.updateSublanguage({
          chapter: courseConfiguration.sourceChapter,
          variant: courseConfiguration.sourceVariant,
          displayName: styliseSublanguage(
            courseConfiguration.sourceChapter,
            courseConfiguration.sourceVariant
          ),
          mainLanguage: SupportedLanguage.JAVASCRIPT,
          supports: {}
        })
      );
      yield call(showSuccessMessage, `Switched to ${courseConfiguration.courseName}!`, 5000);
    }
  );

  yield takeEvery(
    SessionActions.updateCourseConfig.type,
    function* (action: ReturnType<typeof actions.updateCourseConfig>) {
      const courseConfig = action.payload;

      yield put(actions.setCourseConfiguration(courseConfig));
      yield call(showSuccessMessage, 'Updated successfully!', 1000);
    }
  );

  yield takeEvery(
    SessionActions.updateAssessmentConfigs.type,
    function* (action: ReturnType<typeof actions.updateAssessmentConfigs>): any {
      const assessmentConfig = action.payload;

      yield put(actions.setAssessmentConfigurations(assessmentConfig));
      yield call(showSuccessMessage, 'Updated successfully!', 1000);
    }
  );

  yield takeEvery(
    SessionActions.fetchAdminPanelCourseRegistrations.type,
    function* (action: ReturnType<typeof actions.fetchAdminPanelCourseRegistrations>) {
      const courseRegistrations: AdminPanelCourseRegistration[] = [
        ...mockAdminPanelCourseRegistrations
      ];
      yield put(actions.setAdminPanelCourseRegistrations(courseRegistrations));
    }
  );

  yield takeEvery(DashboardActions.fetchGroupGradingSummary.type, function* () {
    yield put(actions.updateGroupGradingSummary({ ...mockGradingSummary }));
  });
}
