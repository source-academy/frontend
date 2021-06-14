import { Grading, GradingOverview } from '../../../../features/grading/GradingTypes';
import {
  Assessment,
  AssessmentCategories,
  AssessmentOverview,
  AssessmentStatuses,
  GradingStatuses
} from '../../../assessment/AssessmentTypes';
import { Notification } from '../../../notificationBadge/NotificationBadgeTypes';
import { HistoryHelper } from '../../../utils/HistoryHelper';
import { defaultSession, GameState, Role, Story } from '../../ApplicationTypes';
import { LOG_OUT } from '../../types/CommonsTypes';
import {
  SessionState,
  SET_GITHUB_ACCESS_TOKEN,
  SET_TOKENS,
  SET_USER,
  UPDATE_ASSESSMENT,
  UPDATE_ASSESSMENT_OVERVIEWS,
  UPDATE_GRADING,
  UPDATE_GRADING_OVERVIEWS,
  UPDATE_HISTORY_HELPERS,
  UPDATE_NOTIFICATIONS
} from '../../types/SessionTypes';
import { SessionsReducer } from '../SessionsReducer';

test('LOG_OUT works correctly on default session', () => {
  const action = {
    type: LOG_OUT,
    payload: {}
  };
  const result: SessionState = SessionsReducer(defaultSession, action);

  expect(result).toEqual(defaultSession);
});

test('SET_TOKEN sets accessToken and refreshToken correctly', () => {
  const accessToken = 'access_token_test';
  const refreshToken = 'refresh_token_test';

  const action = {
    type: SET_TOKENS,
    payload: {
      accessToken,
      refreshToken
    }
  };
  const result: SessionState = SessionsReducer(defaultSession, action);

  expect(result).toEqual({
    ...defaultSession,
    ...action.payload
  });
});

test('SET_USER works correctly', () => {
  const story: Story = {
    story: 'test story',
    playStory: true
  };
  const gameState: GameState = {
    collectibles: {},
    completed_quests: []
  };
  const payload = {
    name: 'test student',
    role: Role.Student,
    group: '42D',
    grade: 150,
    story,
    gameState
  };

  const action = {
    type: SET_USER,
    payload
  };
  const result: SessionState = SessionsReducer(defaultSession, action);

  expect(result).toEqual({
    ...defaultSession,
    ...payload
  });
});

test('SET_GITHUB_ACCESS_TOKEN works correctly', () => {
  const token = 'githubAccessToken';
  const action = {
    type: SET_GITHUB_ACCESS_TOKEN,
    payload: token
  };
  const result: SessionState = SessionsReducer(defaultSession, action);

  expect(result).toEqual({
    ...defaultSession,
    githubAccessToken: token
  });
});

test('UPDATE_HISTORY_HELPERS works on non-academy location', () => {
  const payload = '/playground';
  const historyHelper: HistoryHelper = {
    lastAcademyLocations: ['/academy/1', '/academy/2'],
    lastGeneralLocations: ['/academy/1', '/academy/2']
  };

  const newDefaultSession = {
    ...defaultSession,
    historyHelper
  };
  const action = {
    type: UPDATE_HISTORY_HELPERS,
    payload
  };
  const resultHistory: HistoryHelper = SessionsReducer(newDefaultSession, action).historyHelper;

  expect(resultHistory.lastGeneralLocations).toEqual([
    historyHelper.lastGeneralLocations[1],
    payload
  ]);
  expect(resultHistory.lastAcademyLocations).toEqual(historyHelper.lastAcademyLocations);
});

test('UPDATE_HISTORY_HELPERS works on academy location', () => {
  const payload = '/academy/3';
  const historyHelper: HistoryHelper = {
    lastAcademyLocations: ['/academy/1', '/academy/2'],
    lastGeneralLocations: ['/academy/1', '/academy/2']
  };

  const newDefaultSession: SessionState = {
    ...defaultSession,
    historyHelper
  };
  const action = {
    type: UPDATE_HISTORY_HELPERS,
    payload
  };
  const resultHistory: HistoryHelper = SessionsReducer(newDefaultSession, action).historyHelper;

  expect(resultHistory.lastGeneralLocations).toEqual([
    historyHelper.lastAcademyLocations[1],
    payload
  ]);
  expect(resultHistory.lastAcademyLocations).toEqual([
    historyHelper.lastAcademyLocations[1],
    payload
  ]);
});

