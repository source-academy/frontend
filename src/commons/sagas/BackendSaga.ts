/*eslint no-eval: "error"*/
/*eslint-env browser*/
import _ from 'lodash';
import { SagaIterator } from 'redux-saga';
import { all, call, fork, put, select } from 'redux-saga/effects';
import AcademyActions from 'src/features/academy/AcademyActions';
import DashboardActions from 'src/features/dashboard/DashboardActions';
import GroundControlActions from 'src/features/groundControl/GroundControlActions';
import SourcecastActions from 'src/features/sourceRecorder/sourcecast/SourcecastActions';
import SourceRecorderActions from 'src/features/sourceRecorder/SourceRecorderActions';
import { postNewStoriesUsers } from 'src/features/stories/storiesComponents/BackendAccess';
import { UsernameRoleGroup } from 'src/pages/academy/adminPanel/subcomponents/AddUserPanel';

import { GradingSummary } from '../../features/dashboard/DashboardTypes';
import {
  GradingOverview,
  GradingOverviews,
  GradingQuery,
  GradingQuestion,
  SortStates
} from '../../features/grading/GradingTypes';
import { SourcecastData } from '../../features/sourceRecorder/SourceRecorderTypes';
import SourcereelActions from '../../features/sourceRecorder/sourcereel/SourcereelActions';
import { TeamFormationOverview } from '../../features/teamFormation/TeamFormationTypes';
import SessionActions from '../application/actions/SessionActions';
import { OverallState, Role } from '../application/ApplicationTypes';
import { RouterState } from '../application/types/CommonsTypes';
import {
  AdminPanelCourseRegistration,
  CourseConfiguration,
  CourseRegistration,
  Tokens,
  UpdateCourseConfiguration,
  User
} from '../application/types/SessionTypes';
import {
  Assessment,
  AssessmentConfiguration,
  AssessmentOverview,
  AssessmentStatuses,
  ProgressStatuses,
  Question
} from '../assessment/AssessmentTypes';
import {
  Notification,
  NotificationFilterFunction
} from '../notificationBadge/NotificationBadgeTypes';
import { combineSagaHandlers } from '../redux/utils';
import { actions } from '../utils/ActionsHelper';
import { computeFrontendRedirectUri, getClientId, getDefaultProvider } from '../utils/AuthHelper';
import { showSuccessMessage, showWarningMessage } from '../utils/notifications/NotificationsHelper';
import WorkspaceActions from '../workspace/WorkspaceActions';
import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import {
  checkAnswerLastModifiedAt,
  deleteAssessment,
  deleteSourcecastEntry,
  deleteTeam,
  getAssessment,
  getAssessmentConfigs,
  getAssessmentOverviews,
  getCourseConfig,
  getGrading,
  getGradingOverviews,
  getGradingSummary,
  getLatestCourseRegistrationAndConfiguration,
  getNotifications,
  getSourcecastIndex,
  getStudents,
  getTeamFormationOverview,
  getTeamFormationOverviews,
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
  postTeams,
  postUnsubmit,
  postUploadTeams,
  publishGrading,
  publishGradingAll,
  putAssessmentConfigs,
  putCourseConfig,
  putCourseResearchAgreement,
  putLatestViewedCourse,
  putNewUsers,
  putTeams,
  putUserRole,
  removeAssessmentConfig,
  removeUserCourseRegistration,
  unpublishGrading,
  unpublishGradingAll,
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

// TODO: Refactor and combine in a future commit
const sagaActions = {
  ...SessionActions,
  ...SourcereelActions,
  ...AcademyActions,
  ...SourcecastActions,
  ...SourceRecorderActions,
  ...WorkspaceActions
};
const newBackendSagaOne = combineSagaHandlers(sagaActions, {
  fetchAuth: function* (action): any {
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
    const redirectUrl = computeFrontendRedirectUri(providerId);

    const tokens: Tokens | null = yield call(postAuth, code, providerId, clientId, redirectUrl);
    if (!tokens) {
      return yield routerNavigate('/');
    }
    yield put(actions.setTokens(tokens));
    yield put(actions.fetchUserAndCourse());
    /**
     * NOTE: Navigation logic is now handled in <Login /> component.
     * - Due to route hoisting in react-router v6, which requires us to declare routes at the top level,
     *   we need to rerender the router to include Academy routes when the user logs in, which occurs in ApplicationWrapper.tsx.
     * - However, the current router instance we have access to HERE in this saga via `routerNavigate` is the old router instance.
     * - Thus handling navigation in <Login /> allows us to directly access the latest router via `useNavigate`.
     */
  },
  handleSamlRedirect: function* (action) {
    const { jwtCookie } = action.payload;
    const tokens = _.mapKeys(JSON.parse(jwtCookie), (v, k) => _.camelCase(k)) as Tokens;

    yield put(actions.setTokens(tokens));
    yield put(actions.fetchUserAndCourse());
  },
  fetchUserAndCourse: function* (action) {
    const tokens: Tokens = yield selectTokens();

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

      if (courseConfiguration.enableStories) {
        yield put(actions.getStoriesUser());
        // TODO: Fetch associated stories group ID
      } else {
        yield put(actions.clearStoriesUserAndGroup());
      }
    }
  },
  fetchCourseConfig: function* () {
    const tokens: Tokens = yield selectTokens();
    const { config }: { config: CourseConfiguration | null } = yield call(getCourseConfig, tokens);
    if (config) {
      yield put(actions.setCourseConfiguration(config));

      if (config.enableStories) {
        yield put(actions.getStoriesUser());
        // TODO: Fetch associated stories group ID
      } else {
        yield put(actions.clearStoriesUserAndGroup());
      }
    }
  },
  fetchAssessmentOverviews: function* () {
    const tokens: Tokens = yield selectTokens();

    const assessmentOverviews: AssessmentOverview[] | null = yield call(
      getAssessmentOverviews,
      tokens
    );
    if (assessmentOverviews) {
      yield put(actions.updateAssessmentOverviews(assessmentOverviews));
    }
  },
  fetchTotalXp: function* () {
    const tokens: Tokens = yield selectTokens();

    const res: { totalXp: number } = yield call(getTotalXp, tokens);
    if (res) {
      yield put(actions.updateTotalXp(res.totalXp));
    }
  },
  fetchTotalXpAdmin: function* (action) {
    const tokens: Tokens = yield selectTokens();

    const courseRegId = action.payload;

    const res: { totalXp: number } = yield call(getTotalXp, tokens, courseRegId);
    if (res) {
      yield put(actions.updateTotalXp(res.totalXp));
    }
  },
  fetchAssessment: function* (action) {
    const tokens: Tokens = yield selectTokens();

    const { assessmentId, assessmentPassword } = action.payload;

    const assessment: Assessment | null = yield call(
      getAssessment,
      assessmentId,
      tokens,
      undefined,
      assessmentPassword
    );
    if (assessment) {
      yield put(actions.updateAssessment(assessment));
    }
  },
  fetchAssessmentAdmin: function* (action) {
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
  },
  submitAnswer: function* (action) {
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
    const assessment: any = yield select(
      (state: OverallState) => state.session.assessments[assessmentId]
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
  },
  checkAnswerLastModifiedAt: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const questionId = action.payload.id;
    const lastModifiedAt = action.payload.lastModifiedAt;
    const saveAnswer = action.payload.saveAnswer;

    const resp: boolean | null = yield call(
      checkAnswerLastModifiedAt,
      questionId,
      lastModifiedAt,
      tokens
    );
    saveAnswer(resp);
  },
  submitAssessment: function* (action) {
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
  },
  fetchGradingOverviews: function* (action) {
    const tokens: Tokens = yield selectTokens();

    const role: Role = yield select((state: OverallState) => state.session.role!);
    if (role === Role.Student) {
      return;
    }

    const { filterToGroup, publishedFilter, pageParams, filterParams, allColsSortStates } =
      action.payload;

    const sortedBy = {
      sortBy: allColsSortStates.sortBy,
      sortDirection: ''
    };

    Object.entries(allColsSortStates.currentState).forEach(([key, value]) => {
      if (allColsSortStates.sortBy === key && key !== '') {
        if (value !== SortStates.NONE) {
          sortedBy.sortDirection = value;
        } else {
          sortedBy.sortBy = '';
          sortedBy.sortDirection = '';
        }
      }
    });

    const gradingOverviews: GradingOverviews | null = yield call(
      getGradingOverviews,
      tokens,
      filterToGroup,
      publishedFilter,
      pageParams,
      filterParams,
      sortedBy
    );
    if (gradingOverviews) {
      yield put(actions.updateGradingOverviews(gradingOverviews));
    }
  },
  fetchTeamFormationOverview: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const { assessmentId } = action.payload;

    const teamFormationOverview: TeamFormationOverview | null = yield call(
      getTeamFormationOverview,
      assessmentId,
      tokens
    );
    if (teamFormationOverview) {
      yield put(actions.updateTeamFormationOverview(teamFormationOverview));
    }
  },
  fetchTeamFormationOverviews: function* () {
    const tokens: Tokens = yield selectTokens();

    const role: Role = yield select((state: OverallState) => state.session.role!);
    if (role === Role.Student) {
      return;
    }

    const teamFormationOverviews: TeamFormationOverview[] | null = yield call(
      getTeamFormationOverviews,
      tokens
    );
    if (teamFormationOverviews) {
      yield put(actions.updateTeamFormationOverviews(teamFormationOverviews));
    }
  },
  fetchStudents: function* () {
    const tokens: Tokens = yield selectTokens();
    const role: Role = yield select((state: OverallState) => state.session.role!);
    if (role === Role.Student) {
      return;
    }
    const students: User[] | null = yield call(getStudents, tokens);
    if (students) {
      yield put(actions.updateStudents(students));
    }
  },
  createTeam: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const { assessment, teams } = action.payload;

    const resp: Response | null = yield call(postTeams, assessment.id, teams, tokens);
    if (!resp || !resp.ok) {
      return yield handleResponseError(resp);
    }
    const teamFormationOverviews: TeamFormationOverview[] | null = yield call(
      getTeamFormationOverviews,
      tokens
    );
    if (teamFormationOverviews) {
      yield put(actions.updateTeamFormationOverviews(teamFormationOverviews));
    }
    yield call(showSuccessMessage, 'Team created successfully', 1000);
    if (resp && resp.status === 409) {
      return yield call(showWarningMessage, resp.statusText);
    }
  },
  bulkUploadTeam: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const { assessment, file, students } = action.payload;

    const resp: Response | null = yield call(
      postUploadTeams,
      assessment.id,
      file,
      students,
      tokens
    );
    if (!resp || !resp.ok) {
      return yield handleResponseError(resp);
    }
    const teamFormationOverviews: TeamFormationOverview[] | null = yield call(
      getTeamFormationOverviews,
      tokens
    );

    yield call(showSuccessMessage, 'Team created successfully', 1000);
    if (teamFormationOverviews) {
      yield put(actions.updateTeamFormationOverviews(teamFormationOverviews));
    }
  },
  updateTeam: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const { teamId, assessment, teams } = action.payload;
    const resp: Response | null = yield call(putTeams, assessment.id, teamId, teams, tokens);
    if (!resp || !resp.ok) {
      return yield handleResponseError(resp);
    }
    const teamFormationOverviews: TeamFormationOverview[] | null = yield call(
      getTeamFormationOverviews,
      tokens
    );

    yield call(showSuccessMessage, 'Team updated successfully', 1000);
    if (teamFormationOverviews) {
      yield put(actions.updateTeamFormationOverviews(teamFormationOverviews));
    }
  },
  deleteTeam: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const { teamId } = action.payload;

    const resp: Response | null = yield call(deleteTeam, teamId, tokens);
    if (!resp || !resp.ok) {
      return yield handleResponseError(resp);
    }
    const teamFormationOverviews: TeamFormationOverview[] | null = yield call(
      getTeamFormationOverviews,
      tokens
    );

    yield call(showSuccessMessage, 'Team deleted successfully', 1000);
    if (teamFormationOverviews) {
      yield put(actions.updateTeamFormationOverviews(teamFormationOverviews));
    }
  },
  fetchGrading: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const id = action.payload;

    const grading: GradingQuery | null = yield call(getGrading, id, tokens);
    if (grading) {
      yield put(actions.updateGrading(id, grading));
    }
  },
  /**
   * Unsubmits the submission and updates the grading overviews of the new status.
   */
  unsubmitSubmission: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const { submissionId } = action.payload;

    const resp: Response | null = yield postUnsubmit(submissionId, tokens);
    if (!resp || !resp.ok) {
      return yield handleResponseError(resp);
    }

    const overviews: GradingOverview[] = yield select(
      (state: OverallState) => state.session.gradingOverviews?.data || []
    );
    const newOverviews = overviews.map(overview => {
      if (overview.submissionId === submissionId) {
        return { ...overview, progress: ProgressStatuses.attempted };
      }
      return overview;
    });

    const totalPossibleEntries = yield select(
      (state: OverallState) => state.session.gradingOverviews?.count
    );

    yield call(showSuccessMessage, 'Unsubmit successful', 1000);
    yield put(actions.updateGradingOverviews({ count: totalPossibleEntries, data: newOverviews }));
  },
  publishGrading: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const { submissionId } = action.payload;

    const resp: Response | null = yield publishGrading(submissionId, tokens);
    if (!resp || !resp.ok) {
      return yield handleResponseError(resp);
    }

    const overviews: GradingOverview[] = yield select(
      (state: OverallState) => state.session.gradingOverviews?.data || []
    );
    const newOverviews = overviews.map(overview => {
      if (overview.submissionId === submissionId) {
        return { ...overview, progress: ProgressStatuses.published };
      }
      return overview;
    });

    const totalPossibleEntries = yield select(
      (state: OverallState) => state.session.gradingOverviews?.count
    );

    yield call(showSuccessMessage, 'Publish grading successful', 1000);
    yield put(actions.updateGradingOverviews({ count: totalPossibleEntries, data: newOverviews }));
  },
  unpublishGrading: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const { submissionId } = action.payload;

    const resp: Response | null = yield unpublishGrading(submissionId, tokens);
    if (!resp || !resp.ok) {
      return yield handleResponseError(resp);
    }

    const overviews: GradingOverview[] = yield select(
      (state: OverallState) => state.session.gradingOverviews?.data || []
    );
    const newOverviews = overviews.map(overview => {
      if (overview.submissionId === submissionId) {
        return { ...overview, progress: ProgressStatuses.graded };
      }
      return overview;
    });

    const totalPossibleEntries = yield select(
      (state: OverallState) => state.session.gradingOverviews?.count
    );

    yield call(showSuccessMessage, 'Unpublish grading successful', 1000);
    yield put(actions.updateGradingOverviews({ count: totalPossibleEntries, data: newOverviews }));
  },
  submitGrading: sendGrade,
  submitGradingAndContinue: sendGradeAndContinue
});

