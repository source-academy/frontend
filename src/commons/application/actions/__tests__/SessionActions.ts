import { Variant } from 'js-slang/dist/types';

import { Grading, GradingOverview } from '../../../../features/grading/GradingTypes';
import { Assessment, AssessmentOverview } from '../../../assessment/AssessmentTypes';
import { Notification } from '../../../notificationBadge/NotificationBadgeTypes';
import { GameState, Role, Story } from '../../ApplicationTypes';
import {
  ACKNOWLEDGE_NOTIFICATIONS,
  DELETE_ASSESSMENT_CONFIG,
  DELETE_USER_COURSE_REGISTRATION,
  FETCH_ADMIN_PANEL_COURSE_REGISTRATIONS,
  FETCH_ASSESSMENT,
  FETCH_ASSESSMENT_CONFIGS,
  FETCH_ASSESSMENT_OVERVIEWS,
  FETCH_AUTH,
  FETCH_COURSE_CONFIG,
  FETCH_GRADING,
  FETCH_GRADING_OVERVIEWS,
  FETCH_NOTIFICATIONS,
  FETCH_USER_AND_COURSE,
  LOGIN,
  REAUTOGRADE_ANSWER,
  REAUTOGRADE_SUBMISSION,
  SET_ADMIN_PANEL_COURSE_REGISTRATIONS,
  SET_ASSESSMENT_CONFIGURATIONS,
  SET_COURSE_CONFIGURATION,
  SET_COURSE_REGISTRATION,
  SET_GITHUB_OCTOKIT_OBJECT,
  SET_TOKENS,
  SET_USER,
  SUBMIT_ANSWER,
  SUBMIT_ASSESSMENT,
  SUBMIT_GRADING,
  SUBMIT_GRADING_AND_CONTINUE,
  UNSUBMIT_SUBMISSION,
  UPDATE_ASSESSMENT,
  UPDATE_ASSESSMENT_CONFIGS,
  UPDATE_ASSESSMENT_OVERVIEWS,
  UPDATE_COURSE_CONFIG,
  UPDATE_GRADING,
  UPDATE_GRADING_OVERVIEWS,
  UPDATE_HISTORY_HELPERS,
  UPDATE_LATEST_VIEWED_COURSE,
  UPDATE_NOTIFICATIONS,
  UPDATE_USER_ROLE
} from '../../types/SessionTypes';
import {
  acknowledgeNotifications,
  deleteAssessmentConfig,
  deleteUserCourseRegistration,
  fetchAdminPanelCourseRegistrations,
  fetchAssessment,
  fetchAssessmentConfigs,
  fetchAssessmentOverviews,
  fetchAuth,
  fetchCourseConfig,
  fetchGrading,
  fetchGradingOverviews,
  fetchNotifications,
  fetchUserAndCourse,
  login,
  reautogradeAnswer,
  reautogradeSubmission,
  setAdminPanelCourseRegistrations,
  setAssessmentConfigurations,
  setCourseConfiguration,
  setCourseRegistration,
  setGitHubOctokitObject,
  setTokens,
  setUser,
  submitAnswer,
  submitAssessment,
  submitGrading,
  submitGradingAndContinue,
  unsubmitSubmission,
  updateAssessment,
  updateAssessmentConfigs,
  updateAssessmentOverviews,
  updateCourseConfig,
  updateGrading,
  updateGradingOverviews,
  updateHistoryHelpers,
  updateLatestViewedCourse,
  updateNotifications,
  updateUserRole
} from '../SessionActions';

test('acknowledgeNotifications generates correct action object', () => {
  const action = acknowledgeNotifications();

  expect(action).toEqual({
    type: ACKNOWLEDGE_NOTIFICATIONS,
    payload: {
      withFilter: undefined
    }
  });
});

test('fetchAuth generates correct action object', () => {
  const code = 'luminus-code-test';
  const action = fetchAuth(code);
  expect(action).toEqual({
    type: FETCH_AUTH,
    payload: { code }
  });
});

