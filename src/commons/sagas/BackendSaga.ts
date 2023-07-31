/*eslint no-eval: "error"*/
/*eslint-env browser*/
import { SagaIterator } from 'redux-saga';
import { call, put, select } from 'redux-saga/effects';
import { ADD_NEW_USERS_TO_COURSE, CREATE_COURSE } from 'src/features/academy/AcademyTypes';
import { UsernameRoleGroup } from 'src/pages/academy/adminPanel/subcomponents/AddUserPanel';

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
import { OverallState, Role } from '../application/ApplicationTypes';
import { RouterState } from '../application/types/CommonsTypes';
import {
  ACKNOWLEDGE_NOTIFICATIONS,
  AdminPanelCourseRegistration,
  CourseConfiguration,
  CourseRegistration,
  DELETE_ASSESSMENT_CONFIG,
  DELETE_TIME_OPTIONS,
  DELETE_USER_COURSE_REGISTRATION,
  FETCH_ADMIN_PANEL_COURSE_REGISTRATIONS,
  FETCH_ALL_USER_XP,
  FETCH_ASSESSMENT,
  FETCH_ASSESSMENT_ADMIN,
  FETCH_ASSESSMENT_CONFIGS,
  FETCH_AUTH,
  FETCH_CONFIGURABLE_NOTIFICATION_CONFIGS,
  FETCH_COURSE_CONFIG,
  FETCH_GRADING,
  FETCH_GRADING_OVERVIEWS,
  FETCH_NOTIFICATION_CONFIGS,
  FETCH_NOTIFICATIONS,
  FETCH_TOTAL_XP,
  FETCH_TOTAL_XP_ADMIN,
  FETCH_USER_AND_COURSE,
  NotificationConfiguration,
  REAUTOGRADE_ANSWER,
  REAUTOGRADE_SUBMISSION,
  SUBMIT_ANSWER,
  SUBMIT_GRADING,
  SUBMIT_GRADING_AND_CONTINUE,
  TimeOption,
  Tokens,
  UNSUBMIT_SUBMISSION,
  UPDATE_ASSESSMENT_CONFIGS,
  UPDATE_COURSE_CONFIG,
  UPDATE_COURSE_RESEARCH_AGREEMENT,
  UPDATE_LATEST_VIEWED_COURSE,
  UPDATE_NOTIFICATION_CONFIG,
  UPDATE_NOTIFICATION_PREFERENCES,
  UPDATE_TIME_OPTIONS,
  UPDATE_USER_ROLE,
  UpdateCourseConfiguration,
  User
} from '../application/types/SessionTypes';
import {
  Assessment,
  AssessmentConfiguration,
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
import { computeRedirectUri, getClientId, getDefaultProvider } from '../utils/AuthHelper';
import { showSuccessMessage, showWarningMessage } from '../utils/notifications/NotificationsHelper';
import { CHANGE_SUBLANGUAGE, WorkspaceLocation } from '../workspace/WorkspaceTypes';
import {
  deleteAssessment,
  deleteSourcecastEntry,
  getAllUserXp,
  getAssessment,
  getAssessmentConfigs,
  getAssessmentOverviews,
  getConfigurableNotificationConfigs,
  getCourseConfig,
  getGrading,
  getGradingOverviews,
  getGradingSummary,
  getLatestCourseRegistrationAndConfiguration,
  getNotificationConfigs,
  getNotifications,
  getSourcecastIndex,
  getTotalXp,
  getUser,
  getUserCourseRegistrations,
  handleResponseError,
  postAcknowledgeNotifications,
  postAnswer,
  postAssessment,
  postAuth,
  postCreateCourse,
  postGrading,
  postReautogradeAnswer,
  postReautogradeSubmission,
  postSourcecast,
  postUnsubmit,
  putAssessmentConfigs,
  putCourseConfig,
  putCourseResearchAgreement,
  putLatestViewedCourse,
  putNewUsers,
  putNotificationConfigs,
  putNotificationPreferences,
  putTimeOptions,
  putUserRole,
  removeAssessmentConfig,
  removeTimeOptions,
  removeUserCourseRegistration,
  updateAssessment,
  uploadAssessment
} from './RequestsSaga';
import { safeTakeEvery as takeEvery } from './SafeEffects';

export function selectTokens() {
  return select((state: OverallState) => ({
    accessToken: state.session.accessToken,
    refreshToken: state.session.refreshToken
  }));
}

function selectRouter() {
  return select((state: OverallState) => state.router);
}
export function* routerNavigate(path: string) {
  const router: RouterState = yield selectRouter();
  return router?.navigate(path);
}

function* BackendSaga(): SagaIterator {
  yield takeEvery(FETCH_AUTH, function* (action: ReturnType<typeof actions.fetchAuth>): any {
    const { code, providerId: payloadProviderId } = action.payload;

    const providerId = payloadProviderId || (getDefaultProvider() || [null])[0];
    if (!providerId) {
      yield call(
        showWarningMessage,
        'Could not log in; invalid provider or no providers configured.'
      );
      return yield routerNavigate('/');
    }

    const clientId = getClientId(providerId);
    const redirectUrl = computeRedirectUri(providerId);

    const tokens: Tokens | null = yield call(postAuth, code, providerId, clientId, redirectUrl);
    if (!tokens) {
      return yield routerNavigate('/');
    }
    yield put(actions.setTokens(tokens));

    // Note: courseRegistration, courseConfiguration and assessmentConfigurations
    // are either all null OR all not null
    const {
      user,
      courseRegistration,
      courseConfiguration,
      assessmentConfigurations
    }: {
      user: User | null;
      courseRegistration: CourseRegistration | null;
      courseConfiguration: CourseConfiguration | null;
      assessmentConfigurations: AssessmentConfiguration[] | null;
    } = yield call(getUser, tokens);

    if (!user) {
      return;
    }

    yield put(actions.setUser(user));

    // Handle case where user does not have a latest viewed course in the backend
    // but is enrolled in some course (this happens occationally due to e.g. removal from a course)
    if (courseConfiguration === null && user.courses.length > 0) {
      yield put(actions.updateLatestViewedCourse(user.courses[0].courseId));
    }

    if (courseRegistration && courseConfiguration && assessmentConfigurations) {
      yield put(actions.setCourseRegistration(courseRegistration));
      yield put(actions.setCourseConfiguration(courseConfiguration));
      yield put(actions.setAssessmentConfigurations(assessmentConfigurations));

      yield put(actions.getStoriesUser());
      // TODO: Fetch associated stories group ID
    }
    /**
     * NOTE: Navigation logic is now handled in <Login /> component.
     * - Due to route hoisting in react-router v6, which requires us to declare routes at the top level,
     *   we need to rerender the router to include Academy routes when the user logs in, which occurs in ApplicationWrapper.tsx.
     * - However, the current router instance we have access to HERE in this saga via `routerNavigate` is the old router instance.
     * - Thus handling navigation in <Login /> allows us to directly access the latest router via `useNavigate`.
     */
  });

  yield takeEvery(
    FETCH_USER_AND_COURSE,
    function* (action: ReturnType<typeof actions.fetchUserAndCourse>): any {
      const tokens: Tokens = yield selectTokens();

      const {
        user,
        courseRegistration,
        courseConfiguration,
        assessmentConfigurations
      }: {
        user: User | null;
        courseRegistration: CourseRegistration | null;
        courseConfiguration: CourseConfiguration | null;
        assessmentConfigurations: AssessmentConfiguration[] | null;
      } = yield call(getUser, tokens);

      if (!user) {
        return;
      }

      yield put(actions.setUser(user));

      // Handle case where user does not have a latest viewed course in the backend
      // but is enrolled in some course (this happens occationally due to e.g. removal from a course)
      if (courseConfiguration === null && user.courses.length > 0) {
        yield put(actions.updateLatestViewedCourse(user.courses[0].courseId));
      }

      if (courseRegistration && courseConfiguration && assessmentConfigurations) {
        yield put(actions.setCourseRegistration(courseRegistration));
        yield put(actions.setCourseConfiguration(courseConfiguration));
        yield put(actions.setAssessmentConfigurations(assessmentConfigurations));

        yield put(actions.getStoriesUser());
        // TODO: Fetch associated stories group ID
      }
    }
  );

  yield takeEvery(FETCH_COURSE_CONFIG, function* () {
    const tokens: Tokens = yield selectTokens();
    const { config }: { config: CourseConfiguration | null } = yield call(getCourseConfig, tokens);
    if (config) {
      yield put(actions.setCourseConfiguration(config));

      yield put(actions.getStoriesUser());
      // TODO: Fetch associated stories group ID
    }
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

  yield takeEvery(FETCH_ALL_USER_XP, function* () {
    const tokens: Tokens = yield selectTokens();

    const res: { all_users_xp: string[][] } = yield call(getAllUserXp, tokens);
    if (res) {
      yield put(actions.updateAllUserXp(res.all_users_xp));
    }
  });

  yield takeEvery(FETCH_TOTAL_XP, function* () {
    const tokens: Tokens = yield selectTokens();

    const res: { totalXp: number } = yield call(getTotalXp, tokens);
    if (res) {
      yield put(actions.updateTotalXp(res.totalXp));
    }
  });

  yield takeEvery(
    FETCH_TOTAL_XP_ADMIN,
    function* (action: ReturnType<typeof actions.fetchTotalXpAdmin>) {
      const tokens: Tokens = yield selectTokens();

      const courseRegId = action.payload;

      const res: { totalXp: number } = yield call(getTotalXp, tokens, courseRegId);
      if (res) {
        yield put(actions.updateTotalXp(res.totalXp));
      }
    }
  );

  yield takeEvery(FETCH_ASSESSMENT, function* (action: ReturnType<typeof actions.fetchAssessment>) {
    const tokens: Tokens = yield selectTokens();

    const assessmentId = action.payload;

    const assessment: Assessment | null = yield call(getAssessment, assessmentId, tokens);
    if (assessment) {
      yield put(actions.updateAssessment(assessment));
    }
  });

  yield takeEvery(
    FETCH_ASSESSMENT_ADMIN,
    function* (action: ReturnType<typeof actions.fetchAssessmentAdmin>) {
      const tokens: Tokens = yield selectTokens();

      const { assessmentId, courseRegId } = action.payload;

      const assessment: Assessment | null = yield call(
        getAssessment,
        assessmentId,
        tokens,
        courseRegId
      );
      if (assessment) {
        yield put(actions.updateAssessment(assessment));
      }
    }
  );

  yield takeEvery(SUBMIT_ANSWER, function* (action: ReturnType<typeof actions.submitAnswer>): any {
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
    function* (action: ReturnType<typeof actions.submitAssessment>): any {
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
    function* (action: ReturnType<typeof actions.unsubmitSubmission>): any {
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
  ): any {
    const role: Role = yield select((state: OverallState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can submit answers.');
    }

    const { submissionId, questionId, xpAdjustment, comments } = action.payload;
    const tokens: Tokens = yield selectTokens();

    const resp: Response | null = yield postGrading(
      submissionId,
      questionId,
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
          xpAdjustment,
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
    const [currentQuestion, courseId]: [number | undefined, number] = yield select(
      (state: OverallState) => [state.workspaces.grading.currentQuestion, state.session.courseId!]
    );

    /**
     * Move to next question for grading: this only works because the
     * SUBMIT_GRADING_AND_CONTINUE Redux action is currently only
     * used in the Grading Workspace
     *
     * If the questionId is out of bounds, the componentDidUpdate callback of
     * GradingWorkspace will cause a redirect back to '/academy/grading'
     */
    yield routerNavigate(
      `/courses/${courseId}/grading/${submissionId}/${(currentQuestion || 0) + 1}`
    );
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
    function* (action: ReturnType<typeof actions.acknowledgeNotifications>): any {
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

      const resp: Response | null = yield call(postAcknowledgeNotifications, tokens, ids);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }
    }
  );

  yield takeEvery(
    DELETE_SOURCECAST_ENTRY,
    function* (action: ReturnType<typeof actions.deleteSourcecastEntry>): any {
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
    function* (action: ReturnType<typeof actions.saveSourcecastData>): any {
      const [role, courseId]: [Role, number | undefined] = yield select((state: OverallState) => [
        state.session.role!,
        state.session.courseId
      ]);
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
      yield routerNavigate(`/courses/${courseId}/sourcecast`);
    }
  );

  yield takeEvery(
    CHANGE_SUBLANGUAGE,
    function* (action: ReturnType<typeof actions.changeSublanguage>): any {
      const tokens: Tokens = yield selectTokens();
      const { sublang } = action.payload;

      const resp: Response | null = yield call(putCourseConfig, tokens, {
        sourceChapter: sublang.chapter,
        sourceVariant: sublang.variant
      });
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      yield put(
        actions.setCourseConfiguration({
          sourceChapter: sublang.chapter,
          sourceVariant: sublang.variant
        })
      );
      yield call(showSuccessMessage, 'Updated successfully!', 1000);
    }
  );

  yield takeEvery(
    UPDATE_LATEST_VIEWED_COURSE,
    function* (action: ReturnType<typeof actions.updateLatestViewedCourse>): any {
      const tokens: Tokens = yield selectTokens();
      const { courseId } = action.payload;

      const resp: Response | null = yield call(putLatestViewedCourse, tokens, courseId);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      const {
        courseRegistration,
        courseConfiguration,
        assessmentConfigurations
      }: {
        courseRegistration: CourseRegistration | null;
        courseConfiguration: CourseConfiguration | null;
        assessmentConfigurations: AssessmentConfiguration[] | null;
      } = yield call(getLatestCourseRegistrationAndConfiguration, tokens);

      if (!courseRegistration || !courseConfiguration || !assessmentConfigurations) {
        yield call(showWarningMessage, `Failed to load course!`);
        return yield routerNavigate('/welcome');
      }

      yield put(actions.setCourseConfiguration(courseConfiguration));
      yield put(actions.setAssessmentConfigurations(assessmentConfigurations));
      yield put(actions.setCourseRegistration(courseRegistration));

      yield put(actions.getStoriesUser());
      // TODO: Fetch associated stories group ID

      yield call(showSuccessMessage, `Switched to ${courseConfiguration.courseName}!`, 5000);
    }
  );

  yield takeEvery(
    UPDATE_COURSE_CONFIG,
    function* (action: ReturnType<typeof actions.updateCourseConfig>): any {
      const tokens: Tokens = yield selectTokens();
      const courseConfig: UpdateCourseConfiguration = action.payload;

      const resp: Response | null = yield call(putCourseConfig, tokens, courseConfig);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      yield put(actions.setCourseConfiguration(courseConfig));
      yield call(showSuccessMessage, 'Updated successfully!', 1000);
    }
  );

  yield takeEvery(FETCH_ASSESSMENT_CONFIGS, function* (): any {
    const tokens: Tokens = yield selectTokens();

    const assessmentConfigs: AssessmentConfiguration[] | null = yield call(
      getAssessmentConfigs,
      tokens
    );

    if (assessmentConfigs) {
      yield put(actions.setAssessmentConfigurations(assessmentConfigs));
    }
  });

  yield takeEvery(
    FETCH_CONFIGURABLE_NOTIFICATION_CONFIGS,
    function* (action: ReturnType<typeof actions.fetchConfigurableNotificationConfigs>): any {
      const tokens: Tokens = yield selectTokens();
      const { courseRegId }: { courseRegId: number } = action.payload;

      const notificationConfigs: NotificationConfiguration[] | null = yield call(
        getConfigurableNotificationConfigs,
        tokens,
        courseRegId
      );

      if (notificationConfigs) {
        yield put(actions.setConfigurableNotificationConfigs(notificationConfigs));
      }
    }
  );

  yield takeEvery(FETCH_NOTIFICATION_CONFIGS, function* (): any {
    const tokens: Tokens = yield selectTokens();

    const notificationConfigs: NotificationConfiguration[] | null = yield call(
      getNotificationConfigs,
      tokens
    );

    if (notificationConfigs) {
      yield put(actions.setNotificationConfigs(notificationConfigs));
    }
  });

  yield takeEvery(
    UPDATE_ASSESSMENT_CONFIGS,
    function* (action: ReturnType<typeof actions.updateAssessmentConfigs>): any {
      const tokens: Tokens = yield selectTokens();
      const assessmentConfigs: AssessmentConfiguration[] = action.payload;

      const resp: Response | null = yield call(putAssessmentConfigs, tokens, assessmentConfigs);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      const updatedAssessmentConfigs: AssessmentConfiguration[] | null = yield call(
        getAssessmentConfigs,
        tokens
      );

      if (updatedAssessmentConfigs) {
        yield put(actions.setAssessmentConfigurations(updatedAssessmentConfigs));
      }
      yield call(showSuccessMessage, 'Updated successfully!', 1000);
    }
  );

  yield takeEvery(
    UPDATE_NOTIFICATION_CONFIG,
    function* (action: ReturnType<typeof actions.updateNotificationConfigs>): any {
      const tokens: Tokens = yield selectTokens();
      const notificationConfigs: NotificationConfiguration[] = action.payload;

      const resp: Response | null = yield call(putNotificationConfigs, tokens, notificationConfigs);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      const updatedNotificationConfigs: NotificationConfiguration[] | null = yield call(
        getNotificationConfigs,
        tokens
      );

      if (updatedNotificationConfigs) {
        yield put(actions.setNotificationConfigs(updatedNotificationConfigs));
      }

      yield call(showSuccessMessage, 'Updated successfully!', 1000);
    }
  );

  yield takeEvery(
    UPDATE_NOTIFICATION_PREFERENCES,
    function* (action: ReturnType<typeof actions.updateNotificationPreferences>): any {
      const tokens: Tokens = yield selectTokens();
      const { notificationPreferences, courseRegId } = action.payload;
      const resp: Response | null = yield call(
        putNotificationPreferences,
        tokens,
        notificationPreferences,
        courseRegId
      );
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      yield call(showSuccessMessage, 'Updated successfully!', 1000);
    }
  );

  yield takeEvery(
    DELETE_ASSESSMENT_CONFIG,
    function* (action: ReturnType<typeof actions.deleteAssessmentConfig>): any {
      const tokens: Tokens = yield selectTokens();
      const assessmentConfig: AssessmentConfiguration = action.payload;

      const resp: Response | null = yield call(removeAssessmentConfig, tokens, assessmentConfig);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }
    }
  );

  yield takeEvery(
    UPDATE_TIME_OPTIONS,
    function* (action: ReturnType<typeof actions.updateTimeOptions>): any {
      const tokens: Tokens = yield selectTokens();
      const timeOptions: TimeOption[] = action.payload;

      const resp: Response | null = yield call(putTimeOptions, tokens, timeOptions);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }
    }
  );

  yield takeEvery(
    DELETE_TIME_OPTIONS,
    function* (action: ReturnType<typeof actions.deleteTimeOptions>): any {
      const tokens: Tokens = yield selectTokens();
      const timeOptionIds: number[] = action.payload;

      const resp: Response | null = yield call(removeTimeOptions, tokens, timeOptionIds);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }
    }
  );

  yield takeEvery(
    FETCH_ADMIN_PANEL_COURSE_REGISTRATIONS,
    function* (action: ReturnType<typeof actions.fetchAdminPanelCourseRegistrations>) {
      const tokens: Tokens = yield selectTokens();

      const courseRegistrations: AdminPanelCourseRegistration[] | null = yield call(
        getUserCourseRegistrations,
        tokens
      );
      if (courseRegistrations) {
        yield put(actions.setAdminPanelCourseRegistrations(courseRegistrations));
      }
    }
  );

  yield takeEvery(CREATE_COURSE, function* (action: ReturnType<typeof actions.createCourse>): any {
    const tokens: Tokens = yield selectTokens();
    const courseConfig: UpdateCourseConfiguration = action.payload;

    const resp: Response | null = yield call(postCreateCourse, tokens, courseConfig);
    if (!resp || !resp.ok) {
      return yield handleResponseError(resp);
    }

    const {
      user,
      courseRegistration,
      courseConfiguration
    }: {
      user: User | null;
      courseRegistration: CourseRegistration | null;
      courseConfiguration: CourseConfiguration | null;
      assessmentConfigurations: AssessmentConfiguration[] | null;
    } = yield call(getUser, tokens);

    if (!user || !courseRegistration || !courseConfiguration) {
      return yield showWarningMessage('An error occurred. Please try again.');
    }

    /**
     * setUser updates the Dropdown course selection menu with the updated courses
     *
     * Setting the role here handles an edge case where a user creates his first ever course.
     * Without it, the history.push below would not work as the /courses routes will not be rendered
     * (see Application.tsx)
     */
    yield put(actions.setUser(user));
    yield put(actions.setCourseRegistration({ role: Role.Student }));

    const placeholderAssessmentConfig = [
      {
        type: 'Missions',
        assessmentConfigId: -1,
        isManuallyGraded: true,
        displayInDashboard: true,
        hoursBeforeEarlyXpDecay: 0,
        earlySubmissionXp: 0
      }
    ];

    const resp1: Response | null = yield call(
      putAssessmentConfigs,
      tokens,
      placeholderAssessmentConfig,
      courseRegistration.courseId
    );
    if (!resp1 || !resp1.ok) {
      return yield handleResponseError(resp);
    }

    yield call(showSuccessMessage, 'Successfully created your new course!');
    yield routerNavigate(`/courses/${courseRegistration.courseId}`);
  });

  yield takeEvery(
    ADD_NEW_USERS_TO_COURSE,
    function* (action: ReturnType<typeof actions.addNewUsersToCourse>): any {
      const tokens: Tokens = yield selectTokens();
      const { users, provider }: { users: UsernameRoleGroup[]; provider: string } = action.payload;

      const resp: Response | null = yield call(putNewUsers, tokens, users, provider);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      yield put(actions.fetchAdminPanelCourseRegistrations());
      yield call(showSuccessMessage, 'Users added!');
    }
  );

  yield takeEvery(
    UPDATE_USER_ROLE,
    function* (action: ReturnType<typeof actions.updateUserRole>): any {
      const tokens: Tokens = yield selectTokens();
      const { courseRegId, role }: { courseRegId: number; role: Role } = action.payload;

      const resp: Response | null = yield call(putUserRole, tokens, courseRegId, role);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      yield put(actions.fetchAdminPanelCourseRegistrations());
      yield call(showSuccessMessage, 'Role updated!');
    }
  );

  yield takeEvery(
    UPDATE_COURSE_RESEARCH_AGREEMENT,
    function* (action: ReturnType<typeof actions.updateCourseResearchAgreement>): any {
      const tokens: Tokens = yield selectTokens();
      const { agreedToResearch } = action.payload;

      const resp: Response | null = yield call(
        putCourseResearchAgreement,
        tokens,
        agreedToResearch
      );
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      yield put(actions.setCourseRegistration({ agreedToResearch }));
      yield call(showSuccessMessage, 'Research preference saved!');
    }
  );

  yield takeEvery(
    DELETE_USER_COURSE_REGISTRATION,
    function* (action: ReturnType<typeof actions.deleteUserCourseRegistration>): any {
      const tokens: Tokens = yield selectTokens();
      const { courseRegId }: { courseRegId: number } = action.payload;

      const resp: Response | null = yield call(removeUserCourseRegistration, tokens, courseRegId);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      yield put(actions.fetchAdminPanelCourseRegistrations());
      yield call(showSuccessMessage, 'User deleted!');
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
    function* (action: ReturnType<typeof actions.changeDateAssessment>): any {
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
    function* (action: ReturnType<typeof actions.deleteAssessment>): any {
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
    function* (action: ReturnType<typeof actions.publishAssessment>): any {
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
    function* (action: ReturnType<typeof actions.uploadAssessment>): any {
      const tokens: Tokens = yield selectTokens();
      const { file, forceUpdate, assessmentConfigId } = action.payload;

      const resp: Response | null = yield uploadAssessment(
        file,
        tokens,
        forceUpdate,
        assessmentConfigId
      );
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

function* handleReautogradeResponse(resp: Response | null): any {
  if (resp && resp.ok) {
    return yield call(showSuccessMessage, 'Autograde job queued successfully.');
  }

  if (resp && resp.status === 400) {
    return yield call(showWarningMessage, 'Cannot reautograde non-submitted submission.');
  }

  return yield call(showWarningMessage, 'Failed to queue autograde job.');
}

export default BackendSaga;
