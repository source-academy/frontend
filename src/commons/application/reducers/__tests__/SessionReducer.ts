import { Chapter, Variant } from 'js-slang/dist/types';

import { GradingOverview, GradingQuery } from '../../../../features/grading/GradingTypes';
import {
  Assessment,
  AssessmentOverview,
  AssessmentStatuses,
  ProgressStatuses
} from '../../../assessment/AssessmentTypes';
import { Notification } from '../../../notificationBadge/NotificationBadgeTypes';
import CommonsActions from '../../actions/CommonsActions';
import SessionActions from '../../actions/SessionActions';
import { defaultSession, GameState, Role, Story } from '../../ApplicationTypes';
import { SessionState } from '../../types/SessionTypes';
import { SessionsReducer } from '../SessionsReducer';

test('LOG_OUT works correctly on default session', () => {
  const action = {
    type: CommonsActions.logOut.type,
    payload: {}
  } as const;
  const result: SessionState = SessionsReducer(defaultSession, action);

  expect(result).toEqual(defaultSession);
});

test('SET_TOKEN sets accessToken and refreshToken correctly', () => {
  const accessToken = 'access_token_test';
  const refreshToken = 'refresh_token_test';

  const action = {
    type: SessionActions.setTokens.type,
    payload: {
      accessToken,
      refreshToken
    }
  } as const;
  const result: SessionState = SessionsReducer(defaultSession, action);

  expect(result).toEqual({
    ...defaultSession,
    ...action.payload
  });
});

test('SET_USER works correctly', () => {
  const payload = {
    userId: 123,
    username: 'E1234567',
    name: 'test student',
    courses: [
      {
        courseId: 1,
        courseName: `CS1101 Programming Methodology (AY20/21 Sem 1)`,
        courseShortName: `CS1101S`,
        viewable: true,
        role: Role.Student
      },
      {
        courseId: 2,
        courseName: `CS2030S Programming Methodology II (AY20/21 Sem 2)`,
        courseShortName: `CS2030S`,
        viewable: true,
        role: Role.Staff
      }
    ]
  };

  const action = {
    type: SessionActions.setUser.type,
    payload
  } as const;
  const result: SessionState = SessionsReducer(defaultSession, action);

  expect(result).toEqual({
    ...defaultSession,
    ...payload
  });
});

