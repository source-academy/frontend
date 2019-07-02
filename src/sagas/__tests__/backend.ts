import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';

import * as actions from '../../actions';
import * as actionTypes from '../../actions/actionTypes';
import { WorkspaceLocation } from '../../actions/workspaces';
import {
  AssessmentStatuses,
  IAssessment,
  IQuestion
} from '../../components/assessment/assessmentShape';
import {
  mockAssessmentOverviews,
  mockAssessmentQuestions,
  mockAssessments
} from '../../mocks/assessmentAPI';
import { defaultState, IState, Role } from '../../reducers/states';
import { showSuccessMessage, showWarningMessage } from '../../utils/notification';
import backendSaga, {
  getAssessment,
  getAssessmentOverviews,
  getUser,
  postAnswer,
  postAssessment,
  postAuth
} from '../backend';

// ----------------------------------------
// Constants to use for testing

const mockAssessment: IAssessment = mockAssessments[0];

const mockMapAssessments = new Map<number, IAssessment>(mockAssessments.map(a => [a.id, a]));

const mockAssessmentQuestion = mockAssessmentQuestions[0];

const mockTokens = { accessToken: 'access', refreshToken: 'refresherOrb' };

// mock states here starts as student
const mockStates: IState = {
  ...defaultState,
  session: {
    ...defaultState.session,
    accessToken: 'access',
    assessmentOverviews: mockAssessmentOverviews,
    assessments: mockMapAssessments,
    refreshToken: 'refresherOrb',
    role: Role.Student
  },
  workspaces: {
    ...defaultState.workspaces,
    assessment: { ...defaultState.workspaces.assessment, currentAssessment: 0 }
  }
};

const okResp = { ok: true };
const errorResp = { ok: false };
// ----------------------------------------

describe('backendSaga receives an action with type FETCH_AUTH', () => {
  test('Saga runs as intended', () => {
    const luminousCode = 'luminousCode';
    const user = mockTokens ? 'user' : null;
    return (
      expectSaga(backendSaga)
        // .put(actions.setTokens(mockTokens))
        // .put(actions.setUser(user))
        .provide([[call(postAuth, luminousCode), mockTokens], [call(getUser, mockTokens), user]])
        .dispatch({ type: actionTypes.FETCH_AUTH, payload: luminousCode })
        .silentRun()
    );
  });
});

describe('backendSaga receives an action with type FETCH_ASSESSMENT_OVERVIEWS', () => {
  test('Saga runs as intended', () => {
    return expectSaga(backendSaga)
      .withState(mockStates)
      .provide([[call(getAssessmentOverviews, mockTokens), mockAssessmentOverviews]])
      .put(actions.updateAssessmentOverviews(mockAssessmentOverviews))
      .dispatch({ type: actionTypes.FETCH_ASSESSMENT_OVERVIEWS })
      .silentRun();
  });

  test('Fetch assessmentOverview returns null, no changes to state', () => {
    return expectSaga(backendSaga)
      .withState(mockStates)
      .provide([[call(getAssessmentOverviews, mockTokens), null]])
      .hasFinalState(mockStates)
      .dispatch({ type: actionTypes.FETCH_ASSESSMENT_OVERVIEWS })
      .silentRun();
  });
});

describe('backendSaga receives an action with type FETCH_ASSESSMENT', () => {
  test('Saga runs as intended', () => {
    const mockId = 0;
    return expectSaga(backendSaga)
      .withState(mockStates)
      .provide([[call(getAssessment, mockId, mockTokens), mockAssessment]])
      .put(actions.updateAssessment(mockAssessment))
      .dispatch({ type: actionTypes.FETCH_ASSESSMENT, payload: mockId })
      .silentRun();
  });

  test('Fetch assignment returns null, no changes to state', () => {
    const mockId = 0;
    return expectSaga(backendSaga)
      .withState(mockStates)
      .provide([[call(getAssessment, mockId, mockTokens), null]])
      .hasFinalState(mockStates)
      .dispatch({ type: actionTypes.FETCH_ASSESSMENT, payload: mockId })
      .silentRun();
  });
});