test('fetchUserAndCourse generates correct action object', () => {
  const action = fetchUserAndCourse();
  expect(action).toEqual({
    type: FETCH_USER_AND_COURSE
  });
});

test('fetchCourseConfig generates correct action object', () => {
  const action = fetchCourseConfig();
  expect(action).toEqual({
    type: FETCH_COURSE_CONFIG
  });
});

test('fetchAssessment generates correct action object', () => {
  const id = 3;
  const action = fetchAssessment(id);
  expect(action).toEqual({
    type: FETCH_ASSESSMENT,
    payload: id
  });
});

test('fetchAssessmentOverviews generates correct action object', () => {
  const action = fetchAssessmentOverviews();
  expect(action).toEqual({
    type: FETCH_ASSESSMENT_OVERVIEWS
  });
});

test('fetchGrading generates correct action object', () => {
  const submissionId = 5;
  const action = fetchGrading(submissionId);
  expect(action).toEqual({
    type: FETCH_GRADING,
    payload: submissionId
  });
});

test('fetchGradingOverviews generates correct default action object', () => {
  const action = fetchGradingOverviews();
  expect(action).toEqual({
    type: FETCH_GRADING_OVERVIEWS,
    payload: true
  });
});

test('fetchGradingOverviews generates correct action object', () => {
  const filterToGroup = false;
  const action = fetchGradingOverviews(filterToGroup);
  expect(action).toEqual({
    type: FETCH_GRADING_OVERVIEWS,
    payload: filterToGroup
  });
});

test('fetchNotifications generates correct action object', () => {
  const action = fetchNotifications();

  expect(action).toEqual({
    type: FETCH_NOTIFICATIONS
  });
});

test('login action generates correct action object', () => {
  const action = login('provider');
  expect(action).toEqual({
    type: LOGIN,
    payload: 'provider'
  });
});

test('setTokens generates correct action object', () => {
  const accessToken = 'access-token-test';
  const refreshToken = 'refresh-token-test';
  const action = setTokens({ accessToken, refreshToken });
  expect(action).toEqual({
    type: SET_TOKENS,
    payload: {
      accessToken,
      refreshToken
    }
  });
});

