import { Chapter, Variant } from 'js-slang/dist/types';
import { mockStudents } from 'src/commons/mocks/UserMocks';
import {
  paginationToBackendParams,
  unpublishedToBackendParams
} from 'src/features/grading/GradingUtils';
import { freshSortState } from 'src/pages/academy/grading/subcomponents/GradingSubmissionsTable';

import {
  ColumnFields,
  GradingOverviews,
  GradingQuery
} from '../../../../features/grading/GradingTypes';
import { TeamFormationOverview } from '../../../../features/teamFormation/TeamFormationTypes';
import {
  Assessment,
  AssessmentConfiguration,
  AssessmentOverview,
  AssessmentStatuses,
  ProgressStatuses
} from '../../../assessment/AssessmentTypes';
import { Notification } from '../../../notificationBadge/NotificationBadgeTypes';
import { GameState, Role, Story } from '../../ApplicationTypes';
import { User } from '../../types/SessionTypes';
import SessionActions from '../SessionActions';

test('acknowledgeNotifications generates correct action object', () => {
  const action = SessionActions.acknowledgeNotifications();

  expect(action).toEqual({
    type: SessionActions.acknowledgeNotifications.type,
    payload: {
      withFilter: undefined
    }
  });
});

test('fetchAuth generates correct action object', () => {
  const code = 'luminus-code-test';
  const action = SessionActions.fetchAuth(code);
  expect(action).toEqual({
    type: SessionActions.fetchAuth.type,
    payload: { code }
  });
});

test('fetchUserAndCourse generates correct action object', () => {
  const action = SessionActions.fetchUserAndCourse();
  expect(action).toEqual({
    type: SessionActions.fetchUserAndCourse.type,
    payload: {}
  });
});

test('fetchCourseConfig generates correct action object', () => {
  const action = SessionActions.fetchCourseConfig();
  expect(action).toEqual({
    type: SessionActions.fetchCourseConfig.type,
    payload: {}
  });
});

test('fetchAssessment generates correct action object', () => {
  const id = 3;
  const action = SessionActions.fetchAssessment(id);
  expect(action).toEqual({
    type: SessionActions.fetchAssessment.type,
    payload: { assessmentId: id }
  });
});

test('fetchAssessmentOverviews generates correct action object', () => {
  const action = SessionActions.fetchAssessmentOverviews();
  expect(action).toEqual({
    type: SessionActions.fetchAssessmentOverviews.type,
    payload: {}
  });
});

test('fetchGrading generates correct action object', () => {
  const submissionId = 5;
  const action = SessionActions.fetchGrading(submissionId);
  expect(action).toEqual({
    type: SessionActions.fetchGrading.type,
    payload: submissionId
  });
});

test('fetchGradingOverviews generates correct default action object', () => {
  const action = SessionActions.fetchGradingOverviews();
  expect(action).toEqual({
    type: SessionActions.fetchGradingOverviews.type,
    payload: {
      filterToGroup: true,
      publishedFilter: unpublishedToBackendParams(false),
      pageParams: paginationToBackendParams(0, 10),
      filterParams: {},
      allColsSortStates: { currentState: freshSortState, sortBy: '' }
    }
  });
});

test('fetchGradingOverviews generates correct action object', () => {
  const filterToGroup = false;
  const publishedFilter = unpublishedToBackendParams(true);
  const pageParams = { offset: 123, pageSize: 456 };
  const filterParams = { abc: 'xxx', def: 'yyy' };
  const allColsSortStates = { currentState: freshSortState, sortBy: ColumnFields.assessmentName };
  const action = SessionActions.fetchGradingOverviews(
    filterToGroup,
    publishedFilter,
    pageParams,
    filterParams,
    allColsSortStates
  );
  expect(action).toEqual({
    type: SessionActions.fetchGradingOverviews.type,
    payload: {
      filterToGroup: filterToGroup,
      publishedFilter: publishedFilter,
      pageParams: pageParams,
      filterParams: filterParams,
      allColsSortStates: allColsSortStates
    }
  });
});

