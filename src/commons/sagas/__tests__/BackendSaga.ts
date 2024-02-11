import { Chapter, Variant } from 'js-slang/dist/types';
import { createMemoryRouter } from 'react-router';
import { call } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
import { ADD_NEW_USERS_TO_COURSE, CREATE_COURSE } from 'src/features/academy/AcademyTypes';
import { UsernameRoleGroup } from 'src/pages/academy/adminPanel/subcomponents/AddUserPanel';

import { updateGroupGradingSummary } from '../../../features/dashboard/DashboardActions';
import {
  FETCH_GROUP_GRADING_SUMMARY,
  UPDATE_GROUP_GRADING_SUMMARY
} from '../../../features/dashboard/DashboardTypes';
import {
  fetchAdminPanelCourseRegistrations,
  setAdminPanelCourseRegistrations,
  setAssessmentConfigurations,
  setCourseConfiguration,
  setCourseRegistration,
  setTokens,
  setUser,
  updateAssessment,
  updateAssessmentOverviews,
  updateLatestViewedCourse,
  updateNotifications
} from '../../application/actions/SessionActions';
import {
  GameState,
  Role,
  SALanguage,
  Story,
  SupportedLanguage
} from '../../application/ApplicationTypes';
import {
  ACKNOWLEDGE_NOTIFICATIONS,
  AdminPanelCourseRegistration,
  CourseConfiguration,
  CourseRegistration,
  DELETE_USER_COURSE_REGISTRATION,
  FETCH_ADMIN_PANEL_COURSE_REGISTRATIONS,
  FETCH_ASSESSMENT,
  FETCH_ASSESSMENT_CONFIGS,
  FETCH_AUTH,
  FETCH_COURSE_CONFIG,
  FETCH_NOTIFICATIONS,
  FETCH_USER_AND_COURSE,
  REAUTOGRADE_ANSWER,
  REAUTOGRADE_SUBMISSION,
  SET_ADMIN_PANEL_COURSE_REGISTRATIONS,
  SET_ASSESSMENT_CONFIGURATIONS,
  SET_COURSE_CONFIGURATION,
  SET_COURSE_REGISTRATION,
  SET_TOKENS,
  SET_USER,
  SUBMIT_ANSWER,
  UPDATE_ASSESSMENT,
  UPDATE_ASSESSMENT_CONFIGS,
  UPDATE_ASSESSMENT_OVERVIEWS,
  UPDATE_COURSE_CONFIG,
  UPDATE_COURSE_RESEARCH_AGREEMENT,
  UPDATE_LATEST_VIEWED_COURSE,
  UPDATE_USER_ROLE,
  UpdateCourseConfiguration,
  User
} from '../../application/types/SessionTypes';
import {
  Assessment,
  AssessmentConfiguration,
  AssessmentStatuses,
  FETCH_ASSESSMENT_OVERVIEWS,
  Question,
  SUBMIT_ASSESSMENT
} from '../../assessment/AssessmentTypes';
import {
  mockAssessmentOverviews,
  mockAssessmentQuestions,
  mockAssessments
} from '../../mocks/AssessmentMocks';
import { mockGradingSummary } from '../../mocks/GradingMocks';
import { mockNotifications } from '../../mocks/UserMocks';
import { Notification } from '../../notificationBadge/NotificationBadgeTypes';
import { AuthProviderType, computeRedirectUri } from '../../utils/AuthHelper';
import Constants from '../../utils/Constants';
import {
  showSuccessMessage,
  showWarningMessage
} from '../../utils/notifications/NotificationsHelper';
import { updateHasUnsavedChanges } from '../../workspace/WorkspaceActions';
import {
  CHANGE_SUBLANGUAGE,
  UPDATE_HAS_UNSAVED_CHANGES,
  WorkspaceLocation
} from '../../workspace/WorkspaceTypes';
import BackendSaga from '../BackendSaga';
import {
  getAssessment,
  getAssessmentConfigs,
  getAssessmentOverviews,
  getCourseConfig,
  getGradingSummary,
  getLatestCourseRegistrationAndConfiguration,
  getNotifications,
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

const mockMapAssessments = new Map<number, Assessment>(mockAssessments.map(a => [a.id, a]));

const mockAssessmentQuestion = mockAssessmentQuestions[0];

const mockTokens = { accessToken: 'access', refreshToken: 'refresherOrb' };

const mockUser: User = {
  userId: 123,
  name: 'user',
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
  enableSourcecast: true,
  enableStories: false,
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
    displayInDashboard: true,
    hoursBeforeEarlyXpDecay: 48,
    earlySubmissionXp: 200
  },
  {
    assessmentConfigId: 2,
    type: 'Quests',
    isManuallyGraded: true,
    displayInDashboard: true,
    hoursBeforeEarlyXpDecay: 48,
    earlySubmissionXp: 200
  },
  {
    assessmentConfigId: 3,
    type: 'Paths',
    isManuallyGraded: false,
    displayInDashboard: false,
    hoursBeforeEarlyXpDecay: 48,
    earlySubmissionXp: 200
  },
  {
    assessmentConfigId: 4,
    type: 'Contests',
    isManuallyGraded: false,
    displayInDashboard: false,
    hoursBeforeEarlyXpDecay: 48,
    earlySubmissionXp: 200
  },
  {
    assessmentConfigId: 5,
    type: 'Others',
    isManuallyGraded: true,
    displayInDashboard: false,
    hoursBeforeEarlyXpDecay: 48,
    earlySubmissionXp: 200
  }
];

