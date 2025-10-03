/* eslint-disable vitest/no-identical-title */
import type { BaseActionCreator } from '@reduxjs/toolkit/dist/createAction';
import { Chapter, Variant } from 'js-slang/dist/langs';
import { createMemoryRouter } from 'react-router';
import { call } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
import { describe as baseDescribe, expect, test, vi } from 'vitest';
import { mockTeamFormationOverviews } from 'src/commons/mocks/TeamFormationMocks';
import AcademyActions from 'src/features/academy/AcademyActions';
import DashboardActions from 'src/features/dashboard/DashboardActions';
import type { UsernameRoleGroup } from 'src/pages/academy/adminPanel/subcomponents/AddUserPanel';

import {
  Role,
  SupportedLanguage,
  type GameState,
  type SALanguage,
  type Story
} from '../../application/ApplicationTypes';
import SessionActions from '../../application/actions/SessionActions';
import type {
  AdminPanelCourseRegistration,
  CourseConfiguration,
  CourseRegistration,
  UpdateCourseConfiguration,
  User
} from '../../application/types/SessionTypes';
import {
  AssessmentStatuses,
  type Assessment,
  type AssessmentConfiguration,
  type Question
} from '../../assessment/AssessmentTypes';
import {
  mockAssessmentOverviews,
  mockAssessmentQuestions,
  mockAssessments
} from '../../mocks/AssessmentMocks';
import { mockGradingSummary } from '../../mocks/GradingMocks';
import { mockNotifications, mockStudents } from '../../mocks/UserMocks';
import type { Notification } from '../../notificationBadge/NotificationBadgeTypes';
import { AuthProviderType, computeFrontendRedirectUri } from '../../utils/AuthHelper';
import Constants from '../../utils/Constants';
import {
  showSuccessMessage,
  showWarningMessage
} from '../../utils/notifications/NotificationsHelper';
import WorkspaceActions from '../../workspace/WorkspaceActions';
import type { WorkspaceLocation } from '../../workspace/WorkspaceTypes';
import BackendSaga from '../BackendSaga';
import {
  getAssessment,
  getAssessmentConfigs,
  getAssessmentOverviews,
  getCourseConfig,
  getGradingSummary,
  getLatestCourseRegistrationAndConfiguration,
  getNotifications,
  getStudents,
  getTeamFormationOverviews,
  getUser,
  getUserCourseRegistrations,
  postAcknowledgeNotifications,
  postAnswer,
  postAssessment,
  postAuth,
  postCreateCourse,
  postReautogradeAnswer,
  postReautogradeSubmission,
  putAssessmentConfigs,
  putCourseConfig,
  putCourseResearchAgreement,
  putLatestViewedCourse,
  putNewUsers,
  putUserRole,
  removeUserCourseRegistration
} from '../RequestsSaga';

// ----------------------------------------
// Constants to use for testing

const mockAssessment: Assessment = mockAssessments[0];

const mockMapAssessments = Object.fromEntries(mockAssessments.map(a => [a.id, a]));

const mockAssessmentQuestion = mockAssessmentQuestions[0];

const mockTeamFormationOverview = mockTeamFormationOverviews[0];

const mockTokens = { accessToken: 'access', refreshToken: 'refresherOrb' };

const mockUser: User = {
  userId: 123,
  name: 'user',
  username: 'user',
  courses: [
    {
      courseId: 1,
      courseName: `CS1101 Programming Methodology (AY20/21 Sem 1)`,
      courseShortName: `CS1101S`,
      role: Role.Admin,
      viewable: true
    },
    {
      courseId: 2,
      courseName: `CS2030S Programming Methodology II (AY20/21 Sem 2)`,
      courseShortName: `CS2030S`,
      role: Role.Staff,
      viewable: true
    }
  ]
};

const mockCourseRegistration1: CourseRegistration = {
  courseRegId: 1,
  role: Role.Student,
  group: '42D',
  gameState: {
    collectibles: {},
    completed_quests: []
  } as GameState,
  courseId: 1,
  xp: 1,
  story: {
    story: '',
    playStory: false
  } as Story,
  agreedToResearch: null
};

const mockCourseConfiguration1: CourseConfiguration = {
  courseName: `CS1101 Programming Methodology (AY20/21 Sem 1)`,
  courseShortName: `CS1101S`,
  viewable: true,
  enableGame: true,
  enableAchievements: true,
  enableOverallLeaderboard: true,
  enableContestLeaderboard: true,
  enableSourcecast: true,
  enableStories: false,
  topLeaderboardDisplay: 100,
  topContestLeaderboardDisplay: 10,
  sourceChapter: Chapter.SOURCE_1,
  sourceVariant: Variant.DEFAULT,
  moduleHelpText: 'Help text',
  assetsPrefix: ''
};

const mockCourseRegistration2: CourseRegistration = {
  courseRegId: 2,
  role: Role.Student,
  group: '4D',
  gameState: {
    collectibles: {},
    completed_quests: []
  } as GameState,
  courseId: 2,
  xp: 1,
  story: {
    story: '',
    playStory: false
  } as Story,
  agreedToResearch: true
};

const mockCourseConfiguration2: CourseConfiguration = {
  courseName: `CS2030S Programming Methodology II (AY20/21 Sem 2)`,
  courseShortName: `CS2030S`,
  viewable: true,
  enableGame: true,
  enableAchievements: true,
  enableOverallLeaderboard: true,
  enableContestLeaderboard: true,
  topLeaderboardDisplay: 100,
  topContestLeaderboardDisplay: 10,
  enableSourcecast: true,
  enableStories: false,
  sourceChapter: Chapter.SOURCE_4,
  sourceVariant: Variant.DEFAULT,
  moduleHelpText: 'Help text',
  assetsPrefix: ''
};