// Test Data for UPDATE_ASSESSMENT
const assessmentTest1: Assessment = {
  category: 'Mission',
  globalDeployment: undefined,
  graderDeployment: undefined,
  id: 1,
  longSummary: 'long summary here',
  missionPDF: 'www.google.com',
  questions: [],
  title: 'first assessment'
};

const assessmentTest2: Assessment = {
  category: 'Contest',
  globalDeployment: undefined,
  graderDeployment: undefined,
  id: 1,
  longSummary: 'another long summary',
  missionPDF: 'www.comp.nus.edu.sg',
  questions: [],
  title: 'updated first assessment'
};

const assessmentTest3: Assessment = {
  category: 'Path',
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
    type: UPDATE_ASSESSMENT,
    payload: assessmentTest1
  };
  const resultMap: Map<number, Assessment> = SessionsReducer(defaultSession, action).assessments;

  expect(resultMap.get(assessmentTest1.id)).toEqual(assessmentTest1);
});

test('UPDATE_ASSESSMENT works correctly in inserting assessment and retains old data', () => {
  const assessments = new Map<number, Assessment>();
  assessments.set(assessmentTest3.id, assessmentTest3);

  const newDefaultSession: SessionState = {
    ...defaultSession,
    assessments
  };

  const action = {
    type: UPDATE_ASSESSMENT,
    payload: assessmentTest2
  };
  const resultMap: Map<number, Assessment> = SessionsReducer(newDefaultSession, action).assessments;

  expect(resultMap.get(assessmentTest2.id)).toEqual(assessmentTest2);
  expect(resultMap.get(assessmentTest3.id)).toEqual(assessmentTest3);
});

test('UPDATE_ASSESSMENT works correctly in updating assessment', () => {
  const assessments = new Map<number, Assessment>();
  assessments.set(assessmentTest1.id, assessmentTest1);

  const newDefaultSession = {
    ...defaultSession,
    assessments
  };
  const action = {
    type: UPDATE_ASSESSMENT,
    payload: assessmentTest2
  };
  const resultMap: Map<number, Assessment> = SessionsReducer(newDefaultSession, action).assessments;

  expect(resultMap.get(assessmentTest2.id)).toEqual(assessmentTest2);
});

// Test data for UPDATE_ASSESSMENT_OVERVIEWS
const assessmentOverviewsTest1: AssessmentOverview[] = [
  {
    category: AssessmentCategories.Mission,
    closeAt: 'test_string',
    coverImage: 'test_string',
    grade: 0,
    id: 0,
    maxGrade: 0,
    maxXp: 0,
    openAt: 'test_string',
    title: 'test_string',
    shortSummary: 'test_string',
    status: AssessmentStatuses.not_attempted,
    story: null,
    xp: 0,
    gradingStatus: GradingStatuses.none
  }
];

const assessmentOverviewsTest2: AssessmentOverview[] = [
  {
    category: AssessmentCategories.Contest,
    closeAt: 'test_string_0',
    coverImage: 'test_string_0',
    fileName: 'test_sting_0',
    grade: 1,
    id: 1,
    maxGrade: 1,
    maxXp: 1,
    openAt: 'test_string_0',
    title: 'test_string_0',
    shortSummary: 'test_string_0',
    status: AssessmentStatuses.attempted,
    story: null,
    xp: 1,
    gradingStatus: GradingStatuses.grading
  }
];

test('UPDATE_ASSESSMENT_OVERVIEWS works correctly in inserting assessment overviews', () => {
  const action = {
    type: UPDATE_ASSESSMENT_OVERVIEWS,
    payload: assessmentOverviewsTest1
  };

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
    type: UPDATE_ASSESSMENT_OVERVIEWS,
    payload: assessmentOverviewsPayload
  };

  const result: SessionState = SessionsReducer(newDefaultSession, action);

  expect(result).toEqual({
    ...defaultSession,
    assessmentOverviews: assessmentOverviewsPayload
  });
});

// Test data for UPDATE_GRADING
const gradingTest1: Grading = [
  {
    question: jest.genMockFromModule('../../../../features/grading/GradingTypes'),
    student: {
      name: 'test student',
      id: 234
    },
    grade: {
      grade: 10,
      gradeAdjustment: 0,
      xp: 100,
      xpAdjustment: 0,
      comments: 'Well done. Please try the quest!'
    }
  }
];