const mockRouter = createMemoryRouter([
  {
    path: '/',
    element: null
  }
]);

const mockStates = {
  router: mockRouter,
  session: {
    assessmentOverviews: mockAssessmentOverviews,
    assessments: mockMapAssessments,
    notifications: mockNotifications,
    ...mockTokens,
    ...mockUser,
    ...mockCourseRegistration1,
    ...mockCourseConfiguration1
  },
  workspaces: {
    assessment: { currentAssessment: mockAssessment.id }
  }
};

const okResp = { ok: true };
const errorResp = { ok: false, text: () => 'Some Error' };
// ----------------------------------------

describe('Test FETCH_AUTH action', () => {
  const code = 'luminusCode';
  const providerId = 'provider';
  const clientId = 'clientId';
  Constants.authProviders.set(providerId, {
    name: providerId,
    endpoint: `https://test/?client_id=${clientId}`,
    isDefault: true,
    type: AuthProviderType.OAUTH2
  });
  const redirectUrl = computeRedirectUri(providerId);

  const user = mockUser;
  const courseConfiguration = mockCourseConfiguration1;
  const courseRegistration = mockCourseRegistration1;
  const assessmentConfigurations = mockAssessmentConfigurations;

  test('when tokens, user, course registration and course configuration are obtained', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(postAuth, code, providerId, clientId, redirectUrl)
      .put(setTokens(mockTokens))
      .call(getUser, mockTokens)
      .put(setUser(user))
      .not.put.actionType(UPDATE_LATEST_VIEWED_COURSE)
      .put(setCourseRegistration(courseRegistration))
      .put(setCourseConfiguration(courseConfiguration))
      .put(setAssessmentConfigurations(assessmentConfigurations))
      .provide([
        [call(postAuth, code, providerId, clientId, redirectUrl), mockTokens],
        [
          call(getUser, mockTokens),
          { user, courseRegistration, courseConfiguration, assessmentConfigurations }
        ]
      ])
      .dispatch({ type: FETCH_AUTH, payload: { code, providerId } })
      .silentRun();
  });

  test('when tokens is null', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(postAuth, code, providerId, clientId, redirectUrl), null]])
      .call(postAuth, code, providerId, clientId, redirectUrl)
      .not.put.actionType(SET_TOKENS)
      .not.call.fn(getUser)
      .not.put.actionType(SET_USER)
      .not.put.actionType(UPDATE_LATEST_VIEWED_COURSE)
      .not.put.actionType(SET_COURSE_REGISTRATION)
      .not.put.actionType(SET_COURSE_CONFIGURATION)
      .not.put.actionType(SET_ASSESSMENT_CONFIGURATIONS)
      .dispatch({ type: FETCH_AUTH, payload: { code, providerId } })
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
      .put(setTokens(mockTokens))
      .call(getUser, mockTokens)
      .put(setUser(userWithNoCourse))
      .not.put.actionType(UPDATE_LATEST_VIEWED_COURSE)
      .not.put.actionType(SET_COURSE_REGISTRATION)
      .not.put.actionType(SET_COURSE_CONFIGURATION)
      .not.put.actionType(SET_ASSESSMENT_CONFIGURATIONS)
      .dispatch({ type: FETCH_AUTH, payload: { code, providerId } })
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
      .withState({ session: mockTokens }) // need to mock tokens for updateLatestViewedCourse call
      .call(postAuth, code, providerId, clientId, redirectUrl)
      .put(setTokens(mockTokens))
      .call(getUser, mockTokens)
      .put(setUser(user))
      .put(updateLatestViewedCourse(user.courses[0].courseId))
      .not.put.actionType(SET_COURSE_REGISTRATION)
      .not.put.actionType(SET_COURSE_CONFIGURATION)
      .not.put.actionType(SET_ASSESSMENT_CONFIGURATIONS)
      .dispatch({ type: FETCH_AUTH, payload: { code, providerId } })
      .silentRun();
  });

  test('when user is null', () => {
    return expectSaga(BackendSaga)
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
      .put(setTokens(mockTokens))
      .call(getUser, mockTokens)
      .not.put.actionType(SET_USER)
      .not.put.actionType(UPDATE_LATEST_VIEWED_COURSE)
      .not.put.actionType(SET_COURSE_REGISTRATION)
      .not.put.actionType(SET_COURSE_CONFIGURATION)
      .not.put.actionType(SET_ASSESSMENT_CONFIGURATIONS)
      .dispatch({ type: FETCH_AUTH, payload: { code, providerId } })
      .silentRun();
  });
});

