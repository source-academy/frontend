import { Grading, GradingOverview } from '../../components/academy/grading/gradingShape';
import { IAssessment, IAssessmentOverview } from '../../components/assessment/assessmentShape';
import * as actionTypes from '../actionTypes';
import {
  fetchAnnouncements,
  fetchAssessment,
  fetchAssessmentOverviews,
  fetchAuth,
  fetchGrading,
  fetchGradingOverviews,
  login,
  setTokens,
  setUser,
  submitAnswer,
  submitAssessment,
  submitGrading,
  updateAssessment,
  updateAssessmentOverviews,
  updateGrading,
  updateGradingOverviews,
  updateHistoryHelpers
} from '../session';

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

test('login action generates correct action object', () => {
  const action = login();
  expect(action).toEqual({
    type: actionTypes.LOGIN
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
    role: 'student',
    grade: 150,
    story: {}
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
  const comment = 'test comment here';

  const action = submitGrading(submissionId, questionId, comment);
  expect(action).toEqual({
    type: actionTypes.SUBMIT_GRADING,
    payload: {
      submissionId,
      questionId,
      comment,
      gradeAdjustment: 0,
      xpAdjustment: 0
    }
  });
});

test('submitGrading generates correct action object', () => {
  const submissionId = 10;
  const questionId = 3;
  const comment = 'another test comment here';
  const gradeAdjustment = 10;
  const xpAdjustment = 100;
  const action = submitGrading(submissionId, questionId, comment, gradeAdjustment, xpAdjustment);
  expect(action).toEqual({
    type: actionTypes.SUBMIT_GRADING,
    payload: {
      submissionId,
      questionId,
      comment,
      gradeAdjustment,
      xpAdjustment
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
      groupName: 'group'
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
        comment: 'test comment',
        grade: 10,
        gradeAdjustment: 0,
        xp: 100,
        xpAdjustment: 0
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