const gradingTest2: Grading = [
  {
    question: jest.genMockFromModule('../../../../features/grading/GradingTypes'),
    student: {
      name: 'another test student',
      id: 345
    },
    grade: {
      grade: 30,
      gradeAdjustment: 10,
      xp: 500,
      xpAdjustment: 20,
      comments: 'Good job! All the best for the finals.'
    }
  }
];

test('UPDATE_GRADING works correctly in inserting gradings', () => {
  const submissionId = 23;
  const action = {
    type: UPDATE_GRADING,
    payload: {
      submissionId,
      grading: gradingTest1
    }
  };

  const gradingMap: Map<number, Grading> = SessionsReducer(defaultSession, action).gradings;
  expect(gradingMap.get(submissionId)).toEqual(gradingTest1);
});

test('UPDATE_GRADING works correctly in inserting gradings and retains old data', () => {
  const submissionId1 = 45;
  const submissionId2 = 56;
  const gradings = new Map<number, Grading>();
  gradings.set(submissionId1, gradingTest1);

  const newDefaultSession = {
    ...defaultSession,
    gradings
  };

  const action = {
    type: UPDATE_GRADING,
    payload: {
      submissionId: submissionId2,
      grading: gradingTest2
    }
  };

  const gradingMap: Map<number, Grading> = SessionsReducer(newDefaultSession, action).gradings;
  expect(gradingMap.get(submissionId1)).toEqual(gradingTest1);
  expect(gradingMap.get(submissionId2)).toEqual(gradingTest2);
});

test('UPDATE_GRADING works correctly in updating gradings', () => {
  const submissionId = 23;
  const gradings = new Map<number, Grading>();
  gradings.set(submissionId, gradingTest1);
  const newDefaultSession = {
    ...defaultSession,
    gradings
  };

  const action = {
    type: UPDATE_GRADING,
    payload: {
      submissionId,
      grading: gradingTest2
    }
  };

  const gradingMap: Map<number, Grading> = SessionsReducer(newDefaultSession, action).gradings;
  expect(gradingMap.get(submissionId)).toEqual(gradingTest2);
});

// UPDATE_GRADING_OVERVIEWS test data
const gradingOverviewTest1: GradingOverview[] = [
  {
    assessmentId: 1,
    assessmentName: 'test assessment',
    assessmentCategory: 'Contest',
    initialGrade: 0,
    gradeAdjustment: 0,
    currentGrade: 10,
    maxGrade: 20,
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
    questionCount: 0,
    gradedCount: 6
  }
];

const gradingOverviewTest2: GradingOverview[] = [
  {
    assessmentId: 2,
    assessmentName: 'another assessment',
    assessmentCategory: 'Sidequest',
    initialGrade: 5,
    gradeAdjustment: 10,
    currentGrade: 20,
    maxGrade: 50,
    initialXp: 20,
    xpBonus: 250,
    xpAdjustment: 100,
    currentXp: 300,
    maxXp: 1000,
    studentId: 20,
    studentName: 'another student',
    submissionId: 2,
    submissionStatus: 'attempted',
    groupName: 'another group',
    gradingStatus: 'excluded',
    questionCount: 6,
    gradedCount: 0
  }
];

test('UPDATE_GRADING_OVERVIEWS works correctly in inserting grading overviews', () => {
  const action = {
    type: UPDATE_GRADING_OVERVIEWS,
    payload: gradingOverviewTest1
  };
  const result: SessionState = SessionsReducer(defaultSession, action);

  expect(result.gradingOverviews).toEqual(gradingOverviewTest1);
});

test('UPDATE_GRADING_OVERVIEWS works correctly in updating grading overviews', () => {
  const newDefaultSession = {
    ...defaultSession,
    gradingOverviews: gradingOverviewTest1
  };
  const gradingOverviewsPayload = [...gradingOverviewTest2, ...gradingOverviewTest1];
  const action = {
    type: UPDATE_GRADING_OVERVIEWS,
    payload: gradingOverviewsPayload
  };
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
    type: UPDATE_NOTIFICATIONS,
    payload: notifications
  };

  const result: SessionState = SessionsReducer(defaultSession, action);

  expect(result.notifications).toEqual(notifications);
});
