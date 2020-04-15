import { Grading, GradingOverview } from '../../components/academy/grading/gradingShape';
import { IAssessment, IAssessmentOverview } from '../../components/assessment/assessmentShape';
import { Notification } from '../../components/notification/notificationShape';
import { GameState, Role, Story } from '../../reducers/states';
import * as actionTypes from '../actionTypes';
import {
  acknowledgeNotifications,
  fetchAnnouncements,
  fetchAssessment,
  fetchAssessmentOverviews,
  fetchAuth,
  fetchGrading,
  fetchGradingOverviews,
  fetchNotifications,
  login,
  notifyChatUsers,
  setTokens,
  setUser,
  submitAnswer,
  submitAssessment,
  submitGrading,
  submitGradingAndContinue,
  unsubmitSubmission,
  updateAssessment,
  updateAssessmentOverviews,
  updateGrading,
  updateGradingOverviews,
  updateHistoryHelpers,
  updateNotifications
} from '../session';

test('acknowledgeNotifications generates correct action object', () => {
  const action = acknowledgeNotifications();

  expect(action).toEqual({
    type: actionTypes.ACKNOWLEDGE_NOTIFICATIONS,
    payload: {
      withFilter: undefined
    }
  });
});

test('fetchAuth generates correct action object', () => {
  const luminusCode = 'luminus-code-test';
  const action = fetchAuth(luminusCode);
  expect(action).toEqual({
    type: actionTypes.FETCH_AUTH,
    payload: luminusCode
  });
});

test('fetchAnnouncements generates correct action object', () => {
  const action = fetchAnnouncements();
  expect(action).toEqual({
    type: actionTypes.FETCH_ANNOUNCEMENTS
  });
});

test('fetchAssessment generates correct action object', () => {
  const id = 3;
  const action = fetchAssessment(id);
  expect(action).toEqual({
    type: actionTypes.FETCH_ASSESSMENT,
    payload: id
  });
});

test('fetchAssessmentOverviews generates correct action object', () => {
  const action = fetchAssessmentOverviews();
  expect(action).toEqual({
    type: actionTypes.FETCH_ASSESSMENT_OVERVIEWS
  });
});

test('fetchGrading generates correct action object', () => {
  const submissionId = 5;
  const action = fetchGrading(submissionId);
  expect(action).toEqual({
    type: actionTypes.FETCH_GRADING,
    payload: submissionId
  });
});

test('fetchGradingOverviews generates correct default action object', () => {
  const action = fetchGradingOverviews();
  expect(action).toEqual({
    type: actionTypes.FETCH_GRADING_OVERVIEWS,
    payload: true
  });
});

test('fetchGradingOverviews generates correct action object', () => {
  const filterToGroup = false;
  const action = fetchGradingOverviews(filterToGroup);
  expect(action).toEqual({
    type: actionTypes.FETCH_GRADING_OVERVIEWS,
    payload: filterToGroup
  });
});

test('fetchNotifications generates correct action object', () => {
  const action = fetchNotifications();

  expect(action).toEqual({
    type: actionTypes.FETCH_NOTIFICATIONS
  });
});

test('login action generates correct action object', () => {
  const action = login();
  expect(action).toEqual({
    type: actionTypes.LOGIN
  });
});

test('notifyChatUsers generates correct action object with undefined submission id', () => {
  const action = notifyChatUsers(1, undefined);

  expect(action).toEqual({
    type: actionTypes.NOTIFY_CHATKIT_USERS,
    payload: {
      assessmentId: 1,
      submissionId: undefined
    }
  });
});

test('notifyChatUsers generates correct action object with undefined assessment id', () => {
  const action = notifyChatUsers(undefined, 1);

  expect(action).toEqual({
    type: actionTypes.NOTIFY_CHATKIT_USERS,
    payload: {
      assessmentId: undefined,
      submissionId: 1
    }
  });
});

test('setTokens generates correct action object', () => {
  const accessToken = 'access-token-test';
  const refreshToken = 'refresh-token-test';
  const action = setTokens({ accessToken, refreshToken });
  expect(action).toEqual({
    type: actionTypes.SET_TOKENS,
    payload: {
      accessToken,
      refreshToken
    }
  });
});