const mockAssessmentConfigurations: AssessmentConfiguration[] = [
  {
    assessmentConfigId: 1,
    type: 'Missions',
    isManuallyGraded: true,
    isGradingAutoPublished: false,
    displayInDashboard: true,
    isMinigame: false,
    hoursBeforeEarlyXpDecay: 48,
    hasTokenCounter: false,
    hasVotingFeatures: false,
    earlySubmissionXp: 200
  },
  {
    assessmentConfigId: 2,
    type: 'Quests',
    isManuallyGraded: true,
    isGradingAutoPublished: false,
    displayInDashboard: true,
    isMinigame: false,
    hoursBeforeEarlyXpDecay: 48,
    hasTokenCounter: false,
    hasVotingFeatures: false,
    earlySubmissionXp: 200
  },
  {
    assessmentConfigId: 3,
    type: 'Paths',
    isManuallyGraded: false,
    isGradingAutoPublished: true,
    displayInDashboard: false,
    isMinigame: false,
    hoursBeforeEarlyXpDecay: 48,
    hasTokenCounter: false,
    hasVotingFeatures: false,
    earlySubmissionXp: 200
  },
  {
    assessmentConfigId: 4,
    type: 'Contests',
    isManuallyGraded: false,
    isGradingAutoPublished: false,
    displayInDashboard: false,
    isMinigame: false,
    hoursBeforeEarlyXpDecay: 48,
    hasTokenCounter: false,
    hasVotingFeatures: true,
    earlySubmissionXp: 200
  },
  {
    assessmentConfigId: 5,
    type: 'Others',
    isManuallyGraded: true,
    isGradingAutoPublished: false,
    displayInDashboard: false,
    isMinigame: false,
    hoursBeforeEarlyXpDecay: 48,
    hasTokenCounter: false,
    hasVotingFeatures: false,
    earlySubmissionXp: 200
  }
];

const mockRouter = createMemoryRouter([
  {
    path: '/',
    element: null
  }
]);

const mockVscodeSlice = {
  vscode: {
    isVscode: false
  }
};

const mockStates = {
  router: mockRouter,
  session: {
    assessmentOverviews: mockAssessmentOverviews,
    assessments: mockMapAssessments,
    teamFormationOverviews: mockTeamFormationOverviews,
    teamFormationOverview: mockTeamFormationOverview,
    notifications: mockNotifications,
    ...mockTokens,
    ...mockUser,
    ...mockCourseRegistration1,
    ...mockCourseConfiguration1
  },
  workspaces: {
    assessment: { currentAssessment: mockAssessment.id }
  },
  ...mockVscodeSlice
};

const okResp = { ok: true };
const errorResp = { ok: false, text: () => 'Some Error' };
// ----------------------------------------

function describe<T extends string>(
  this: void | boolean,
  creator: BaseActionCreator<any, T>,
  suite: (type: T) => void
) {
  if (!this) {
    baseDescribe(creator.type, () => suite(creator.type))
  } else {
    baseDescribe.skip(creator.type, () => suite(creator.type))
  }
}

describe.skip = function <T extends string>(
  creator: BaseActionCreator<any, T>,
  suite: (type: T) => void
) {
  this.call(true, creator, suite as any)
}