test('fetchTeamFormationOverviews generates correct default action object', () => {
  const action = SessionActions.fetchTeamFormationOverviews();
  expect(action).toEqual({
    type: SessionActions.fetchTeamFormationOverviews.type,
    payload: true
  });
});

test('fetchTeamFormationOverviews generates correct action object', () => {
  const filterToGroup = false;
  const action = SessionActions.fetchTeamFormationOverviews(filterToGroup);
  expect(action).toEqual({
    type: SessionActions.fetchTeamFormationOverviews.type,
    payload: filterToGroup
  });
});

test('fetchStudents generates correct action object', () => {
  const action = SessionActions.fetchStudents();
  expect(action).toEqual({
    type: SessionActions.fetchStudents.type,
    payload: {}
  });
});

test('fetchNotifications generates correct action object', () => {
  const action = SessionActions.fetchNotifications();

  expect(action).toEqual({
    type: SessionActions.fetchNotifications.type,
    payload: {}
  });
});

test('login action generates correct action object', () => {
  const action = SessionActions.login('provider');
  expect(action).toEqual({
    type: SessionActions.login.type,
    payload: 'provider'
  });
});

test('setTokens generates correct action object', () => {
  const accessToken = 'access-token-test';
  const refreshToken = 'refresh-token-test';
  const action = SessionActions.setTokens({ accessToken, refreshToken });
  expect(action).toEqual({
    type: SessionActions.setTokens.type,
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
    username: 'test student',
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
  const action = SessionActions.setUser(user);
  expect(action).toEqual({
    type: SessionActions.setUser.type,
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
    enableStories: false,
    sourceChapter: Chapter.SOURCE_1,
    sourceVariant: Variant.DEFAULT,
    moduleHelpText: 'Help text',
    assessmentTypes: ['Missions', 'Quests', 'Paths', 'Contests', 'Others']
  };
  const action = SessionActions.setCourseConfiguration(courseConfig);
  expect(action).toEqual({
    type: SessionActions.setCourseConfiguration.type,
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
    } as Story,
    agreedToResearch: true
  };
  const action = SessionActions.setCourseRegistration(courseRegistration);
  expect(action).toEqual({
    type: SessionActions.setCourseRegistration.type,
    payload: courseRegistration
  });
});

test('setAssessmentConfigurations generates correct action object', () => {
  const assesmentConfigurations: AssessmentConfiguration[] = [
    {
      assessmentConfigId: 1,
      type: 'Mission1',
      isManuallyGraded: true,
      isGradingAutoPublished: false,
      displayInDashboard: true,
      hasTokenCounter: false,
      hasVotingFeatures: false,
      hoursBeforeEarlyXpDecay: 48,
      earlySubmissionXp: 200
    },
    {
      assessmentConfigId: 2,
      type: 'Mission2',
      isManuallyGraded: true,
      isGradingAutoPublished: false,
      displayInDashboard: true,
      hasTokenCounter: false,
      hasVotingFeatures: false,
      hoursBeforeEarlyXpDecay: 48,
      earlySubmissionXp: 200
    },
    {
      assessmentConfigId: 3,
      type: 'Mission3',
      isManuallyGraded: true,
      isGradingAutoPublished: false,
      displayInDashboard: true,
      hasTokenCounter: false,
      hasVotingFeatures: false,
      hoursBeforeEarlyXpDecay: 48,
      earlySubmissionXp: 200
    }
  ];
  const action = SessionActions.setAssessmentConfigurations(assesmentConfigurations);
  expect(action).toEqual({
    type: SessionActions.setAssessmentConfigurations.type,
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
  const action = SessionActions.setAdminPanelCourseRegistrations(userCourseRegistrations);
  expect(action).toEqual({
    type: SessionActions.setAdminPanelCourseRegistrations.type,
    payload: userCourseRegistrations
  });
});

test('setGitHubOctokitInstance generates correct action object', async () => {
  const authToken = 'testAuthToken12345';
  const action = SessionActions.setGitHubOctokitObject(authToken);
  expect(action.type).toEqual(SessionActions.setGitHubOctokitObject.type);

  const authObject = (await action.payload.auth()) as any;
  expect(authObject.token).toBe('testAuthToken12345');
  expect(authObject.tokenType).toBe('oauth');
});

test('setGitHubAccessToken generates correct action object', () => {
  const authToken = 'testAuthToken12345';
  const action = SessionActions.setGitHubAccessToken(authToken);
  expect(action).toEqual({
    type: SessionActions.setGitHubAccessToken.type,
    payload: authToken
  });
});

test('submitAnswer generates correct action object', () => {
  const id = 3;
  const answer = 'test-answer-here';
  const action = SessionActions.submitAnswer(id, answer);
  expect(action).toEqual({
    type: SessionActions.submitAnswer.type,
    payload: {
      id,
      answer
    }
  });
});

test('submitAssessment generates correct action object', () => {
  const id = 7;
  const action = SessionActions.submitAssessment(id);
  expect(action).toEqual({
    type: SessionActions.submitAssessment.type,
    payload: id
  });
});

test('submitGrading generates correct action object with default values', () => {
  const submissionId = 8;
  const questionId = 2;

  const action = SessionActions.submitGrading(submissionId, questionId);
  expect(action).toEqual({
    type: SessionActions.submitGrading.type,
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

  const action = SessionActions.submitGradingAndContinue(submissionId, questionId);
  expect(action).toEqual({
    type: SessionActions.submitGradingAndContinue.type,
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
  const action = SessionActions.submitGrading(submissionId, questionId, xpAdjustment, comments);
  expect(action).toEqual({
    type: SessionActions.submitGrading.type,
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
  const action = SessionActions.submitGradingAndContinue(
    submissionId,
    questionId,
    xpAdjustment,
    comments
  );
  expect(action).toEqual({
    type: SessionActions.submitGradingAndContinue.type,
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
  const action = SessionActions.reautogradeSubmission(submissionId);
  expect(action).toEqual({
    type: SessionActions.reautogradeSubmission.type,
    payload: submissionId
  });
});

test('reautogradeAnswer generates correct action object', () => {
  const submissionId = 123;
  const questionId = 456;
  const action = SessionActions.reautogradeAnswer(submissionId, questionId);
  expect(action).toEqual({
    type: SessionActions.reautogradeAnswer.type,
    payload: { submissionId, questionId }
  });
});

test('unsubmitSubmission generates correct action object', () => {
  const submissionId = 10;
  const action = SessionActions.unsubmitSubmission(submissionId);
  expect(action).toEqual({
    type: SessionActions.unsubmitSubmission.type,
    payload: {
      submissionId
    }
  });
});

test('updateAssessmentOverviews generates correct action object', () => {
  const overviews: AssessmentOverview[] = [
    {
      type: 'Missions',
      isManuallyGraded: true,
      isPublished: false,
      closeAt: 'test_string',
      coverImage: 'test_string',
      id: 0,
      maxXp: 0,
      earlySubmissionXp: 0,
      openAt: 'test_string',
      title: 'test_string',
      shortSummary: 'test_string',
      status: AssessmentStatuses.not_attempted,
      story: null,
      xp: 0,
      isGradingPublished: false,
      maxTeamSize: 1,
      hasVotingFeatures: false,
      hoursBeforeEarlyXpDecay: 0
    }
  ];
  const action = SessionActions.updateAssessmentOverviews(overviews);
  expect(action).toEqual({
    type: SessionActions.updateAssessmentOverviews.type,
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

  const action = SessionActions.updateAssessment(assessment);
  expect(action).toEqual({
    type: SessionActions.updateAssessment.type,
    payload: assessment
  });
});

test('updateGradingOverviews generates correct action object', () => {
  const overviews: GradingOverviews = {
    count: 1,
    data: [
      {
        assessmentId: 1,
        assessmentNumber: 'M1A',
        assessmentName: 'test assessment',
        assessmentType: 'Contests',
        initialXp: 0,
        xpBonus: 100,
        xpAdjustment: 50,
        currentXp: 50,
        maxXp: 500,
        studentId: 100,
        studentName: 'test student',
        studentNames: [],
        studentUsername: 'E0123456',
        studentUsernames: [],
        submissionId: 1,
        isGradingPublished: false,
        progress: ProgressStatuses.attempting,
        groupName: 'group',
        submissionStatus: AssessmentStatuses.attempting,
        questionCount: 6,
        gradedCount: 0
      }
    ]
  };

  const action = SessionActions.updateGradingOverviews(overviews);
  expect(action).toEqual({
    type: SessionActions.updateGradingOverviews.type,
    payload: overviews
  });
});

test('updateStudents generates correct action object', () => {
  const students: User[] = mockStudents;

  const action = SessionActions.updateStudents(students);
  expect(action).toEqual({
    type: SessionActions.updateStudents.type,
    payload: students
  });
});

test('updateTeamFormationOverview generates correct action object', () => {
  const overview: TeamFormationOverview = {
    teamId: 0,
    assessmentId: 1,
    assessmentName: 'Mission 1',
    assessmentType: 'Missions',
    studentIds: [0],
    studentNames: ['Mark Henry']
  };

  const action = SessionActions.updateTeamFormationOverview(overview);
  expect(action).toEqual({
    type: SessionActions.updateTeamFormationOverview.type,
    payload: overview
  });
});

test('updateTeamFormationOverviews generates correct action object', () => {
  const overviews: TeamFormationOverview[] = [
    {
      teamId: 0,
      assessmentId: 0,
      assessmentName: 'Mission 2',
      assessmentType: 'Missions',
      studentIds: [0],
      studentNames: ['Mark Henry']
    }
  ];

  const action = SessionActions.updateTeamFormationOverviews(overviews);
  expect(action).toEqual({
    type: SessionActions.updateTeamFormationOverviews.type,
    payload: overviews
  });
});

test('updateGrading generates correct action object', () => {
  const submissionId = 3;
  const grading: GradingQuery = {
    answers: [
      {
        question: jest.genMockFromModule('../../../../features/grading/GradingTypes'),
        student: {
          name: 'test student',
          username: 'E0123456',
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
    ],
    assessment: {
      coverPicture: 'https://i.imgur.com/dR7zBPI.jpeg',
      id: 1,
      number: '5',
      reading: 'reading here',
      story: 'story here',
      summaryLong: 'long summary here',
      summaryShort: 'short summary here',
      title: 'assessment title here'
    }
  };

  const action = SessionActions.updateGrading(submissionId, grading);
  expect(action).toEqual({
    type: SessionActions.updateGrading.type,
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

  const action = SessionActions.updateNotifications(notifications);

  expect(action).toEqual({
    type: SessionActions.updateNotifications.type,
    payload: notifications
  });
});

test('updateLatestViewedCourse generates correct action object', () => {
  const courseId = 2;
  const action = SessionActions.updateLatestViewedCourse(courseId);
  expect(action).toEqual({
    type: SessionActions.updateLatestViewedCourse.type,
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
    enableStories: false,
    sourceChapter: Chapter.SOURCE_1,
    sourceVariant: Variant.DEFAULT,
    moduleHelpText: 'Help text',
    assessmentTypes: ['Missions', 'Quests', 'Paths', 'Contests', 'Others']
  };
  const action = SessionActions.updateCourseConfig(courseConfig);
  expect(action).toEqual({
    type: SessionActions.updateCourseConfig.type,
    payload: courseConfig
  });
});

test('fetchAssessmentConfig generates correct action object', () => {
  const action = SessionActions.fetchAssessmentConfigs();
  expect(action).toEqual({
    type: SessionActions.fetchAssessmentConfigs.type,
    payload: {}
  });
});

test('updateAssessmentTypes generates correct action object', () => {
  const assessmentConfigs = [
    {
      assessmentConfigId: 1,
      type: 'Missions',
      isManuallyGraded: true,
      isGradingAutoPublished: false,
      displayInDashboard: true,
      hasTokenCounter: false,
      hasVotingFeatures: false,
      hoursBeforeEarlyXpDecay: 48,
      earlySubmissionXp: 200
    },
    {
      assessmentConfigId: 2,
      type: 'Quests',
      isManuallyGraded: true,
      isGradingAutoPublished: false,
      displayInDashboard: true,
      hasTokenCounter: false,
      hasVotingFeatures: false,
      hoursBeforeEarlyXpDecay: 48,
      earlySubmissionXp: 200
    },
    {
      assessmentConfigId: 3,
      type: 'Paths',
      isManuallyGraded: false,
      isGradingAutoPublished: true,
      displayInDashboard: true,
      hasTokenCounter: false,
      hasVotingFeatures: false,
      hoursBeforeEarlyXpDecay: 48,
      earlySubmissionXp: 200
    },
    {
      assessmentConfigId: 4,
      type: 'Contests',
      isManuallyGraded: true,
      isGradingAutoPublished: false,
      displayInDashboard: true,
      hasTokenCounter: false,
      hasVotingFeatures: false,
      hoursBeforeEarlyXpDecay: 48,
      earlySubmissionXp: 200
    },
    {
      assessmentConfigId: 5,
      type: 'PEs',
      isManuallyGraded: false,
      isGradingAutoPublished: false,
      displayInDashboard: true,
      hasTokenCounter: false,
      hasVotingFeatures: false,
      hoursBeforeEarlyXpDecay: 0,
      earlySubmissionXp: 0
    },
    {
      assessmentConfigId: 6,
      type: 'Others',
      isManuallyGraded: true,
      isGradingAutoPublished: false,
      displayInDashboard: true,
      hasTokenCounter: false,
      hasVotingFeatures: false,
      hoursBeforeEarlyXpDecay: 48,
      earlySubmissionXp: 200
    }
  ];
  const action = SessionActions.updateAssessmentConfigs(assessmentConfigs);
  expect(action).toEqual({
    type: SessionActions.updateAssessmentConfigs.type,
    payload: assessmentConfigs
  });
});

test('deleteAssessmentConfig generates correct action object', () => {
  const assessmentConfig = {
    assessmentConfigId: 1,
    type: 'Mission1',
    isManuallyGraded: true,
    isGradingAutoPublished: false,
    displayInDashboard: true,
    hasTokenCounter: false,
    hasVotingFeatures: false,
    hoursBeforeEarlyXpDecay: 48,
    earlySubmissionXp: 200
  };
  const action = SessionActions.deleteAssessmentConfig(assessmentConfig);
  expect(action).toEqual({
    type: SessionActions.deleteAssessmentConfig.type,
    payload: assessmentConfig
  });
});

test('fetchAdminPanelCourseRegistrations generates correct action object', () => {
  const action = SessionActions.fetchAdminPanelCourseRegistrations();
  expect(action).toEqual({
    type: SessionActions.fetchAdminPanelCourseRegistrations.type,
    payload: {}
  });
});

test('updateUserRole generates correct action object', () => {
  const courseRegId = 1;
  const role = Role.Staff;
  const action = SessionActions.updateUserRole(courseRegId, role);
  expect(action).toEqual({
    type: SessionActions.updateUserRole.type,
    payload: { courseRegId, role }
  });
});

test('updateCourseResearchAgreement generates correct action object', () => {
  const agreedToResearch = true;
  const action = SessionActions.updateCourseResearchAgreement(agreedToResearch);
  expect(action).toEqual({
    type: SessionActions.updateCourseResearchAgreement.type,
    payload: { agreedToResearch }
  });
});

test('deleteUserCourseRegistration generates correct action object', () => {
  const courseRegId = 1;
  const action = SessionActions.deleteUserCourseRegistration(courseRegId);
  expect(action).toEqual({
    type: SessionActions.deleteUserCourseRegistration.type,
    payload: { courseRegId }
  });
});