describe('Test FETCH_USER_AND_COURSE action', () => {
  const user = mockUser;
  const courseConfiguration = mockCourseConfiguration1;
  const courseRegistration = mockCourseRegistration1;
  const assessmentConfigurations = mockAssessmentConfigurations;

  test('when user, course registration and course configuration are obtained', () => {
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .call(getUser, mockTokens)
      .put(setUser(user))
      .not.put.actionType(UPDATE_LATEST_VIEWED_COURSE)
      .put(setCourseRegistration(courseRegistration))
      .put(setCourseConfiguration(courseConfiguration))
      .put(setAssessmentConfigurations(assessmentConfigurations))
      .provide([
        [
          call(getUser, mockTokens),
          { user, courseRegistration, courseConfiguration, assessmentConfigurations }
        ]
      ])
      .dispatch({ type: FETCH_USER_AND_COURSE, payload: true })
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
      .put(setUser(user))
      .put(updateLatestViewedCourse(user.courses[0].courseId))
      .not.put.actionType(SET_COURSE_REGISTRATION)
      .not.put.actionType(SET_COURSE_CONFIGURATION)
      .not.put.actionType(SET_ASSESSMENT_CONFIGURATIONS)
      .dispatch({ type: FETCH_USER_AND_COURSE, payload: true })
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
      .put(setUser(userWithNoCourse))
      .not.put.actionType(UPDATE_LATEST_VIEWED_COURSE)
      .not.put.actionType(SET_COURSE_REGISTRATION)
      .not.put.actionType(SET_COURSE_CONFIGURATION)
      .not.put.actionType(SET_ASSESSMENT_CONFIGURATIONS)
      .dispatch({ type: FETCH_USER_AND_COURSE, payload: true })
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
      .not.put.actionType(SET_USER)
      .not.put.actionType(UPDATE_LATEST_VIEWED_COURSE)
      .not.put.actionType(SET_COURSE_REGISTRATION)
      .not.put.actionType(SET_COURSE_CONFIGURATION)
      .not.put.actionType(SET_ASSESSMENT_CONFIGURATIONS)
      .dispatch({ type: FETCH_USER_AND_COURSE, payload: true })
      .silentRun();
  });
});