describe(SessionActions.fetchAuth, actionType => {
  const code = 'luminusCode';
  const providerId = 'provider';
  const clientId = 'clientId';
  Constants.authProviders.set(providerId, {
    name: providerId,
    endpoint: `https://test/?client_id=${clientId}`,
    isDefault: true,
    type: AuthProviderType.OAUTH2
  });
  const redirectUrl = computeFrontendRedirectUri(providerId);

  const user = mockUser;
  const courseConfiguration = mockCourseConfiguration1;
  const courseRegistration = mockCourseRegistration1;
  const assessmentConfigurations = mockAssessmentConfigurations;

  // API call is made when dispatching subsequent action, causing console warning
  vi.spyOn(global, 'fetch').mockReturnValue(Promise.resolve({} as Response));

  test('when tokens, user, course registration and course configuration are obtained', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(postAuth, code, providerId, clientId, redirectUrl)
      .put(SessionActions.setTokens(mockTokens))
      .call(getUser, mockTokens)
      .put(SessionActions.setUser(user))
      .not.put.actionType(SessionActions.updateLatestViewedCourse.type)
      .put(SessionActions.setCourseRegistration(courseRegistration))
      .put(SessionActions.setCourseConfiguration(courseConfiguration))
      .put(SessionActions.setAssessmentConfigurations(assessmentConfigurations))
      .provide([
        [call(postAuth, code, providerId, clientId, redirectUrl), mockTokens],
        [
          call(getUser, mockTokens),
          { user, courseRegistration, courseConfiguration, assessmentConfigurations }
        ]
      ])
      .dispatch({ type: actionType, payload: { code, providerId } })
      .silentRun();
  });

  test('when tokens is null', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(postAuth, code, providerId, clientId, redirectUrl), null]])
      .call(postAuth, code, providerId, clientId, redirectUrl)
      .not.put.actionType(SessionActions.setTokens.type)
      .not.call.fn(getUser)
      .not.put.actionType(SessionActions.setUser.type)
      .not.put.actionType(SessionActions.updateLatestViewedCourse.type)
      .not.put.actionType(SessionActions.setCourseRegistration.type)
      .not.put.actionType(SessionActions.setCourseConfiguration.type)
      .not.put.actionType(SessionActions.setAssessmentConfigurations.type)
      .dispatch({ type: actionType, payload: { code, providerId } })
      .silentRun();
  });

  test('when user is obtained (user has no courses), but course registration, course configuration and assessmentConfigurations are null', () => {
    const userWithNoCourse = { ...user, courses: [] };
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([
        [call(postAuth, code, providerId, clientId, redirectUrl), mockTokens],
        [
          call(getUser, mockTokens),
          {
            user: userWithNoCourse,
            courseRegistration: null,
            courseConfiguration: null,
            assessmentConfigurations: null
          }
        ]
      ])
      .call(postAuth, code, providerId, clientId, redirectUrl)
      .put(SessionActions.setTokens(mockTokens))
      .call(getUser, mockTokens)
      .put(SessionActions.setUser(userWithNoCourse))
      .not.put.actionType(SessionActions.updateLatestViewedCourse.type)
      .not.put.actionType(SessionActions.setCourseRegistration.type)
      .not.put.actionType(SessionActions.setCourseConfiguration.type)
      .not.put.actionType(SessionActions.setAssessmentConfigurations.type)
      .dispatch({ type: actionType, payload: { code, providerId } })
      .silentRun();
  });

  test('when user is obtained (user has courses), but course registration, course configuration and assessmentConfigurations are null', () => {
    return expectSaga(BackendSaga)
      .provide([
        [call(postAuth, code, providerId, clientId, redirectUrl), mockTokens],
        [
          call(getUser, mockTokens),
          {
            user,
            courseRegistration: null,
            courseConfiguration: null,
            assessmentConfigurations: null
          }
        ]
      ])
      .withState({ session: mockTokens, ...mockVscodeSlice }) // need to mock tokens for updateLatestViewedCourse call
      .call(postAuth, code, providerId, clientId, redirectUrl)
      .put(SessionActions.setTokens(mockTokens))
      .call(getUser, mockTokens)
      .put(SessionActions.setUser(user))
      .put(SessionActions.updateLatestViewedCourse(user.courses[0].courseId))
      .not.put.actionType(SessionActions.setCourseRegistration.type)
      .not.put.actionType(SessionActions.setCourseConfiguration.type)
      .not.put.actionType(SessionActions.setAssessmentConfigurations.type)
      .dispatch({ type: actionType, payload: { code, providerId } })
      .silentRun();
  });

  test('when user is null', () => {
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens, ...mockVscodeSlice }) // need to mock tokens for the selectTokens() call
      .provide([
        [call(postAuth, code, providerId, clientId, redirectUrl), mockTokens],
        [
          call(getUser, mockTokens),
          {
            user: null,
            courseRegistration: null,
            courseConfiguration: null,
            assessmentConfigurations: null
          }
        ]
      ])
      .call(postAuth, code, providerId, clientId, redirectUrl)
      .put(SessionActions.setTokens(mockTokens))
      .call(getUser, mockTokens)
      .not.put.actionType(SessionActions.setUser.type)
      .not.put.actionType(SessionActions.updateLatestViewedCourse.type)
      .not.put.actionType(SessionActions.setCourseRegistration.type)
      .not.put.actionType(SessionActions.setCourseConfiguration.type)
      .not.put.actionType(SessionActions.setAssessmentConfigurations.type)
      .dispatch({ type: actionType, payload: { code, providerId } })
      .silentRun();
  });
});

describe(SessionActions.handleSamlRedirect, actionType => {
  test('the action', () => {
    const jwtCookie = `{"access_token":"${mockTokens.accessToken}","refresh_token":"${mockTokens.refreshToken}"}`;

    return expectSaga(BackendSaga)
      .withState({ session: mockTokens }) // need to mock tokens for the downstream selectTokens() call in fetchUserAndCourse()
      .put(SessionActions.setTokens(mockTokens))
      .put(SessionActions.fetchUserAndCourse())
      .dispatch({ type: actionType, payload: { jwtCookie } })
      .silentRun();
  });
})

describe(SessionActions.fetchUserAndCourse, actionType => {
  const user = mockUser;
  const courseConfiguration = mockCourseConfiguration1;
  const courseRegistration = mockCourseRegistration1;
  const assessmentConfigurations = mockAssessmentConfigurations;

  test('when user, course registration and course configuration are obtained', () => {
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .call(getUser, mockTokens)
      .put(SessionActions.setUser(user))
      .not.put.actionType(SessionActions.updateLatestViewedCourse.type)
      .put(SessionActions.setCourseRegistration(courseRegistration))
      .put(SessionActions.setCourseConfiguration(courseConfiguration))
      .put(SessionActions.setAssessmentConfigurations(assessmentConfigurations))
      .provide([
        [
          call(getUser, mockTokens),
          { user, courseRegistration, courseConfiguration, assessmentConfigurations }
        ]
      ])
      .dispatch({ type: actionType, payload: true })
      .silentRun();
  });

  test('when user (with courses) is obtained, but course registration, course configuration and assessment configurations are null', () => {
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .provide([
        [
          call(getUser, mockTokens),
          {
            user,
            courseRegistration: null,
            courseConfiguration: null,
            assessmentConfigurations: null
          }
        ]
      ])
      .call(getUser, mockTokens)
      .put(SessionActions.setUser(user))
      .put(SessionActions.updateLatestViewedCourse(user.courses[0].courseId))
      .not.put.actionType(SessionActions.setCourseRegistration.type)
      .not.put.actionType(SessionActions.setCourseConfiguration.type)
      .not.put.actionType(SessionActions.setAssessmentConfigurations.type)
      .dispatch({ type: actionType, payload: true })
      .silentRun();
  });

  test('when user (without courses) is obtained, but course registration, course configuration and assessment configurations are null', () => {
    const userWithNoCourse = { ...user, courses: [] };
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .provide([
        [
          call(getUser, mockTokens),
          {
            user: userWithNoCourse,
            courseRegistration: null,
            courseConfiguration: null,
            assessmentConfigurations: null
          }
        ]
      ])
      .call(getUser, mockTokens)
      .put(SessionActions.setUser(userWithNoCourse))
      .not.put.actionType(SessionActions.updateLatestViewedCourse.type)
      .not.put.actionType(SessionActions.setCourseRegistration.type)
      .not.put.actionType(SessionActions.setCourseConfiguration.type)
      .not.put.actionType(SessionActions.setAssessmentConfigurations.type)
      .dispatch({ type: actionType, payload: true })
      .silentRun();
  });

  test('when user is null', () => {
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .provide([
        [
          call(getUser, mockTokens),
          {
            user: null,
            courseRegistration: null,
            courseConfiguration: null,
            assessmentConfigurations: null
          }
        ]
      ])
      .call(getUser, mockTokens)
      .not.put.actionType(SessionActions.setUser.type)
      .not.put.actionType(SessionActions.updateLatestViewedCourse.type)
      .not.put.actionType(SessionActions.setCourseRegistration.type)
      .not.put.actionType(SessionActions.setCourseConfiguration.type)
      .not.put.actionType(SessionActions.setAssessmentConfigurations.type)
      .dispatch({ type: actionType, payload: true })
      .silentRun();
  });
});