test('SET_COURSE_CONFIGURATION works correctly', () => {
  const payload = {
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
  const action = {
    type: SessionActions.setCourseConfiguration.type,
    payload
  } as const;
  const result: SessionState = SessionsReducer(defaultSession, action);

  expect(result).toEqual({
    ...defaultSession,
    ...payload
  });
});

test('SET_COURSE_REGISTRATION works correctly', () => {
  const payload = {
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
    agreedToReseach: true
  };
  const action = {
    type: SessionActions.setCourseRegistration.type,
    payload
  } as const;
  const result: SessionState = SessionsReducer(defaultSession, action);

  expect(result).toEqual({
    ...defaultSession,
    ...payload
  });
});

test('SET_ASSESSMENT_CONFIGURATIONS works correctly', () => {
  const payload = [
    {
      assessmentConfigId: 1,
      type: 'Mission1',
      buildHidden: false,
      buildSolution: false,
      isContest: false,
      hoursBeforeEarlyXpDecay: 48,
      earlySubmissionXp: 200,
      isManuallyGraded: false,
      isGradingAutoPublished: false,
      displayInDashboard: true,
      hasTokenCounter: false,
      hasVotingFeatures: false
    },
    {
      assessmentConfigId: 1,
      type: 'Mission1',
      buildHidden: false,
      buildSolution: false,
      isContest: false,
      hoursBeforeEarlyXpDecay: 48,
      earlySubmissionXp: 200,
      isManuallyGraded: false,
      isGradingAutoPublished: false,
      displayInDashboard: true,
      hasTokenCounter: false,
      hasVotingFeatures: false
    },
    {
      assessmentConfigId: 1,
      type: 'Mission1',
      buildHidden: false,
      buildSolution: false,
      isContest: false,
      hoursBeforeEarlyXpDecay: 48,
      earlySubmissionXp: 200,
      isManuallyGraded: false,
      isGradingAutoPublished: false,
      displayInDashboard: true,
      hasTokenCounter: false,
      hasVotingFeatures: false
    }
  ];

  const action = {
    type: SessionActions.setAssessmentConfigurations.type,
    payload
  } as const;
  const result: SessionState = SessionsReducer(defaultSession, action);

  expect(result).toEqual({
    ...defaultSession,
    assessmentConfigurations: payload
  });
});

test('SET_ADMIN_PANEL_COURSE_REGISTRATIONS works correctly', () => {
  const payload = [
    {
      courseRegId: 1,
      courseId: 1,
      name: 'Bob',
      username: 'E1234567',
      role: Role.Student
    },
    {
      courseRegId: 2,
      courseId: 1,
      name: 'Avenger',
      username: 'E7654321',
      role: Role.Staff
    }
  ];

  const action = {
    type: SessionActions.setAdminPanelCourseRegistrations.type,
    payload
  } as const;
  const result: SessionState = SessionsReducer(defaultSession, action);

  expect(result).toEqual({
    ...defaultSession,
    userCourseRegistrations: payload
  });
});

test('SET_GITHUB_ACCESS_TOKEN works correctly', () => {
  const token = 'githubAccessToken';
  const action = {
    type: SessionActions.setGitHubAccessToken.type,
    payload: token
  } as const;
  const result: SessionState = SessionsReducer(defaultSession, action);

  expect(result).toEqual({
    ...defaultSession,
    githubAccessToken: token
  });
});

// Test Data for UPDATE_ASSESSMENT
const assessmentTest1: Assessment = {
  type: 'Mission',
  globalDeployment: undefined,
  graderDeployment: undefined,
  id: 1,
  longSummary: 'long summary here',
  missionPDF: 'www.google.com',
  questions: [],
  title: 'first assessment'
};

const assessmentTest2: Assessment = {
  type: 'Contest',
  globalDeployment: undefined,
  graderDeployment: undefined,
  id: 1,
  longSummary: 'another long summary',
  missionPDF: 'www.comp.nus.edu.sg',
  questions: [],
  title: 'updated first assessment'
};

const assessmentTest3: Assessment = {
  type: 'Path',
  globalDeployment: undefined,
  graderDeployment: undefined,
  id: 3,
  longSummary: 'another long summary here',
  missionPDF: 'www.yahoo.com',
  questions: [],
  title: 'path'
};

test('UPDATE_ASSESSMENT works correctly in inserting assessment', () => {
  const action = {
    type: SessionActions.updateAssessment.type,
    payload: assessmentTest1
  } as const;
  const resultMap = SessionsReducer(defaultSession, action).assessments;

  expect(resultMap[assessmentTest1.id]).toEqual(assessmentTest1);
});

test('UPDATE_ASSESSMENT works correctly in inserting assessment and retains old data', () => {
  const assessments: { [id: number]: Assessment } = {};
  assessments[assessmentTest3.id] = assessmentTest3;

  const newDefaultSession: SessionState = {
    ...defaultSession,
    assessments
  };

  const action = {
    type: SessionActions.updateAssessment.type,
    payload: assessmentTest2
  } as const;
  const resultMap = SessionsReducer(newDefaultSession, action).assessments;

  expect(resultMap[assessmentTest2.id]).toEqual(assessmentTest2);
  expect(resultMap[assessmentTest3.id]).toEqual(assessmentTest3);
});

test('UPDATE_ASSESSMENT works correctly in updating assessment', () => {
  const assessments: { [id: number]: Assessment } = {};
  assessments[assessmentTest1.id] = assessmentTest1;

  const newDefaultSession = {
    ...defaultSession,
    assessments
  };
  const action = {
    type: SessionActions.updateAssessment.type,
    payload: assessmentTest2
  } as const;
  const resultMap = SessionsReducer(newDefaultSession, action).assessments;

  expect(resultMap[assessmentTest2.id]).toEqual(assessmentTest2);
});

// Test data for UPDATE_ASSESSMENT_OVERVIEWS
const assessmentOverviewsTest1: AssessmentOverview[] = [
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
    maxTeamSize: 5,
    hasVotingFeatures: false,
    hoursBeforeEarlyXpDecay: 0
  }
];