test('setUser generates correct action object', () => {
  const user = {
    userId: 123,
    name: 'test student',
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
  const action = setUser(user);
  expect(action).toEqual({
    type: SET_USER,
    payload: user
  });
});

test('setCourseConfiguration generates correct action object', () => {
  const courseConfig = {
    courseName: `CS1101 Programming Methodology (AY20/21 Sem 1)`,
    courseShortName: `CS1101S`,
    viewable: true,
    enableGame: true,
    enableAchievements: true,
    enableSourcecast: true,
    sourceChapter: 1,
    sourceVariant: 'default' as Variant,
    moduleHelpText: 'Help text',
    assessmentTypes: ['Missions', 'Quests', 'Paths', 'Contests', 'Others']
  };
  const action = setCourseConfiguration(courseConfig);
  expect(action).toEqual({
    type: SET_COURSE_CONFIGURATION,
    payload: courseConfig
  });
});

test('setCourseRegistration generates correct action object', () => {
  const courseRegistration = {
    courseRegId: 1,
    role: Role.Student,
    group: '42D',
    gameState: {
      collectibles: {},
      completed_quests: []
    } as GameState,
    courseId: 1,
    grade: 1,
    maxGrade: 10,
    xp: 1,
    story: {
      story: '',
      playStory: false
    } as Story
  };
  const action = setCourseRegistration(courseRegistration);
  expect(action).toEqual({
    type: SET_COURSE_REGISTRATION,
    payload: courseRegistration
  });
});

test('setAssessmentConfigurations generates correct action object', () => {
  const assesmentConfigurations = [
    {
      assessmentConfigId: 1,
      type: 'Mission1',
      isManuallyGraded: true,
      displayInDashboard: true,
      hoursBeforeEarlyXpDecay: 48,
      earlySubmissionXp: 200
    },
    {
      assessmentConfigId: 2,
      type: 'Mission2',
      isManuallyGraded: true,
      displayInDashboard: true,
      hoursBeforeEarlyXpDecay: 48,
      earlySubmissionXp: 200
    },
    {
      assessmentConfigId: 3,
      type: 'Mission3',
      isManuallyGraded: true,
      displayInDashboard: true,
      hoursBeforeEarlyXpDecay: 48,
      earlySubmissionXp: 200
    }
  ];
  const action = setAssessmentConfigurations(assesmentConfigurations);
  expect(action).toEqual({
    type: SET_ASSESSMENT_CONFIGURATIONS,
    payload: assesmentConfigurations
  });
});

test('setAdminPanelCourseRegistrations generates correct action object', async () => {
  const userCourseRegistrations = [
    {
      courseRegId: 1,
      courseId: 1,
      name: 'Bob',
      username: 'test/bob123',
      role: Role.Student
    },
    {
      courseRegId: 2,
      courseId: 1,
      name: 'Avenger',
      username: 'test/avenger456',
      role: Role.Staff
    }
  ];
  const action = setAdminPanelCourseRegistrations(userCourseRegistrations);
  expect(action).toEqual({
    type: SET_ADMIN_PANEL_COURSE_REGISTRATIONS,
    payload: userCourseRegistrations
  });
});

test('setGitHubOctokitInstance generates correct action object', async () => {
  const authToken = 'testAuthToken12345';
  const action = setGitHubOctokitObject(authToken);
  expect(action.type).toEqual(SET_GITHUB_OCTOKIT_OBJECT);

  const authObject = (await action.payload.auth()) as any;
  expect(authObject.token).toBe('testAuthToken12345');
  expect(authObject.tokenType).toBe('oauth');
});

test('submitAnswer generates correct action object', () => {
  const id = 3;
  const answer = 'test-answer-here';
  const action = submitAnswer(id, answer);
  expect(action).toEqual({
    type: SUBMIT_ANSWER,
    payload: {
      id,
      answer
    }
  });
});

test('submitAssessment generates correct action object', () => {
  const id = 7;
  const action = submitAssessment(id);
  expect(action).toEqual({
    type: SUBMIT_ASSESSMENT,
    payload: id
  });
});

test('submitGrading generates correct action object with default values', () => {
  const submissionId = 8;
  const questionId = 2;

  const action = submitGrading(submissionId, questionId);
  expect(action).toEqual({
    type: SUBMIT_GRADING,
    payload: {
      submissionId,
      questionId,
      xpAdjustment: 0,
      comments: undefined
    }
  });
});

test('submitGradingAndContinue generates correct action object with default values', () => {
  const submissionId = 8;
  const questionId = 2;

  const action = submitGradingAndContinue(submissionId, questionId);
  expect(action).toEqual({
    type: SUBMIT_GRADING_AND_CONTINUE,
    payload: {
      submissionId,
      questionId,
      xpAdjustment: 0,
      comments: undefined
    }
  });
});

test('submitGrading generates correct action object', () => {
  const submissionId = 10;
  const questionId = 3;
  const xpAdjustment = 100;
  const comments = 'my comment';
  const action = submitGrading(submissionId, questionId, xpAdjustment, comments);
  expect(action).toEqual({
    type: SUBMIT_GRADING,
    payload: {
      submissionId,
      questionId,
      xpAdjustment,
      comments
    }
  });
});

test('submitGradingAndContinue generates correct action object', () => {
  const submissionId = 4;
  const questionId = 7;
  const xpAdjustment = 55;
  const comments = 'another comment';
  const action = submitGradingAndContinue(submissionId, questionId, xpAdjustment, comments);
  expect(action).toEqual({
    type: SUBMIT_GRADING_AND_CONTINUE,
    payload: {
      submissionId,
      questionId,
      xpAdjustment,
      comments
    }
  });
});

test('reautogradeSubmission generates correct action object', () => {
  const submissionId = 123;
  const action = reautogradeSubmission(submissionId);
  expect(action).toEqual({
    type: REAUTOGRADE_SUBMISSION,
    payload: submissionId
  });
});

test('reautogradeAnswer generates correct action object', () => {
  const submissionId = 123;
  const questionId = 456;
  const action = reautogradeAnswer(submissionId, questionId);
  expect(action).toEqual({
    type: REAUTOGRADE_ANSWER,
    payload: { submissionId, questionId }
  });
});

test('unsubmitSubmission generates correct action object', () => {
  const submissionId = 10;
  const action = unsubmitSubmission(submissionId);
  expect(action).toEqual({
    type: UNSUBMIT_SUBMISSION,
    payload: {
      submissionId
    }
  });
});

test('updateHistoryHelpers generates correct action object', () => {
  const loc = 'location';
  const action = updateHistoryHelpers(loc);
  expect(action).toEqual({
    type: UPDATE_HISTORY_HELPERS,
    payload: loc
  });
});

test('updateAssessmentOverviews generates correct action object', () => {
  const overviews: AssessmentOverview[] = [
    {
      type: 'Missions',
      closeAt: 'test_string',
      coverImage: 'test_string',
      id: 0,
      maxXp: 0,
      openAt: 'test_string',
      title: 'test_string',
      shortSummary: 'test_string',
      status: 'not_attempted',
      story: null,
      xp: 0,
      gradingStatus: 'none'
    }
  ];
  const action = updateAssessmentOverviews(overviews);
  expect(action).toEqual({
    type: UPDATE_ASSESSMENT_OVERVIEWS,
    payload: overviews
  });
});

test('updateAssessment generates correct action object', () => {
  const assessment: Assessment = {
    type: 'Missions',
    globalDeployment: undefined,
    graderDeployment: undefined,
    id: 1,
    longSummary: 'long summary here',
    missionPDF: 'www.google.com',
    questions: [],
    title: 'first assessment'
  };

  const action = updateAssessment(assessment);
  expect(action).toEqual({
    type: UPDATE_ASSESSMENT,
    payload: assessment
  });
});

test('updateGradingOverviews generates correct action object', () => {
  const overviews: GradingOverview[] = [
    {
      assessmentId: 1,
      assessmentName: 'test assessment',
      assessmentType: 'Contests',
      initialXp: 0,
      xpBonus: 100,
      xpAdjustment: 50,
      currentXp: 50,
      maxXp: 500,
      studentId: 100,
      studentName: 'test student',
      submissionId: 1,
      submissionStatus: 'attempting',
      groupName: 'group',
      gradingStatus: 'excluded',
      questionCount: 6,
      gradedCount: 0
    }
  ];

  const action = updateGradingOverviews(overviews);
  expect(action).toEqual({
    type: UPDATE_GRADING_OVERVIEWS,
    payload: overviews
  });
});

test('updateGrading generates correct action object', () => {
  const submissionId = 3;
  const grading: Grading = [
    {
      question: jest.genMockFromModule('../../../../features/grading/GradingTypes'),
      student: {
        name: 'test student',
        id: 234
      },
      grade: {
        xp: 100,
        xpAdjustment: 0,
        comments: 'Well done.',
        grader: {
          name: 'HARTIN MENZ',
          id: 100
        },
        gradedAt: '2019-08-16T13:26:32+00:00'
      }
    }
  ];

  const action = updateGrading(submissionId, grading);
  expect(action).toEqual({
    type: UPDATE_GRADING,
    payload: {
      submissionId,
      grading
    }
  });
});

test('updateNotifications generates correct action object', () => {
  const notifications: Notification[] = [
    {
      id: 1,
      type: 'new',
      assessment_id: 1,
      assessment_type: 'Mission',
      assessment_title: 'The Secret to Streams'
    },
    {
      id: 2,
      type: 'new',
      assessment_id: 2,
      assessment_type: 'Sidequest',
      assessment_title: 'A sample Sidequest'
    }
  ];

  const action = updateNotifications(notifications);

  expect(action).toEqual({
    type: UPDATE_NOTIFICATIONS,
    payload: notifications
  });
});

test('updateLatestViewedCourse generates correct action object', () => {
  const courseId = 2;
  const action = updateLatestViewedCourse(courseId);
  expect(action).toEqual({
    type: UPDATE_LATEST_VIEWED_COURSE,
    payload: { courseId }
  });
});

test('updateCourseConfig generates correct action object', () => {
  const courseConfig = {
    courseName: `CS1101 Programming Methodology (AY20/21 Sem 1)`,
    courseShortName: `CS1101S`,
    viewable: true,
    enableGame: true,
    enableAchievements: true,
    enableSourcecast: true,
    sourceChapter: 1,
    sourceVariant: 'default' as Variant,
    moduleHelpText: 'Help text',
    assessmentTypes: ['Missions', 'Quests', 'Paths', 'Contests', 'Others']
  };
  const action = updateCourseConfig(courseConfig);
  expect(action).toEqual({
    type: UPDATE_COURSE_CONFIG,
    payload: courseConfig
  });
});

test('fetchAssessmentConfig generates correct action object', () => {
  const action = fetchAssessmentConfigs();
  expect(action).toEqual({
    type: FETCH_ASSESSMENT_CONFIGS
  });
});

test('updateAssessmentTypes generates correct action object', () => {
  const assessmentConfigs = [
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
      isManuallyGraded: true,
      displayInDashboard: true,
      hoursBeforeEarlyXpDecay: 48,
      earlySubmissionXp: 200
    },
    {
      assessmentConfigId: 4,
      type: 'Contests',
      isManuallyGraded: true,
      displayInDashboard: true,
      hoursBeforeEarlyXpDecay: 48,
      earlySubmissionXp: 200
    },
    {
      assessmentConfigId: 5,
      type: 'Others',
      isManuallyGraded: true,
      displayInDashboard: true,
      hoursBeforeEarlyXpDecay: 48,
      earlySubmissionXp: 200
    }
  ];
  const action = updateAssessmentConfigs(assessmentConfigs);
  expect(action).toEqual({
    type: UPDATE_ASSESSMENT_CONFIGS,
    payload: assessmentConfigs
  });
});