function* sendGrade(
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
}

function* sendGradeAndContinue(action: ReturnType<typeof actions.submitGradingAndContinue>) {
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
}

const newBackendSagaTwo = combineSagaHandlers(sagaActions, {
  reautogradeSubmission: function* (action) {
    const submissionId = action.payload;
    const tokens: Tokens = yield selectTokens();
    const resp: Response | null = yield call(postReautogradeSubmission, submissionId, tokens);

    yield call(handleReautogradeResponse, resp);
  },
  reautogradeAnswer: function* (action) {
    const { submissionId, questionId } = action.payload;
    const tokens: Tokens = yield selectTokens();
    const resp: Response | null = yield call(
      postReautogradeAnswer,
      submissionId,
      questionId,
      tokens
    );

    yield call(handleReautogradeResponse, resp);
  },
  fetchNotifications: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const notifications: Notification[] = yield call(getNotifications, tokens);

    yield put(actions.updateNotifications(notifications));
  },
  acknowledgeNotifications: function* (action) {
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
  },
  deleteSourcecastEntry: function* (action) {
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
  },
  fetchSourcecastIndex: function* (action) {
    const tokens: Tokens = yield selectTokens();

    const sourcecastIndex: SourcecastData[] | null = yield call(getSourcecastIndex, tokens);
    if (sourcecastIndex) {
      yield put(actions.updateSourcecastIndex(sourcecastIndex, action.payload.workspaceLocation));
    }
  },
  saveSourcecastData: function* (action) {
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
  },
  changeSublanguage: function* (action) {
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
  },
  updateLatestViewedCourse: function* (action) {
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

    if (courseConfiguration.enableStories) {
      yield put(actions.getStoriesUser());
      // TODO: Fetch associated stories group ID
    } else {
      yield put(actions.clearStoriesUserAndGroup());
    }

    yield call(showSuccessMessage, `Switched to ${courseConfiguration.courseName}!`, 5000);
  },
  updateCourseConfig: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const courseConfig: UpdateCourseConfiguration = action.payload;

    const resp: Response | null = yield call(putCourseConfig, tokens, courseConfig);
    if (!resp || !resp.ok) {
      return yield handleResponseError(resp);
    }

    if (courseConfig.enableStories) {
      yield put(actions.getStoriesUser());
      // TODO: Fetch associated stories group ID
    } else {
      yield put(actions.clearStoriesUserAndGroup());
    }

    yield put(actions.setCourseConfiguration(courseConfig));
    yield call(showSuccessMessage, 'Updated successfully!', 1000);
  },
  fetchAssessmentConfigs: function* () {
    const tokens: Tokens = yield selectTokens();

    const assessmentConfigs: AssessmentConfiguration[] | null = yield call(
      getAssessmentConfigs,
      tokens
    );
    if (assessmentConfigs) {
      yield put(actions.setAssessmentConfigurations(assessmentConfigs));
    }
  },
  updateAssessmentConfigs: function* (action) {
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
  },
  deleteAssessmentConfig: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const assessmentConfig: AssessmentConfiguration = action.payload;

    const resp: Response | null = yield call(removeAssessmentConfig, tokens, assessmentConfig);
    if (!resp || !resp.ok) {
      return yield handleResponseError(resp);
    }
  },
  fetchAdminPanelCourseRegistrations: function* (action) {
    const tokens: Tokens = yield selectTokens();

    const courseRegistrations: AdminPanelCourseRegistration[] | null = yield call(
      getUserCourseRegistrations,
      tokens
    );
    if (courseRegistrations) {
      yield put(actions.setAdminPanelCourseRegistrations(courseRegistrations));
    }
  },
  createCourse: function* (action) {
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

    if (courseConfiguration.enableStories) {
      yield put(actions.getStoriesUser());
      // TODO: Fetch associated stories group ID
    } else {
      yield put(actions.clearStoriesUserAndGroup());
    }

    const placeholderAssessmentConfig: AssessmentConfiguration[] = [
      {
        type: 'Missions',
        assessmentConfigId: -1,
        isManuallyGraded: true,
        isGradingAutoPublished: false,
        displayInDashboard: true,
        hoursBeforeEarlyXpDecay: 0,
        hasTokenCounter: false,
        hasVotingFeatures: false,
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
  },
  addNewUsersToCourse: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const { users, provider }: { users: UsernameRoleGroup[]; provider: string } = action.payload;

    const resp: Response | null = yield call(putNewUsers, tokens, users, provider);
    if (!resp || !resp.ok) {
      return yield handleResponseError(resp);
    }

    yield put(actions.fetchAdminPanelCourseRegistrations());
    yield call(showSuccessMessage, 'Users added!');
  },
  addNewStoriesUsersToCourse: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const { users, provider } = action.payload;

    yield call(postNewStoriesUsers, tokens, users, provider);

    // TODO: Refresh the list of story users
    //       once that page is implemented
  },
  updateCourseResearchAgreement: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const { agreedToResearch } = action.payload;

    const resp: Response | null = yield call(putCourseResearchAgreement, tokens, agreedToResearch);
    if (!resp || !resp.ok) {
      return yield handleResponseError(resp);
    }

    yield put(actions.setCourseRegistration({ agreedToResearch }));
    yield call(showSuccessMessage, 'Research preference saved!');
  },
  updateUserRole: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const { courseRegId, role }: { courseRegId: number; role: Role } = action.payload;

    const resp: Response | null = yield call(putUserRole, tokens, courseRegId, role);
    if (!resp || !resp.ok) {
      return yield handleResponseError(resp);
    }

    yield put(actions.fetchAdminPanelCourseRegistrations());
    yield call(showSuccessMessage, 'Role updated!');
  },
  deleteUserCourseRegistration: function* (action) {
    const tokens: Tokens = yield selectTokens();
    const { courseRegId }: { courseRegId: number } = action.payload;

    const resp: Response | null = yield call(removeUserCourseRegistration, tokens, courseRegId);
    if (!resp || !resp.ok) {
      return yield handleResponseError(resp);
    }

    yield put(actions.fetchAdminPanelCourseRegistrations());
    yield call(showSuccessMessage, 'User deleted!');
  }
});