describe(SessionActions.fetchCourseConfig, actionType => {
  test('when course config is obtained', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(getCourseConfig, mockTokens), { config: mockCourseConfiguration1 }]])
      .put(SessionActions.setCourseConfiguration(mockCourseConfiguration1))
      .dispatch({ type: actionType })
      .silentRun();
  });

  test('when course config is null', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(getCourseConfig, mockTokens), { config: null }]])
      .not.put.actionType(SessionActions.setCourseConfiguration.type)
      .dispatch({ type: actionType })
      .silentRun();
  });
});

describe(SessionActions.fetchAssessmentOverviews, actionType => {
  test('when assesments is obtained', () => {
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getAssessmentOverviews, mockTokens), mockAssessmentOverviews]])
      .put(SessionActions.updateAssessmentOverviews(mockAssessmentOverviews))
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: actionType })
      .silentRun();
  });

  test('when assessments overviews is null', () => {
    const ret = null;
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getAssessmentOverviews, mockTokens), ret]])
      .call(getAssessmentOverviews, mockTokens)
      .not.put.actionType(SessionActions.updateAssessmentOverviews.type)
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: actionType })
      .silentRun();
  });
});

describe(SessionActions.fetchTeamFormationOverviews, actionType => {
  test('when team formation overviews are obtained', () => {
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getTeamFormationOverviews, mockTokens), mockTeamFormationOverviews]])
      .put(SessionActions.updateTeamFormationOverviews(mockTeamFormationOverviews))
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: actionType })
      .silentRun();
  });

  test('when team formation overviews is null', () => {
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getTeamFormationOverviews, mockTokens), null]])
      .call(getTeamFormationOverviews, mockTokens)
      .not.put.actionType(SessionActions.updateTeamFormationOverviews.type)
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: actionType })
      .silentRun();
  });
});

describe(SessionActions.fetchStudents, actionType => {
  test('when students are obtained', () => {
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getStudents, mockTokens), mockStudents]])
      .put(SessionActions.updateStudents(mockStudents))
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: actionType })
      .silentRun();
  });

  test('when students is null', () => {
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getStudents, mockTokens), null]])
      .call(getStudents, mockTokens)
      .not.put.actionType(SessionActions.updateStudents.type)
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: actionType })
      .silentRun();
  });
});

describe(SessionActions.fetchAssessment, actionType => {
  test('when assessment is obtained', () => {
    const mockId = mockAssessment.id;
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getAssessment, mockId, mockTokens, undefined, undefined), mockAssessment]])
      .put(SessionActions.updateAssessment(mockAssessment))
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: actionType, payload: { assessmentId: mockId } })
      .silentRun();
  });

  test('when assessment is null', () => {
    const mockId = mockAssessment.id;
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getAssessment, mockId, mockTokens, undefined, undefined), null]])
      .call(getAssessment, mockId, mockTokens, undefined, undefined)
      .not.put.actionType(SessionActions.updateAssessment.type)
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: actionType, payload: { assessmentId: mockId } })
      .silentRun();
  });
});