describe('Test FETCH_COURSE_CONFIG action', () => {
  test('when course config is obtained', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(getCourseConfig, mockTokens), { config: mockCourseConfiguration1 }]])
      .put(setCourseConfiguration(mockCourseConfiguration1))
      .dispatch({ type: FETCH_COURSE_CONFIG })
      .silentRun();
  });

  test('when course config is null', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(getCourseConfig, mockTokens), { config: null }]])
      .not.put.actionType(SET_COURSE_CONFIGURATION)
      .dispatch({ type: FETCH_COURSE_CONFIG })
      .silentRun();
  });
});

describe('Test FETCH_ASSESSMENT_OVERVIEWS action', () => {
  test('when assesments is obtained', () => {
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getAssessmentOverviews, mockTokens), mockAssessmentOverviews]])
      .put(updateAssessmentOverviews(mockAssessmentOverviews))
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: FETCH_ASSESSMENT_OVERVIEWS })
      .silentRun();
  });

  test('when assessments overviews is null', () => {
    const ret = null;
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getAssessmentOverviews, mockTokens), ret]])
      .call(getAssessmentOverviews, mockTokens)
      .not.put.actionType(UPDATE_ASSESSMENT_OVERVIEWS)
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: FETCH_ASSESSMENT_OVERVIEWS })
      .silentRun();
  });
});

describe('Test FETCH_ASSESSMENT action', () => {
  test('when assessment is obtained', () => {
    const mockId = mockAssessment.id;
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getAssessment, mockId, mockTokens, undefined, undefined), mockAssessment]])
      .put(updateAssessment(mockAssessment))
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: FETCH_ASSESSMENT, payload: { assessmentId: mockId } })
      .silentRun();
  });

  test('when assessment is null', () => {
    const mockId = mockAssessment.id;
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getAssessment, mockId, mockTokens, undefined, undefined), null]])
      .call(getAssessment, mockId, mockTokens, undefined, undefined)
      .not.put.actionType(UPDATE_ASSESSMENT)
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: FETCH_ASSESSMENT, payload: { assessmentId: mockId } })
      .silentRun();
  });
});

describe('Test SUBMIT_ANSWER action', () => {
  test('when response is ok', () => {
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
    expectSaga(BackendSaga)
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
      .put(updateAssessment(mockNewAssessment))
      .put(updateHasUnsavedChanges('assessment' as WorkspaceLocation, false))
      .dispatch({ type: SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
    // To make sure no changes in state
    return expect(
      mockStates.session.assessments.get(mockNewAssessment.id)!.questions[0].answer
    ).toEqual(null);
  });

  test('when role is not student', () => {
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
    expectSaga(BackendSaga)
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
      .put(updateAssessment(mockNewAssessment))
      .put(updateHasUnsavedChanges('assessment' as WorkspaceLocation, false))
      .dispatch({ type: SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
    // To make sure no changes in state
    return expect(
      mockStates.session.assessments.get(mockNewAssessment.id)!.questions[0].answer
    ).toEqual(null);
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
      .not.put.actionType(UPDATE_ASSESSMENT)
      .not.put.actionType(UPDATE_HAS_UNSAVED_CHANGES)
      .hasFinalState({ session: { ...mockTokens, role: Role.Student } })
      .dispatch({ type: SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
  });
});

describe('Test SUBMIT_ASSESSMENT action', () => {
  test('when response is ok', () => {
    const mockAssessmentId = mockAssessment.id;
    const mockNewOverviews = mockAssessmentOverviews.map(overview => {
      if (overview.id === mockAssessmentId) {
        return { ...overview, status: AssessmentStatuses.submitted };
      }
      return overview;
    });
    expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(postAssessment, mockAssessmentId, mockTokens), okResp]])
      .not.call(showWarningMessage)
      .call(showSuccessMessage, 'Submitted!', 2000)
      .put(updateAssessmentOverviews(mockNewOverviews))
      .dispatch({ type: SUBMIT_ASSESSMENT, payload: mockAssessmentId })
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
      .not.put.actionType(UPDATE_ASSESSMENT_OVERVIEWS)
      .hasFinalState({ session: { ...mockTokens, role: Role.Student } })
      .dispatch({ type: SUBMIT_ASSESSMENT, payload: 0 })
      .silentRun();
  });

  test('when role is not a student', () => {
    const mockAssessmentId = mockAssessment.id;
    const mockNewOverviews = mockAssessmentOverviews.map(overview => {
      if (overview.id === mockAssessmentId) {
        return { ...overview, status: AssessmentStatuses.submitted };
      }
      return overview;
    });
    expectSaga(BackendSaga)
      .withState({ ...mockStates, session: { ...mockStates.session, role: Role.Staff } })
      .provide([[call(postAssessment, mockAssessmentId, mockTokens), okResp]])
      .not.call(showWarningMessage)
      .call(showSuccessMessage, 'Submitted!', 2000)
      .put(updateAssessmentOverviews(mockNewOverviews))
      .dispatch({ type: SUBMIT_ASSESSMENT, payload: mockAssessmentId })
      .silentRun();
    expect(mockStates.session.assessmentOverviews[0].id).toEqual(mockAssessmentId);
    return expect(mockStates.session.assessmentOverviews[0].status).not.toEqual(
      AssessmentStatuses.submitted
    );
  });
});

describe('Test FETCH_NOTIFICATIONS action', () => {
  test('when notifications obtained', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(getNotifications, mockTokens), mockNotifications]])
      .put(updateNotifications(mockNotifications))
      .dispatch({ type: FETCH_NOTIFICATIONS })
      .silentRun();
  });
});