function* oldBackendSagaThree(): SagaIterator {
  yield takeEvery(
    DashboardActions.fetchGroupGradingSummary.type,
    function* (action: ReturnType<typeof actions.fetchGroupGradingSummary>) {
      const tokens: Tokens = yield selectTokens();

      const groupOverviews: GradingSummary | null = yield call(getGradingSummary, tokens);
      if (groupOverviews) {
        yield put(actions.updateGroupGradingSummary(groupOverviews));
      }
    }
  );

  yield takeEvery(
    GroundControlActions.changeDateAssessment.type,
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
    GroundControlActions.changeTeamSizeAssessment.type,
    function* (action: ReturnType<typeof actions.changeTeamSizeAssessment>): any {
      const tokens: Tokens = yield selectTokens();
      const id = action.payload.id;
      const maxTeamSize = action.payload.maxTeamSize;

      const resp: Response | null = yield updateAssessment(id, { maxTeamSize }, tokens);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      yield put(actions.fetchAssessmentOverviews());
      yield call(showSuccessMessage, 'Team size updated successfully!', 1000);
    }
  );

  yield takeEvery(
    GroundControlActions.deleteAssessment.type,
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
    GroundControlActions.publishAssessment.type,
    function* (action: ReturnType<typeof actions.publishAssessment>): any {
      const tokens: Tokens = yield selectTokens();
      const id = action.payload.id;
      const togglePublishTo = action.payload.togglePublishAssessmentTo;

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
    GroundControlActions.uploadAssessment.type,
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

  yield takeEvery(
    GroundControlActions.configureAssessment.type,
    function* (action: ReturnType<typeof actions.configureAssessment>): any {
      const tokens: Tokens = yield selectTokens();
      const id = action.payload.id;
      const hasVotingFeatures = action.payload.hasVotingFeatures;
      const hasTokenCounter = action.payload.hasTokenCounter;

      const resp: Response | null = yield updateAssessment(
        id,
        { hasVotingFeatures: hasVotingFeatures, hasTokenCounter: hasTokenCounter },
        tokens
      );
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      yield put(actions.fetchAssessmentOverviews());
      yield call(showSuccessMessage, 'Updated successfully!', 1000);
    }
  );

  yield takeEvery(
    GroundControlActions.assignEntriesForVoting.type,
    function* (action: ReturnType<typeof actions.assignEntriesForVoting>): any {
      const tokens: Tokens = yield selectTokens();
      const id = action.payload.id;

      const resp: Response | null = yield updateAssessment(
        id,
        {
          assignEntriesForVoting: true
        },
        tokens
      );
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      yield put(actions.fetchAssessmentOverviews());
      yield call(showSuccessMessage, 'Updated successfully!', 1000);
    }
  );

  yield takeEvery(
    GroundControlActions.publishGradingAll.type,
    function* (action: ReturnType<typeof actions.publishGradingAll>): any {
      const tokens: Tokens = yield selectTokens();
      const id = action.payload;

      const resp: Response | null = yield publishGradingAll(id, tokens);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      yield put(actions.fetchAssessmentOverviews());
      yield call(showSuccessMessage, 'Published all graded submissons successfully!', 1000);
    }
  );

  yield takeEvery(
    GroundControlActions.unpublishGradingAll.type,
    function* (action: ReturnType<typeof actions.unpublishGradingAll>): any {
      const tokens: Tokens = yield selectTokens();
      const id = action.payload;

      const resp: Response | null = yield unpublishGradingAll(id, tokens);
      if (!resp || !resp.ok) {
        return yield handleResponseError(resp);
      }

      yield put(actions.fetchAssessmentOverviews());
      yield call(showSuccessMessage, 'Unpublished all submissons successfully!', 1000);
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

function* BackendSaga(): SagaIterator {
  yield all([fork(newBackendSagaOne), fork(newBackendSagaTwo), fork(oldBackendSagaThree)]);
}

export default BackendSaga;