describe(SessionActions.submitAnswer, actionType => {
  test('when response is ok', async () => {
    const mockAnsweredAssessmentQuestion: Question =
      mockAssessmentQuestion.type === 'mcq'
        ? { ...mockAssessmentQuestion, answer: 42 }
        : { ...mockAssessmentQuestion, answer: '42' };
    const mockNewQuestions: Question[] = mockAssessment.questions.map(
      (question: Question): Question => {
        if (question.id === mockAnsweredAssessmentQuestion.id) {
          return { ...question, answer: mockAnsweredAssessmentQuestion.answer } as Question;
        }
        return question;
      }
    );
    const mockNewAssessment = {
      ...mockAssessment,
      questions: mockNewQuestions
    };
    await expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([
        [
          call(
            postAnswer,
            mockAnsweredAssessmentQuestion.id,
            mockAnsweredAssessmentQuestion.answer || '',
            mockTokens
          ),
          okResp
        ]
      ])
      .not.call.fn(showWarningMessage)
      .call(showSuccessMessage, 'Saved!', 1000)
      .put(SessionActions.updateAssessment(mockNewAssessment))
      .put(WorkspaceActions.updateHasUnsavedChanges('assessment' as WorkspaceLocation, false))
      .dispatch({ type: actionType, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
    // To make sure no changes in state
    return expect(mockStates.session.assessments[mockNewAssessment.id].questions[0].answer).toEqual(
      null
    );
  });

  test('when role is not student', async () => {
    const mockAnsweredAssessmentQuestion: Question =
      mockAssessmentQuestion.type === 'mcq'
        ? { ...mockAssessmentQuestion, answer: 42 }
        : { ...mockAssessmentQuestion, answer: '42' };
    const mockNewQuestions: Question[] = mockAssessment.questions.map(
      (question: Question): Question => {
        if (question.id === mockAnsweredAssessmentQuestion.id) {
          return { ...question, answer: mockAnsweredAssessmentQuestion.answer } as Question;
        }
        return question;
      }
    );
    const mockNewAssessment = {
      ...mockAssessment,
      questions: mockNewQuestions
    };
    await expectSaga(BackendSaga)
      .withState({ ...mockStates, session: { ...mockStates.session, role: Role.Staff } })
      .provide([
        [
          call(
            postAnswer,
            mockAnsweredAssessmentQuestion.id,
            mockAnsweredAssessmentQuestion.answer || '',
            mockTokens
          ),
          okResp
        ]
      ])
      .not.call.fn(showWarningMessage)
      .call(showSuccessMessage, 'Saved!', 1000)
      .put(SessionActions.updateAssessment(mockNewAssessment))
      .put(WorkspaceActions.updateHasUnsavedChanges('assessment' as WorkspaceLocation, false))
      .dispatch({ type: actionType, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
    // To make sure no changes in state
    return expect(mockStates.session.assessments[mockNewAssessment.id].questions[0].answer).toEqual(
      null
    );
  });

  test('when response is null', () => {
    const mockAnsweredAssessmentQuestion = { ...mockAssessmentQuestion, answer: '42' };
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Student } })
      .provide([
        [
          call(
            postAnswer,
            mockAnsweredAssessmentQuestion.id,
            mockAnsweredAssessmentQuestion.answer,
            mockTokens
          ),
          null
        ]
      ])
      .call(
        postAnswer,
        mockAnsweredAssessmentQuestion.id,
        mockAnsweredAssessmentQuestion.answer,
        mockTokens
      )
      .call(showWarningMessage, "Couldn't reach our servers. Are you online?")
      .not.call.fn(showSuccessMessage)
      .not.put.actionType(SessionActions.updateAssessment.type)
      .not.put.actionType(WorkspaceActions.updateHasUnsavedChanges.type)
      .hasFinalState({ session: { ...mockTokens, role: Role.Student } })
      .dispatch({ type: actionType, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
  });
});

describe(SessionActions.submitAssessment, actionType => {
  test('when response is ok', async () => {
    const mockAssessmentId = mockAssessment.id;
    const mockNewOverviews = mockAssessmentOverviews.map(overview => {
      if (overview.id === mockAssessmentId) {
        return { ...overview, status: AssessmentStatuses.submitted };
      }
      return overview;
    });
    await expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(postAssessment, mockAssessmentId, mockTokens), okResp]])
      .not.call(showWarningMessage)
      .call(showSuccessMessage, 'Submitted!', 2000)
      .put(SessionActions.updateAssessmentOverviews(mockNewOverviews))
      .dispatch({ type: actionType, payload: mockAssessmentId })
      .silentRun();
    expect(mockStates.session.assessmentOverviews[0].id).toEqual(mockAssessmentId);
    return expect(mockStates.session.assessmentOverviews[0].status).not.toEqual(
      AssessmentStatuses.submitted
    );
  });

  test('when response is null', () => {
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Student } })
      .provide([[call(postAssessment, 0, mockTokens), null]])
      .call(postAssessment, 0, mockTokens)
      .call(showWarningMessage, "Couldn't reach our servers. Are you online?")
      .not.put.actionType(SessionActions.updateAssessmentOverviews.type)
      .hasFinalState({ session: { ...mockTokens, role: Role.Student } })
      .dispatch({ type: actionType, payload: 0 })
      .silentRun();
  });

  test('when role is not a student', async () => {
    const mockAssessmentId = mockAssessment.id;
    const mockNewOverviews = mockAssessmentOverviews.map(overview => {
      if (overview.id === mockAssessmentId) {
        return { ...overview, status: AssessmentStatuses.submitted };
      }
      return overview;
    });
    await expectSaga(BackendSaga)
      .withState({ ...mockStates, session: { ...mockStates.session, role: Role.Staff } })
      .provide([[call(postAssessment, mockAssessmentId, mockTokens), okResp]])
      .not.call(showWarningMessage)
      .call(showSuccessMessage, 'Submitted!', 2000)
      .put(SessionActions.updateAssessmentOverviews(mockNewOverviews))
      .dispatch({ type: SessionActions.submitAssessment.type, payload: mockAssessmentId })
      .silentRun();
    expect(mockStates.session.assessmentOverviews[0].id).toEqual(mockAssessmentId);
    return expect(mockStates.session.assessmentOverviews[0].status).not.toEqual(
      AssessmentStatuses.submitted
    );
  });
});

describe(SessionActions.fetchNotifications, actionType => {
  test('when notifications obtained', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(getNotifications, mockTokens), mockNotifications]])
      .put(SessionActions.updateNotifications(mockNotifications))
      .dispatch({ type: actionType })
      .silentRun();
  });
});

describe(SessionActions.acknowledgeNotifications, actionType => {
  test('when response is ok', () => {
    const ids = [1, 2, 3];
    const mockNewNotifications = mockNotifications.filter(n => !ids.includes(n.id));
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(postAcknowledgeNotifications, mockTokens, ids), okResp]])
      .not.call(showWarningMessage)
      .put(SessionActions.updateNotifications(mockNewNotifications))
      .dispatch({
        type: actionType,
        payload: {
          withFilter: (notifications: Notification[]) =>
            notifications.filter(notification => ids.includes(notification.id))
        }
      })
      .silentRun();
  });
});

describe(WorkspaceActions.changeSublanguage, actionType => {
  test('when chapter is changed', () => {
    const sublang: SALanguage = {
      chapter: Chapter.SOURCE_4,
      variant: Variant.NATIVE,
      displayName: 'Source \xa74 Concurrent',
      mainLanguage: SupportedLanguage.JAVASCRIPT,
      supports: {}
    };

    return expectSaga(BackendSaga)
      .withState({ session: { role: Role.Staff, ...mockTokens } })
      .call(putCourseConfig, mockTokens, {
        sourceChapter: sublang.chapter,
        sourceVariant: sublang.variant
      })
      .put(
        SessionActions.setCourseConfiguration({
          sourceChapter: sublang.chapter,
          sourceVariant: sublang.variant
        })
      )
      .provide([
        [
          call(putCourseConfig, mockTokens, {
            sourceChapter: Chapter.SOURCE_4,
            sourceVariant: Variant.NATIVE
          }),
          { ok: true }
        ]
      ])
      .dispatch({ type: actionType, payload: { sublang } })
      .silentRun();
  });
});