describe('Test ACKNOWLEDGE_NOTIFICATIONS action', () => {
  test('when response is ok', () => {
    const ids = [1, 2, 3];
    const mockNewNotifications = mockNotifications.filter(n => !ids.includes(n.id));
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(postAcknowledgeNotifications, mockTokens, ids), okResp]])
      .not.call(showWarningMessage)
      .put(updateNotifications(mockNewNotifications))
      .dispatch({
        type: ACKNOWLEDGE_NOTIFICATIONS,
        payload: {
          withFilter: (notifications: Notification[]) =>
            notifications.filter(notification => ids.includes(notification.id))
        }
      })
      .silentRun();
  });
});

describe('Test CHANGE_SUBLANGUAGE action', () => {
  test('when chapter is changed', () => {
    const sublang: SALanguage = {
      chapter: Chapter.SOURCE_4,
      variant: Variant.GPU,
      displayName: 'Source \xa74 GPU',
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
        setCourseConfiguration({ sourceChapter: sublang.chapter, sourceVariant: sublang.variant })
      )
      .provide([
        [
          call(putCourseConfig, mockTokens, {
            sourceChapter: Chapter.SOURCE_4,
            sourceVariant: Variant.GPU
          }),
          { ok: true }
        ]
      ])
      .dispatch({ type: CHANGE_SUBLANGUAGE, payload: { sublang } })
      .silentRun();
  });
});

describe('Test UPDATE_LATEST_VIEWED_COURSE action', () => {
  const courseId = 2;

  test('when latest viewed course is changed', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(putLatestViewedCourse, mockTokens, courseId)
      .call(getLatestCourseRegistrationAndConfiguration, mockTokens)
      .put(setCourseRegistration(mockCourseRegistration2))
      .put(setCourseConfiguration(mockCourseConfiguration2))
      .put(setAssessmentConfigurations(mockAssessmentConfigurations))
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
      .dispatch({ type: UPDATE_LATEST_VIEWED_COURSE, payload: { courseId } })
      .silentRun();
  });

  test('when latest viewed course update returns error', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(putLatestViewedCourse, mockTokens, courseId), errorResp]])
      .call(putLatestViewedCourse, mockTokens, courseId)
      .not.call.fn(getLatestCourseRegistrationAndConfiguration)
      .not.put.actionType(SET_COURSE_REGISTRATION)
      .not.put.actionType(SET_COURSE_CONFIGURATION)
      .dispatch({ type: UPDATE_LATEST_VIEWED_COURSE, payload: { courseId } })
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
      .not.put.actionType(SET_COURSE_REGISTRATION)
      .not.put.actionType(SET_COURSE_CONFIGURATION)
      .dispatch({ type: UPDATE_LATEST_VIEWED_COURSE, payload: { courseId } })
      .silentRun();
  });
});