test('deleteAssessmentConfig generates correct action object', () => {
  const assessmentConfig = {
    assessmentConfigId: 1,
    type: 'Mission1',
    isManuallyGraded: true,
    displayInDashboard: true,
    hoursBeforeEarlyXpDecay: 48,
    earlySubmissionXp: 200
  };
  const action = deleteAssessmentConfig(assessmentConfig);
  expect(action).toEqual({
    type: DELETE_ASSESSMENT_CONFIG,
    payload: assessmentConfig
  });
});

test('fetchAdminPanelCourseRegistrations generates correct action object', () => {
  const action = fetchAdminPanelCourseRegistrations();
  expect(action).toEqual({
    type: FETCH_ADMIN_PANEL_COURSE_REGISTRATIONS
  });
});

test('updateUserRole generates correct action object', () => {
  const courseRegId = 1;
  const role = Role.Staff;
  const action = updateUserRole(courseRegId, role);
  expect(action).toEqual({
    type: UPDATE_USER_ROLE,
    payload: { courseRegId, role }
  });
});

test('deleteUserCourseRegistration generates correct action object', () => {
  const courseRegId = 1;
  const action = deleteUserCourseRegistration(courseRegId);
  expect(action).toEqual({
    type: DELETE_USER_COURSE_REGISTRATION,
    payload: { courseRegId }
  });
});