describe(SessionActions.updateLatestViewedCourse, actionType => {
  const courseId = 2;

  test('when latest viewed course is changed', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(putLatestViewedCourse, mockTokens, courseId)
      .call(getLatestCourseRegistrationAndConfiguration, mockTokens)
      .put(SessionActions.setCourseRegistration(mockCourseRegistration2))
      .put(SessionActions.setCourseConfiguration(mockCourseConfiguration2))
      .put(SessionActions.setAssessmentConfigurations(mockAssessmentConfigurations))
      .provide([
        [call(putLatestViewedCourse, mockTokens, courseId), okResp],
        [
          call(getLatestCourseRegistrationAndConfiguration, mockTokens),
          {
            courseRegistration: mockCourseRegistration2,
            courseConfiguration: mockCourseConfiguration2,
            assessmentConfigurations: mockAssessmentConfigurations
          }
        ]
      ])
      .dispatch({ type: actionType, payload: { courseId } })
      .silentRun();
  });

  test('when latest viewed course update returns error', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(putLatestViewedCourse, mockTokens, courseId), errorResp]])
      .call(putLatestViewedCourse, mockTokens, courseId)
      .not.call.fn(getLatestCourseRegistrationAndConfiguration)
      .not.put.actionType(SessionActions.setCourseRegistration.type)
      .not.put.actionType(SessionActions.setCourseConfiguration.type)
      .dispatch({ type: actionType, payload: { courseId } })
      .silentRun();
  });

  test('when fail to load course after update', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([
        [call(putLatestViewedCourse, mockTokens, courseId), okResp],
        [
          call(getLatestCourseRegistrationAndConfiguration, mockTokens),
          { courseRegistration: null, courseConfiguration: null }
        ]
      ])
      .call(putLatestViewedCourse, mockTokens, courseId)
      .call(getLatestCourseRegistrationAndConfiguration, mockTokens)
      .not.put.actionType(SessionActions.setCourseRegistration.type)
      .not.put.actionType(SessionActions.setCourseConfiguration.type)
      .dispatch({ type: actionType, payload: { courseId } })
      .silentRun();
  });
});

describe(SessionActions.updateCourseConfig, actionType => {
  const courseConfiguration: CourseConfiguration = {
    courseName: `CS2040S Data Structures and Algorithms (AY20/21 Semester 2)`,
    courseShortName: `CS2040S`,
    viewable: true,
    enableGame: false,
    enableAchievements: false,
    enableOverallLeaderboard: true,
    enableContestLeaderboard: true,
    topLeaderboardDisplay: 100,
    topContestLeaderboardDisplay: 10,
    enableSourcecast: false,
    enableStories: false,
    sourceChapter: Chapter.SOURCE_4,
    sourceVariant: Variant.DEFAULT,
    moduleHelpText: 'Help',
    assetsPrefix: ''
  };

  test('when course config is changed', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(putCourseConfig, mockTokens, courseConfiguration)
      .put(SessionActions.setCourseConfiguration(courseConfiguration))
      .call.fn(showSuccessMessage)
      .provide([[call(putCourseConfig, mockTokens, courseConfiguration), okResp]])
      .dispatch({ type: actionType, payload: courseConfiguration })
      .silentRun();
  });

  test('when course config update fails', () => {
    return expectSaga(BackendSaga)
      .provide([[call(putCourseConfig, mockTokens, courseConfiguration), errorResp]])
      .withState(mockStates)
      .call(putCourseConfig, mockTokens, courseConfiguration)
      .not.put.actionType(SessionActions.setCourseConfiguration.type)
      .not.call.fn(showSuccessMessage)
      .dispatch({ type: actionType, payload: courseConfiguration })
      .silentRun();
  });
});

describe(SessionActions.fetchAssessmentConfigs, actionType => {
  test('when assessment configurations are obtained', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(getAssessmentConfigs, mockTokens)
      .put(SessionActions.setAssessmentConfigurations(mockAssessmentConfigurations))
      .provide([[call(getAssessmentConfigs, mockTokens), mockAssessmentConfigurations]])
      .dispatch({ type: actionType })
      .silentRun();
  });

  test('when assessment configurations is null', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(getAssessmentConfigs, mockTokens), null]])
      .call(getAssessmentConfigs, mockTokens)
      .not.put.actionType(SessionActions.setAssessmentConfigurations.type)
      .dispatch({ type: actionType })
      .silentRun();
  });
});

describe(SessionActions.fetchAdminPanelCourseRegistrations, actionType => {
  const userCourseRegistrations: AdminPanelCourseRegistration[] = [
    {
      courseRegId: 1,
      courseId: 1,
      name: 'Bob',
      username: 'E0000001',
      role: Role.Student
    },
    {
      courseRegId: 2,
      courseId: 1,
      name: 'Avenger',
      username: 'E0000002',
      role: Role.Staff
    }
  ];

  test('when course registrations are obtained', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(getUserCourseRegistrations, mockTokens)
      .put(SessionActions.setAdminPanelCourseRegistrations(userCourseRegistrations))
      .provide([[call(getUserCourseRegistrations, mockTokens), userCourseRegistrations]])
      .dispatch({ type: actionType })
      .silentRun();
  });

  test('when course registrations is null', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(getUserCourseRegistrations, mockTokens), null]])
      .call(getUserCourseRegistrations, mockTokens)
      .not.put.actionType(SessionActions.setAdminPanelCourseRegistrations.type)
      .dispatch({ type: actionType })
      .silentRun();
  });
});