const assessmentOverviewsTest2: AssessmentOverview[] = [
  {
    type: 'Contests',
    isManuallyGraded: true,
    isPublished: false,
    closeAt: 'test_string_0',
    coverImage: 'test_string_0',
    fileName: 'test_sting_0',
    id: 1,
    maxXp: 1,
    earlySubmissionXp: 0,
    openAt: 'test_string_0',
    title: 'test_string_0',
    shortSummary: 'test_string_0',
    status: AssessmentStatuses.attempted,
    story: null,
    xp: 1,
    isGradingPublished: false,
    maxTeamSize: 1,
    hasVotingFeatures: false,
    hoursBeforeEarlyXpDecay: 0
  }
];

test('UPDATE_ASSESSMENT_OVERVIEWS works correctly in inserting assessment overviews', () => {
  const action = {
    type: SessionActions.updateAssessmentOverviews.type,
    payload: assessmentOverviewsTest1
  } as const;

  const result: SessionState = SessionsReducer(defaultSession, action);

  expect(result).toEqual({
    ...defaultSession,
    assessmentOverviews: assessmentOverviewsTest1
  });
});

test('UPDATE_ASSESSMENT_OVERVIEWS works correctly in updating assessment overviews', () => {
  const newDefaultSession = {
    ...defaultSession,
    assessmentOverviews: assessmentOverviewsTest1
  };
  const assessmentOverviewsPayload = [...assessmentOverviewsTest2, ...assessmentOverviewsTest1];
  const action = {
    type: SessionActions.updateAssessmentOverviews.type,
    payload: assessmentOverviewsPayload
  } as const;

  const result: SessionState = SessionsReducer(newDefaultSession, action);

  expect(result).toEqual({
    ...defaultSession,
    assessmentOverviews: assessmentOverviewsPayload
  });
});

// Test data for UPDATE_GRADING
const gradingTest1: GradingQuery = {
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
        comments: 'Well done. Please try the quest!'
      }
    }
  ],
  assessment: {
    coverPicture: 'test string',
    id: 1,
    number: 'M1A',
    reading: 'test string',
    story: 'test string',
    summaryLong: 'test string',
    summaryShort: 'test string',
    title: 'test string'
  }
};

const gradingTest2: GradingQuery = {
  answers: [
    {
      question: jest.genMockFromModule('../../../../features/grading/GradingTypes'),
      student: {
        name: 'another test student',
        username: 'E0000000',
        id: 345
      },
      grade: {
        xp: 500,
        xpAdjustment: 20,
        comments: 'Good job! All the best for the finals.'
      }
    }
  ],
  assessment: {
    coverPicture: 'another test string',
    id: 2,
    number: 'P2',
    reading: 'another test string',
    story: 'another test string',
    summaryLong: 'another test string',
    summaryShort: 'another test string',
    title: 'another test string'
  }
};

test('UPDATE_GRADING works correctly in inserting gradings', () => {
  const submissionId = 23;
  const action = {
    type: SessionActions.updateGrading.type,
    payload: {
      submissionId,
      grading: gradingTest1
    }
  } as const;

  const gradingMap = SessionsReducer(defaultSession, action).gradings;
  expect(gradingMap[submissionId]).toEqual(gradingTest1);
});