test('setUser generates correct action object', () => {
  const user = {
    name: 'test student',
    role: 'student' as Role,
    grade: 150,
    story: {} as Story,
    gameState: {} as GameState
  };
  const action = setUser(user);
  expect(action).toEqual({
    type: actionTypes.SET_USER,
    payload: user
  });
});

test('submitAnswer generates correct action object', () => {
  const id = 3;
  const answer = 'test-answer-here';
  const action = submitAnswer(id, answer);
  expect(action).toEqual({
    type: actionTypes.SUBMIT_ANSWER,
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
    type: actionTypes.SUBMIT_ASSESSMENT,
    payload: id
  });
});

test('submitGrading generates correct action object with default values', () => {
  const submissionId = 8;
  const questionId = 2;

  const action = submitGrading(submissionId, questionId);
  expect(action).toEqual({
    type: actionTypes.SUBMIT_GRADING,
    payload: {
      submissionId,
      questionId,
      gradeAdjustment: 0,
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
    type: actionTypes.SUBMIT_GRADING_AND_CONTINUE,
    payload: {
      submissionId,
      questionId,
      gradeAdjustment: 0,
      xpAdjustment: 0,
      comments: undefined
    }
  });
});

test('submitGrading generates correct action object', () => {
  const submissionId = 10;
  const questionId = 3;
  const gradeAdjustment = 10;
  const xpAdjustment = 100;
  const comments = 'my comment';
  const action = submitGrading(submissionId, questionId, gradeAdjustment, xpAdjustment, comments);
  expect(action).toEqual({
    type: actionTypes.SUBMIT_GRADING,
    payload: {
      submissionId,
      questionId,
      gradeAdjustment,
      xpAdjustment,
      comments
    }
  });
});

test('submitGradingAndContinue generates correct action object', () => {
  const submissionId = 4;
  const questionId = 7;
  const gradeAdjustment = 90;
  const xpAdjustment = 55;
  const comments = 'another comment';
  const action = submitGradingAndContinue(
    submissionId,
    questionId,
    gradeAdjustment,
    xpAdjustment,
    comments
  );
  expect(action).toEqual({
    type: actionTypes.SUBMIT_GRADING_AND_CONTINUE,
    payload: {
      submissionId,
      questionId,
      gradeAdjustment,
      xpAdjustment,
      comments
    }
  });
});

test('unsubmitSubmission generates correct action object', () => {
  const submissionId = 10;
  const action = unsubmitSubmission(submissionId);
  expect(action).toEqual({
    type: actionTypes.UNSUBMIT_SUBMISSION,
    payload: {
      submissionId
    }
  });
});

test('updateHistoryHelpers generates correct action object', () => {
  const loc = 'location';
  const action = updateHistoryHelpers(loc);
  expect(action).toEqual({
    type: actionTypes.UPDATE_HISTORY_HELPERS,
    payload: loc
  });
});

test('updateAssessmentOverviews generates correct action object', () => {
  const overviews: IAssessmentOverview[] = [
    {
      category: 'Mission',
      closeAt: 'test_string',
      coverImage: 'test_string',
      grade: 0,
      id: 0,
      maxGrade: 0,
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
    type: actionTypes.UPDATE_ASSESSMENT_OVERVIEWS,
    payload: overviews
  });
});

test('updateAssessment generates correct action object', () => {
  const assessment: IAssessment = {
    category: 'Mission',
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
    type: actionTypes.UPDATE_ASSESSMENT,
    payload: assessment
  });
});

test('updateGradingOverviews generates correct action object', () => {
  const overviews: GradingOverview[] = [
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
      questionCount: 6,
      gradedCount: 0
    }
  ];

  const action = updateGradingOverviews(overviews);
  expect(action).toEqual({
    type: actionTypes.UPDATE_GRADING_OVERVIEWS,
    payload: overviews
  });
});

test('updateGrading generates correct action object', () => {
  const submissionId = 3;
  const grading: Grading = [
    {
      question: jest.genMockFromModule('../../components/academy/grading/gradingShape'),
      student: {
        name: 'test student',
        id: 234
      },
      grade: {
        roomId: 'test roomId',
        grade: 10,
        gradeAdjustment: 0,
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
    type: actionTypes.UPDATE_GRADING,
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
    type: actionTypes.UPDATE_NOTIFICATIONS,
    payload: notifications
  });
});