describe(AcademyActions.createCourse, actionType => {
  const courseConfig: UpdateCourseConfiguration = {
    courseName: 'CS1101S Programming Methodology (AY20/21 Sem 1)',
    courseShortName: 'CS1101S',
    viewable: true,
    enableGame: true,
    enableAchievements: true,
    enableOverallLeaderboard: true,
    enableContestLeaderboard: true,
    enableSourcecast: true,
    enableStories: false,
    sourceChapter: Chapter.SOURCE_1,
    sourceVariant: Variant.DEFAULT,
    moduleHelpText: 'Help Text'
  };
  const user = mockUser;
  const courseConfiguration = mockCourseConfiguration1;
  const courseRegistration = mockCourseRegistration1;
  const placeholderAssessmentConfig: AssessmentConfiguration[] = [
    {
      type: 'Missions',
      assessmentConfigId: -1,
      isManuallyGraded: true,
      isGradingAutoPublished: false,
      displayInDashboard: true,
      isMinigame: false,
      hoursBeforeEarlyXpDecay: 0,
      hasTokenCounter: false,
      hasVotingFeatures: false,
      earlySubmissionXp: 0
    }
  ];

  test('created successfully', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(postCreateCourse, mockTokens, courseConfig)
      .call(getUser, mockTokens)
      .put(SessionActions.setUser(mockUser))
      .put(SessionActions.setCourseRegistration({ role: Role.Student }))
      .call(
        putAssessmentConfigs,
        mockTokens,
        placeholderAssessmentConfig,
        courseRegistration.courseId
      )
      .call.fn(showSuccessMessage)
      .provide([
        [call(postCreateCourse, mockTokens, courseConfig), okResp],
        [call(getUser, mockTokens), { user, courseRegistration, courseConfiguration }],
        [
          call(
            putAssessmentConfigs,
            mockTokens,
            placeholderAssessmentConfig,
            courseRegistration.courseId
          ),
          okResp
        ]
      ])
      .dispatch({ type: actionType, payload: courseConfig })
      .silentRun();
  });

  test('unsuccessful', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(postCreateCourse, mockTokens, courseConfig)
      .not.call.fn(getUser)
      .not.put.actionType(SessionActions.setUser.type)
      .not.put.actionType(SessionActions.setCourseRegistration.type)
      .not.call.fn(putAssessmentConfigs)
      .not.call.fn(showSuccessMessage)
      .provide([[call(postCreateCourse, mockTokens, courseConfig), errorResp]])
      .dispatch({ type: actionType, payload: courseConfig })
      .silentRun();
  });
});

describe(AcademyActions.addNewUsersToCourse, actionType => {
  const users: UsernameRoleGroup[] = [
    { username: 'student1', role: Role.Student },
    { username: 'staff1', role: Role.Staff }
  ];
  const provider: string = 'test';

  const userCourseRegistrations: AdminPanelCourseRegistration[] = [
    {
      courseRegId: 1,
      courseId: 1,
      name: 'student1',
      username: 'student1',
      role: Role.Student
    },
    {
      courseRegId: 2,
      courseId: 1,
      name: 'staff1',
      username: 'staff1',
      role: Role.Staff
    }
  ];

  test('added successfully', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(putNewUsers, mockTokens, users, provider)
      .put(SessionActions.fetchAdminPanelCourseRegistrations())
      .call.fn(showSuccessMessage)
      .provide([
        [call(putNewUsers, mockTokens, users, provider), okResp],
        [call(getUserCourseRegistrations, mockTokens), userCourseRegistrations]
      ])
      .dispatch({ type: actionType, payload: { users, provider } })
      .silentRun();
  });

  test('adding unsuccessful', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(putNewUsers, mockTokens, users, provider)
      .not.put.actionType(SessionActions.fetchAdminPanelCourseRegistrations.type)
      .not.call.fn(showSuccessMessage)
      .provide([[call(putNewUsers, mockTokens, users, provider), errorResp]])
      .dispatch({ type: actionType, payload: { users, provider } })
      .silentRun();
  });
});

// TODO: Test addNewStoriesUsersToCourse
baseDescribe.todo(AcademyActions.addNewStoriesUsersToCourse.type);

describe(SessionActions.updateUserRole, actionType => {
  const courseRegId = 2;
  const role = Role.Staff;

  const userCourseRegistrations: AdminPanelCourseRegistration[] = [
    {
      courseRegId: 1,
      courseId: 1,
      name: 'Bob',
      username: 'E0000001',
      role: Role.Student
    },
    {
      courseRegId: 2,
      courseId: 1,
      name: 'Avenger',
      username: 'E0000002',
      role: Role.Staff
    }
  ];

  test('updated successfully', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(putUserRole, mockTokens, courseRegId, role)
      .put(SessionActions.fetchAdminPanelCourseRegistrations())
      .call.fn(showSuccessMessage)
      .provide([
        [call(putUserRole, mockTokens, courseRegId, role), okResp],
        [call(getUserCourseRegistrations, mockTokens), userCourseRegistrations]
      ])
      .dispatch({ type: actionType, payload: { courseRegId, role } })
      .silentRun();
  });

  test('update unsuccessful', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(putUserRole, mockTokens, courseRegId, role)
      .not.put.actionType(SessionActions.fetchAdminPanelCourseRegistrations.type)
      .not.call.fn(showSuccessMessage)
      .provide([[call(putUserRole, mockTokens, courseRegId, role), errorResp]])
      .dispatch({ type: actionType, payload: { courseRegId, role } })
      .silentRun();
  });
});