describe('Test UPDATE_COURSE_CONFIG action', () => {
  const courseConfiguration: CourseConfiguration = {
    courseName: `CS2040S Data Structures and Algorithms (AY20/21 Semester 2)`,
    courseShortName: `CS2040S`,
    viewable: true,
    enableGame: false,
    enableAchievements: false,
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
      .put(setCourseConfiguration(courseConfiguration))
      .call.fn(showSuccessMessage)
      .provide([[call(putCourseConfig, mockTokens, courseConfiguration), okResp]])
      .dispatch({ type: UPDATE_COURSE_CONFIG, payload: courseConfiguration })
      .silentRun();
  });

  test('when course config update fails', () => {
    return expectSaga(BackendSaga)
      .provide([[call(putCourseConfig, mockTokens, courseConfiguration), errorResp]])
      .withState(mockStates)
      .call(putCourseConfig, mockTokens, courseConfiguration)
      .not.put.actionType(SET_COURSE_CONFIGURATION)
      .not.call.fn(showSuccessMessage)
      .dispatch({ type: UPDATE_COURSE_CONFIG, payload: courseConfiguration })
      .silentRun();
  });
});

describe('Test FETCH_ASSESSMENT_CONFIG action', () => {
  test('when assessment configurations are obtained', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(getAssessmentConfigs, mockTokens)
      .put(setAssessmentConfigurations(mockAssessmentConfigurations))
      .provide([[call(getAssessmentConfigs, mockTokens), mockAssessmentConfigurations]])
      .dispatch({ type: FETCH_ASSESSMENT_CONFIGS })
      .silentRun();
  });

  test('when assessment configurations is null', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(getAssessmentConfigs, mockTokens), null]])
      .call(getAssessmentConfigs, mockTokens)
      .not.put.actionType(SET_ASSESSMENT_CONFIGURATIONS)
      .dispatch({ type: FETCH_ASSESSMENT_CONFIGS })
      .silentRun();
  });
});

describe('Test FETCH_ADMIN_PANEL_COURSE_REGISTRATIONS action', () => {
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
      .put(setAdminPanelCourseRegistrations(userCourseRegistrations))
      .provide([[call(getUserCourseRegistrations, mockTokens), userCourseRegistrations]])
      .dispatch({ type: FETCH_ADMIN_PANEL_COURSE_REGISTRATIONS })
      .silentRun();
  });

  test('when course registrations is null', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(getUserCourseRegistrations, mockTokens), null]])
      .call(getUserCourseRegistrations, mockTokens)
      .not.put.actionType(SET_ADMIN_PANEL_COURSE_REGISTRATIONS)
      .dispatch({ type: FETCH_ADMIN_PANEL_COURSE_REGISTRATIONS })
      .silentRun();
  });
});

describe('Test CREATE_COURSE action', () => {
  const courseConfig: UpdateCourseConfiguration = {
    courseName: 'CS1101S Programming Methodology (AY20/21 Sem 1)',
    courseShortName: 'CS1101S',
    viewable: true,
    enableGame: true,
    enableAchievements: true,
    enableSourcecast: true,
    enableStories: false,
    sourceChapter: Chapter.SOURCE_1,
    sourceVariant: Variant.DEFAULT,
    moduleHelpText: 'Help Text'
  };
  const user = mockUser;
  const courseConfiguration = mockCourseConfiguration1;
  const courseRegistration = mockCourseRegistration1;
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

  test('created successfully', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(postCreateCourse, mockTokens, courseConfig)
      .call(getUser, mockTokens)
      .put(setUser(mockUser))
      .put(setCourseRegistration({ role: Role.Student }))
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
      .dispatch({ type: CREATE_COURSE, payload: courseConfig })
      .silentRun();
  });

  test('unsuccessful', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(postCreateCourse, mockTokens, courseConfig)
      .not.call.fn(getUser)
      .not.put.actionType(SET_USER)
      .not.put.actionType(SET_COURSE_REGISTRATION)
      .not.call.fn(putAssessmentConfigs)
      .not.call.fn(showSuccessMessage)
      .provide([[call(postCreateCourse, mockTokens, courseConfig), errorResp]])
      .dispatch({ type: CREATE_COURSE, payload: courseConfig })
      .silentRun();
  });
});