test('UPDATE_GRADING works correctly in inserting gradings and retains old data', () => {
  const submissionId1 = 45;
  const submissionId2 = 56;
  const gradings: { [id: number]: GradingQuery } = {};
  gradings[submissionId1] = gradingTest1;

  const newDefaultSession = {
    ...defaultSession,
    gradings
  };

  const action = {
    type: SessionActions.updateGrading.type,
    payload: {
      submissionId: submissionId2,
      grading: gradingTest2
    }
  } as const;

  const gradingMap = SessionsReducer(newDefaultSession, action).gradings;
  expect(gradingMap[submissionId1]).toEqual(gradingTest1);
  expect(gradingMap[submissionId2]).toEqual(gradingTest2);
});

test('UPDATE_GRADING works correctly in updating gradings', () => {
  const submissionId = 23;
  const gradings: { [id: number]: GradingQuery } = {};
  gradings[submissionId] = gradingTest1;
  const newDefaultSession = {
    ...defaultSession,
    gradings
  };

  const action = {
    type: SessionActions.updateGrading.type,
    payload: {
      submissionId,
      grading: gradingTest2
    }
  } as const;

  const gradingMap = SessionsReducer(newDefaultSession, action).gradings;
  expect(gradingMap[submissionId]).toEqual(gradingTest2);
});

// UPDATE_GRADING_OVERVIEWS test data
const gradingOverviewTest1: GradingOverview[] = [
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
    submissionStatus: AssessmentStatuses.attempting,
    progress: ProgressStatuses.attempting,
    isGradingPublished: false,
    groupName: 'group',
    questionCount: 4,
    gradedCount: 2
  }
];

const gradingOverviewTest2: GradingOverview[] = [
  {
    assessmentId: 2,
    assessmentNumber: 'P2',
    assessmentName: 'another assessment',
    assessmentType: 'Quests',
    initialXp: 20,
    xpBonus: 250,
    xpAdjustment: 100,
    currentXp: 300,
    maxXp: 1000,
    studentId: 20,
    studentName: 'another student',
    studentNames: [],
    studentUsername: 'E0000000',
    studentUsernames: [],
    submissionId: 2,
    submissionStatus: AssessmentStatuses.attempted,
    progress: ProgressStatuses.graded,
    isGradingPublished: false,
    groupName: 'another group',
    questionCount: 3,
    gradedCount: 3
  }
];

test('UPDATE_GRADING_OVERVIEWS works correctly in inserting grading overviews', () => {
  const action = {
    type: SessionActions.updateGradingOverviews.type,
    payload: {
      count: gradingOverviewTest1.length,
      data: gradingOverviewTest1
    }
  } as const;
  const result: SessionState = SessionsReducer(defaultSession, action);

  expect(result.gradingOverviews).toEqual({
    count: gradingOverviewTest1.length,
    data: gradingOverviewTest1
  });
});

test('UPDATE_GRADING_OVERVIEWS works correctly in updating grading overviews', () => {
  const newDefaultSession = {
    ...defaultSession,
    gradingOverviews: {
      count: gradingOverviewTest1.length,
      data: gradingOverviewTest1
    }
  };
  const gradingOverviewsPayload = {
    count: gradingOverviewTest1.length + gradingOverviewTest2.length,
    data: [...gradingOverviewTest2, ...gradingOverviewTest1]
  };
  const action = {
    type: SessionActions.updateGradingOverviews.type,
    payload: gradingOverviewsPayload
  } as const;
  const result: SessionState = SessionsReducer(newDefaultSession, action);

  expect(result.gradingOverviews).toEqual(gradingOverviewsPayload);
});

test('UPDATE_NOTIFICATIONS works correctly in updating notifications', () => {
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

  const action = {
    type: SessionActions.updateNotifications.type,
    payload: notifications
  } as const;

  const result: SessionState = SessionsReducer(defaultSession, action);

  expect(result.notifications).toEqual(notifications);
});