describe(SessionActions.updateCourseResearchAgreement, actionType => {
  const agreedToResearch = true;

  test('updated successfully', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(putCourseResearchAgreement, mockTokens, agreedToResearch)
      .put(SessionActions.setCourseRegistration({ agreedToResearch }))
      .call.fn(showSuccessMessage)
      .provide([[call(putCourseResearchAgreement, mockTokens, agreedToResearch), okResp]])
      .dispatch({
        type: actionType,
        payload: { agreedToResearch }
      })
      .silentRun();
  });

  test('update unsuccessful', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(putCourseResearchAgreement, mockTokens, agreedToResearch)
      .not.put.actionType(SessionActions.setCourseRegistration.type)
      .not.call.fn(showSuccessMessage)
      .provide([[call(putCourseResearchAgreement, mockTokens, agreedToResearch), errorResp]])
      .dispatch({
        type: actionType,
        payload: { agreedToResearch }
      })
      .silentRun();
  });
});

describe(SessionActions.deleteUserCourseRegistration, actionType => {
  const courseRegId = 1;

  const userCourseRegistrations: AdminPanelCourseRegistration[] = [
    {
      courseRegId: 2,
      courseId: 1,
      name: 'Avenger',
      username: 'E0000002',
      role: Role.Staff
    }
  ];

  test('deleted successfully', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(removeUserCourseRegistration, mockTokens, courseRegId)
      .put(SessionActions.fetchAdminPanelCourseRegistrations())
      .call.fn(showSuccessMessage)
      .provide([
        [call(removeUserCourseRegistration, mockTokens, courseRegId), okResp],
        [call(getUserCourseRegistrations, mockTokens), userCourseRegistrations]
      ])
      .dispatch({
        type: actionType,
        payload: { courseRegId }
      })
      .silentRun();
  });

  test('delete unsucessful', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(removeUserCourseRegistration, mockTokens, courseRegId)
      .not.put.actionType(SessionActions.fetchAdminPanelCourseRegistrations.type)
      .not.call.fn(showSuccessMessage)
      .provide([[call(removeUserCourseRegistration, mockTokens, courseRegId), errorResp]])
      .dispatch({
        type: actionType,
        payload: { courseRegId }
      })
      .silentRun();
  });
});

describe(SessionActions.updateAssessmentConfigs, actionType => {
  test('when assessment configs is changed', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(putAssessmentConfigs, mockTokens, mockAssessmentConfigurations)
      .call(getAssessmentConfigs, mockTokens)
      .put(SessionActions.setAssessmentConfigurations(mockAssessmentConfigurations))
      .call.fn(showSuccessMessage)
      .provide([
        [call(putAssessmentConfigs, mockTokens, mockAssessmentConfigurations), okResp],
        [call(getAssessmentConfigs, mockTokens), mockAssessmentConfigurations]
      ])
      .dispatch({
        type: actionType,
        payload: mockAssessmentConfigurations
      })
      .silentRun();
  });

  test('when assessment configs update fails', () => {
    return expectSaga(BackendSaga)
      .provide([[call(putAssessmentConfigs, mockTokens, mockAssessmentConfigurations), errorResp]])
      .withState(mockStates)
      .call(putAssessmentConfigs, mockTokens, mockAssessmentConfigurations)
      .not.call(getAssessmentConfigs)
      .not.put.actionType(SessionActions.setAssessmentConfigurations.type)
      .not.call.fn(showSuccessMessage)
      .dispatch({
        type: actionType,
        payload: mockAssessmentConfigurations
      })
      .silentRun();
  });
});

describe(DashboardActions.fetchGroupGradingSummary, actionType => {
  test('when grading summary is obtained', () => {
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Staff } })
      .provide([[call(getGradingSummary, mockTokens), mockGradingSummary]])
      .put(DashboardActions.updateGroupGradingSummary(mockGradingSummary))
      .hasFinalState({ session: { ...mockTokens, role: Role.Staff } })
      .dispatch({ type: actionType })
      .silentRun();
  });

  test('when response is null', () => {
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Staff } })
      .provide([[call(getGradingSummary, mockTokens), null]])
      .call(getGradingSummary, mockTokens)
      .not.put.actionType(DashboardActions.updateGroupGradingSummary.type)
      .hasFinalState({ session: { ...mockTokens, role: Role.Staff } })
      .dispatch({ type: actionType })
      .silentRun();
  });
});

describe(SessionActions.reautogradeSubmission, actionType => {
  const submissionId = 123;
  test('when successful', () => {
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Staff } })
      .provide([[call(postReautogradeSubmission, submissionId, mockTokens), okResp]])
      .call(postReautogradeSubmission, submissionId, mockTokens)
      .call.fn(showSuccessMessage)
      .not.call.fn(showWarningMessage)
      .dispatch({ type: actionType, payload: submissionId })
      .silentRun();
  });

  test('when unsuccessful', () => {
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Staff } })
      .provide([[call(postReautogradeSubmission, submissionId, mockTokens), errorResp]])
      .call(postReautogradeSubmission, submissionId, mockTokens)
      .not.call.fn(showSuccessMessage)
      .call.fn(showWarningMessage)
      .dispatch({ type: actionType, payload: submissionId })
      .silentRun();
  });
});

describe(SessionActions.reautogradeAnswer, actionType => {
  const submissionId = 123;
  const questionId = 456;

  test('when successful', () => {
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Staff } })
      .provide([[call(postReautogradeAnswer, submissionId, questionId, mockTokens), okResp]])
      .call(postReautogradeAnswer, submissionId, questionId, mockTokens)
      .call.fn(showSuccessMessage)
      .not.call.fn(showWarningMessage)
      .dispatch({
        type: actionType,
        payload: { submissionId, questionId }
      })
      .silentRun();
  });

  test('when unsuccessful', () => {
    const submissionId = 123;
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Staff } })
      .provide([[call(postReautogradeAnswer, submissionId, questionId, mockTokens), errorResp]])
      .call(postReautogradeAnswer, submissionId, questionId, mockTokens)
      .not.call.fn(showSuccessMessage)
      .call.fn(showWarningMessage)
      .dispatch({
        type: actionType,
        payload: { submissionId, questionId }
      })
      .silentRun();
  });
});