describe('Test ADD_NEW_USERS_TO_COURSE action', () => {
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
      .put(fetchAdminPanelCourseRegistrations())
      .call.fn(showSuccessMessage)
      .provide([
        [call(putNewUsers, mockTokens, users, provider), okResp],
        [call(getUserCourseRegistrations, mockTokens), userCourseRegistrations]
      ])
      .dispatch({ type: ADD_NEW_USERS_TO_COURSE, payload: { users, provider } })
      .silentRun();
  });

  test('adding unsuccessful', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(putNewUsers, mockTokens, users, provider)
      .not.put.actionType(FETCH_ADMIN_PANEL_COURSE_REGISTRATIONS)
      .not.call.fn(showSuccessMessage)
      .provide([[call(putNewUsers, mockTokens, users, provider), errorResp]])
      .dispatch({ type: ADD_NEW_USERS_TO_COURSE, payload: { users, provider } })
      .silentRun();
  });
});

describe('Test UPDATE_USER_ROLE action', () => {
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
      .put(fetchAdminPanelCourseRegistrations())
      .call.fn(showSuccessMessage)
      .provide([
        [call(putUserRole, mockTokens, courseRegId, role), okResp],
        [call(getUserCourseRegistrations, mockTokens), userCourseRegistrations]
      ])
      .dispatch({ type: UPDATE_USER_ROLE, payload: { courseRegId, role } })
      .silentRun();
  });

  test('update unsuccessful', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(putUserRole, mockTokens, courseRegId, role)
      .not.put.actionType(FETCH_ADMIN_PANEL_COURSE_REGISTRATIONS)
      .not.call.fn(showSuccessMessage)
      .provide([[call(putUserRole, mockTokens, courseRegId, role), errorResp]])
      .dispatch({ type: UPDATE_USER_ROLE, payload: { courseRegId, role } })
      .silentRun();
  });
});

describe('Test UPDATE_COURSE_RESEARCH_AGREEMENT', () => {
  const agreedToResearch = true;

  test('updated successfully', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(putCourseResearchAgreement, mockTokens, agreedToResearch)
      .put(setCourseRegistration({ agreedToResearch }))
      .call.fn(showSuccessMessage)
      .provide([[call(putCourseResearchAgreement, mockTokens, agreedToResearch), okResp]])
      .dispatch({ type: UPDATE_COURSE_RESEARCH_AGREEMENT, payload: { agreedToResearch } })
      .silentRun();
  });

  test('update unsuccessful', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(putCourseResearchAgreement, mockTokens, agreedToResearch)
      .not.put.actionType(SET_COURSE_REGISTRATION)
      .not.call.fn(showSuccessMessage)
      .provide([[call(putCourseResearchAgreement, mockTokens, agreedToResearch), errorResp]])
      .dispatch({ type: UPDATE_COURSE_RESEARCH_AGREEMENT, payload: { agreedToResearch } })
      .silentRun();
  });
});

describe('Test DELETE_USER_COURSE_REGISTRATION action', () => {
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
      .put(fetchAdminPanelCourseRegistrations())
      .call.fn(showSuccessMessage)
      .provide([
        [call(removeUserCourseRegistration, mockTokens, courseRegId), okResp],
        [call(getUserCourseRegistrations, mockTokens), userCourseRegistrations]
      ])
      .dispatch({ type: DELETE_USER_COURSE_REGISTRATION, payload: { courseRegId } })
      .silentRun();
  });

  test('delete unsucessful', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(removeUserCourseRegistration, mockTokens, courseRegId)
      .not.put.actionType(FETCH_ADMIN_PANEL_COURSE_REGISTRATIONS)
      .not.call.fn(showSuccessMessage)
      .provide([[call(removeUserCourseRegistration, mockTokens, courseRegId), errorResp]])
      .dispatch({ type: DELETE_USER_COURSE_REGISTRATION, payload: { courseRegId } })
      .silentRun();
  });
});