describe('backendSaga receives an action with type SUBMIT_ANSER', () => {
  test('Saga runs as intended', () => {
    const mockAnsweredAssessmentQuestion = { ...mockAssessmentQuestion, answer: '42' };
    const mockNewQuestions = mockAssessment.questions.slice().map((question: IQuestion) => {
      if (question.id === mockAnsweredAssessmentQuestion.id) {
        question.answer = mockAnsweredAssessmentQuestion.answer;
      }
      return question;
    });
    const mockNewAssessment = {
      ...mockAssessment,
      questions: mockNewQuestions
    };
    return expectSaga(backendSaga)
      .withState(mockStates)
      .provide([
        [
          call(
            postAnswer,
            mockAnsweredAssessmentQuestion.id,
            mockAnsweredAssessmentQuestion.answer,
            mockTokens
          ),
          okResp
        ]
      ])
      .put(actions.updateAssessment(mockNewAssessment))
      .put(actions.updateHasUnsavedChanges('assessment' as WorkspaceLocation, false))
      .dispatch({ type: actionTypes.SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
  });
  test('Not a student', () => {
    const mockStatesStaff: IState = {
      ...mockStates,
      session: { ...mockStates.session, role: Role.Staff }
    };
    const mockAnsweredAssessmentQuestion = { ...mockAssessmentQuestion, answer: '42' };
    return expectSaga(backendSaga)
      .withState(mockStatesStaff)
      .call(showWarningMessage, 'Only students can submit answers.')
      .hasFinalState(mockStatesStaff)
      .dispatch({ type: actionTypes.SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
  });
  test('null response', () => {
    const mockAnsweredAssessmentQuestion = { ...mockAssessmentQuestion, answer: '42' };
    return expectSaga(backendSaga)
      .withState(mockStates)
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
      .call(showWarningMessage, "Couldn't reach our servers. Are you online?")
      .hasFinalState(mockStates)
      .dispatch({ type: actionTypes.SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
  });
  test('error response', () => {
    const mockAnsweredAssessmentQuestion = { ...mockAssessmentQuestion, answer: '42' };
    return expectSaga(backendSaga)
      .withState(mockStates)
      .provide([
        [
          call(
            postAnswer,
            mockAnsweredAssessmentQuestion.id,
            mockAnsweredAssessmentQuestion.answer,
            mockTokens
          ),
          errorResp
        ]
      ])
      .hasFinalState(mockStates)
      .dispatch({ type: actionTypes.SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
  });
});

describe('backendSaga receives an action with type SUBMIT_ASSESSMENT', () => {
  test('Saga runs as intended', () => {
    const mockAssessmentId = 0;
    const mockNewOverviews = mockAssessmentOverviews.map(overview => {
      if (overview.id === mockAssessmentId) {
        return { ...overview, status: AssessmentStatuses.submitted };
      }
      return overview;
    });
    return expectSaga(backendSaga)
      .withState(mockStates)
      .provide([[call(postAssessment, mockAssessmentId, mockTokens), okResp]])
      .call(showSuccessMessage, 'Submitted!', 2000)
      .put(actions.updateAssessmentOverviews(mockNewOverviews))
      .dispatch({ type: actionTypes.SUBMIT_ASSESSMENT, payload: mockAssessmentId })
      .silentRun();
  });
  test('Cannot reach server', () => {
    return expectSaga(backendSaga)
      .withState(mockStates)
      .provide([[call(postAssessment, 0, mockTokens), null]])
      .call(showWarningMessage, 'Something went wrong. Please try again.')
      .hasFinalState(mockStates)
      .dispatch({ type: actionTypes.SUBMIT_ASSESSMENT, payload: 0 })
      .silentRun();
  });
  test('Not a student', () => {
    const mockStatesStaff: IState = {
      ...mockStates,
      session: { ...mockStates.session, role: Role.Staff }
    };
    return expectSaga(backendSaga)
      .withState(mockStatesStaff)
      .call(showWarningMessage, 'Only students can submit assessments.')
      .hasFinalState(mockStatesStaff)
      .dispatch({ type: actionTypes.SUBMIT_ASSESSMENT, payload: 0 })
      .silentRun();
  });
});