describe('Test UPDATE_ASSESSMENT_CONFIGS action', () => {
  test('when assessment configs is changed', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .call(putAssessmentConfigs, mockTokens, mockAssessmentConfigurations)
      .call(getAssessmentConfigs, mockTokens)
      .put(setAssessmentConfigurations(mockAssessmentConfigurations))
      .call.fn(showSuccessMessage)
      .provide([
        [call(putAssessmentConfigs, mockTokens, mockAssessmentConfigurations), okResp],
        [call(getAssessmentConfigs, mockTokens), mockAssessmentConfigurations]
      ])
      .dispatch({ type: UPDATE_ASSESSMENT_CONFIGS, payload: mockAssessmentConfigurations })
      .silentRun();
  });

  test('when assessment configs update fails', () => {
    return expectSaga(BackendSaga)
      .provide([[call(putAssessmentConfigs, mockTokens, mockAssessmentConfigurations), errorResp]])
      .withState(mockStates)
      .call(putAssessmentConfigs, mockTokens, mockAssessmentConfigurations)
      .not.call(getAssessmentConfigs)
      .not.put.actionType(SET_ASSESSMENT_CONFIGURATIONS)
      .not.call.fn(showSuccessMessage)
      .dispatch({ type: UPDATE_ASSESSMENT_CONFIGS, payload: mockAssessmentConfigurations })
      .silentRun();
  });
});

describe('Test FETCH_GROUP_GRADING_SUMMARY action', () => {
  test('when grading summary is obtained', () => {
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Staff } })
      .provide([[call(getGradingSummary, mockTokens), mockGradingSummary]])
      .put(updateGroupGradingSummary(mockGradingSummary))
      .hasFinalState({ session: { ...mockTokens, role: Role.Staff } })
      .dispatch({ type: FETCH_GROUP_GRADING_SUMMARY })
      .silentRun();
  });

  test('when response is null', () => {
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Staff } })
      .provide([[call(getGradingSummary, mockTokens), null]])
      .call(getGradingSummary, mockTokens)
      .not.put.actionType(UPDATE_GROUP_GRADING_SUMMARY)
      .hasFinalState({ session: { ...mockTokens, role: Role.Staff } })
      .dispatch({ type: FETCH_GROUP_GRADING_SUMMARY })
      .silentRun();
  });
});

describe('Test REAUTOGRADE_SUBMISSION Action', () => {
  const submissionId = 123;
  test('when successful', () => {
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Staff } })
      .provide([[call(postReautogradeSubmission, submissionId, mockTokens), okResp]])
      .call(postReautogradeSubmission, submissionId, mockTokens)
      .call.fn(showSuccessMessage)
      .not.call.fn(showWarningMessage)
      .dispatch({ type: REAUTOGRADE_SUBMISSION, payload: submissionId })
      .silentRun();
  });

  test('when unsuccessful', () => {
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Staff } })
      .provide([[call(postReautogradeSubmission, submissionId, mockTokens), errorResp]])
      .call(postReautogradeSubmission, submissionId, mockTokens)
      .not.call.fn(showSuccessMessage)
      .call.fn(showWarningMessage)
      .dispatch({ type: REAUTOGRADE_SUBMISSION, payload: submissionId })
      .silentRun();
  });
});

describe('Test REAUTOGRADE_ANSWER Action', () => {
  const submissionId = 123;
  const questionId = 456;

  test('when successful', () => {
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Staff } })
      .provide([[call(postReautogradeAnswer, submissionId, questionId, mockTokens), okResp]])
      .call(postReautogradeAnswer, submissionId, questionId, mockTokens)
      .call.fn(showSuccessMessage)
      .not.call.fn(showWarningMessage)
      .dispatch({ type: REAUTOGRADE_ANSWER, payload: { submissionId, questionId } })
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
      .dispatch({ type: REAUTOGRADE_ANSWER, payload: { submissionId, questionId } })
      .silentRun();
  });
});
