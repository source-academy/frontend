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
import { Notification } from '../../components/notification/notificationShape';
import {
  mockAssessmentOverviews,
  mockAssessmentQuestions,
  mockAssessments
} from '../../mocks/assessmentAPI';
import { mockNotifications } from '../../mocks/userAPI';
import { Role, Story } from '../../reducers/states';
import { showSuccessMessage, showWarningMessage } from '../../utils/notification';
import backendSaga from '../backend';
import {
  getAssessment,
  getAssessmentOverviews,
  getNotifications,
  getUser,
  postAcknowledgeNotifications,
  postAnswer,
  postAssessment,
  postAuth,
  postNotify
} from '../requests';

// ----------------------------------------
// Constants to use for testing

const mockAssessment: IAssessment = mockAssessments[0];

const mockMapAssessments = new Map<number, IAssessment>(mockAssessments.map(a => [a.id, a]));

const mockAssessmentQuestion = mockAssessmentQuestions[0];

const mockTokens = { accessToken: 'access', refreshToken: 'refresherOrb' };

// mock states here starts as student
const mockStates = {
  session: {
    accessToken: 'access',
    assessmentOverviews: mockAssessmentOverviews,
    assessments: mockMapAssessments,
    notifications: mockNotifications,
    refreshToken: 'refresherOrb',
    role: Role.Student
  },
  workspaces: {
    assessment: { currentAssessment: mockAssessment.id }
  }
};

const okResp = { ok: true };
const errorResp = { ok: false };
// ----------------------------------------

describe('Test FETCH_AUTH Action', () => {
  test('when tokens and user obtained', () => {
    const luminusCode = 'luminusCode';
    const user = {
      name: 'user',
      role: 'student' as Role,
      story: {} as Story,
      grade: 1
    };
    return expectSaga(backendSaga)
      .call(postAuth, luminusCode)
      .call(getUser, mockTokens)
      .put(actions.setTokens(mockTokens))
      .put(actions.setUser(user))
      .provide([[call(postAuth, luminusCode), mockTokens], [call(getUser, mockTokens), user]])
      .dispatch({ type: actionTypes.FETCH_AUTH, payload: luminusCode })
      .silentRun();
  });

  test('when tokens is null', () => {
    const luminusCode = 'luminusCode';
    const user = {
      name: 'user',
      role: 'student' as Role,
      story: {} as Story,
      grade: 1
    };
    return expectSaga(backendSaga)
      .provide([[call(postAuth, luminusCode), null], [call(getUser, mockTokens), user]])
      .call(postAuth, luminusCode)
      .not.call.fn(getUser)
      .not.put.actionType(actionTypes.SET_TOKENS)
      .not.put.actionType(actionTypes.SET_USER)
      .dispatch({ type: actionTypes.FETCH_AUTH, payload: luminusCode })
      .silentRun();
  });

  test('when user is null', () => {
    const luminusCode = 'luminusCode';
    const nullUser = null;
    return expectSaga(backendSaga)
      .provide([[call(postAuth, luminusCode), mockTokens], [call(getUser, mockTokens), nullUser]])
      .call(postAuth, luminusCode)
      .call(getUser, mockTokens)
      .not.put.actionType(actionTypes.SET_TOKENS)
      .not.put.actionType(actionTypes.SET_USER)
      .dispatch({ type: actionTypes.FETCH_AUTH, payload: luminusCode })
      .silentRun();
  });
});

describe('Test FETCH_ASSESSMENT_OVERVIEWS Action', () => {
  test('when assesments is obtained', () => {
    return expectSaga(backendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getAssessmentOverviews, mockTokens), mockAssessmentOverviews]])
      .put(actions.updateAssessmentOverviews(mockAssessmentOverviews))
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: actionTypes.FETCH_ASSESSMENT_OVERVIEWS })
      .silentRun();
  });

  test('when assessments overviews is null', () => {
    const ret = null;
    return expectSaga(backendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getAssessmentOverviews, mockTokens), ret]])
      .call(getAssessmentOverviews, mockTokens)
      .not.put.actionType(actionTypes.UPDATE_ASSESSMENT_OVERVIEWS)
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: actionTypes.FETCH_ASSESSMENT_OVERVIEWS })
      .silentRun();
  });
});

describe('Test FETCH_ASSESSMENT Action', () => {
  test('when assesment is obtained', () => {
    const mockId = mockAssessment.id;
    return expectSaga(backendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getAssessment, mockId, mockTokens), mockAssessment]])
      .put(actions.updateAssessment(mockAssessment))
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: actionTypes.FETCH_ASSESSMENT, payload: mockId })
      .silentRun();
  });

  test('when assesment is null', () => {
    const mockId = mockAssessment.id;
    return expectSaga(backendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getAssessment, mockId, mockTokens), null]])
      .call(getAssessment, mockId, mockTokens)
      .not.put.actionType(actionTypes.UPDATE_ASSESSMENT)
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: actionTypes.FETCH_ASSESSMENT, payload: mockId })
      .silentRun();
  });
});

describe('Test SUBMIT_ANSWER Action', () => {
  test('when response is ok', () => {
    const mockAnsweredAssessmentQuestion = { ...mockAssessmentQuestion, answer: '42' };
    const mockNewQuestions = mockAssessment.questions.slice().map((question: IQuestion) => {
      if (question.id === mockAnsweredAssessmentQuestion.id) {
        return { ...question, answer: mockAnsweredAssessmentQuestion.answer };
      }
      return question;
    });
    const mockNewAssessment = {
      ...mockAssessment,
      questions: mockNewQuestions
    };
    expectSaga(backendSaga)
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
      .not.call.fn(showWarningMessage)
      .call(showSuccessMessage, 'Saved!', 1000)
      .put(actions.updateAssessment(mockNewAssessment))
      .put(actions.updateHasUnsavedChanges('assessment' as WorkspaceLocation, false))
      .dispatch({ type: actionTypes.SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
    // To make sure no changes in state
    return expect(
      mockStates.session.assessments.get(mockNewAssessment.id)!.questions[0].answer
    ).toEqual(null);
  });

  test('when role is not student', () => {
    const mockAnsweredAssessmentQuestion = { ...mockAssessmentQuestion, answer: '42' };
    return expectSaga(backendSaga)
      .withState({ session: { role: Role.Staff } })
      .call(showWarningMessage, 'Answer rejected - only students can submit answers.')
      .not.call.fn(postAnswer)
      .not.put.actionType(actionTypes.UPDATE_ASSESSMENT)
      .not.put.actionType(actionTypes.UPDATE_HAS_UNSAVED_CHANGES)
      .hasFinalState({ session: { role: Role.Staff } })
      .dispatch({ type: actionTypes.SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
  });

  test('when response is null', () => {
    const mockAnsweredAssessmentQuestion = { ...mockAssessmentQuestion, answer: '42' };
    return expectSaga(backendSaga)
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
      .not.put.actionType(actionTypes.UPDATE_ASSESSMENT)
      .not.put.actionType(actionTypes.UPDATE_HAS_UNSAVED_CHANGES)
      .hasFinalState({ session: { ...mockTokens, role: Role.Student } })
      .dispatch({ type: actionTypes.SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
  });

  test('when response has HTTP status code 403 (Forbidden)', () => {
    const mockAnsweredAssessmentQuestion = { ...mockAssessmentQuestion, answer: '42' };
    return expectSaga(backendSaga)
      .withState({ session: { ...mockTokens, role: Role.Student } })
      .provide([
        [
          call(
            postAnswer,
            mockAnsweredAssessmentQuestion.id,
            mockAnsweredAssessmentQuestion.answer,
            mockTokens
          ),
          { ...errorResp, status: 403 }
        ]
      ])
      .call(showWarningMessage, 'Answer rejected - assessment not open or already finalised.')
      .not.call.fn(showSuccessMessage)
      .not.put.actionType(actionTypes.UPDATE_ASSESSMENT)
      .not.put.actionType(actionTypes.UPDATE_HAS_UNSAVED_CHANGES)
      .hasFinalState({ session: { ...mockTokens, role: Role.Student } })
      .dispatch({ type: actionTypes.SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
  });
});

describe('Test SUBMIT_ASSESSMENT Action', () => {
  test('when response is ok', () => {
    const mockAssessmentId = mockAssessment.id;
    const mockNewOverviews = mockAssessmentOverviews.map(overview => {
      if (overview.id === mockAssessmentId) {
        return { ...overview, status: AssessmentStatuses.submitted };
      }
      return overview;
    });
    expectSaga(backendSaga)
      .withState(mockStates)
      .provide([[call(postAssessment, mockAssessmentId, mockTokens), okResp]])
      .not.call(showWarningMessage)
      .call(showSuccessMessage, 'Submitted!', 2000)
      .put(actions.updateAssessmentOverviews(mockNewOverviews))
      .dispatch({ type: actionTypes.SUBMIT_ASSESSMENT, payload: mockAssessmentId })
      .silentRun();
    expect(mockStates.session.assessmentOverviews[0].id).toEqual(mockAssessmentId);
    return expect(mockStates.session.assessmentOverviews[0].status).not.toEqual(
      AssessmentStatuses.submitted
    );
  });

  test('when response has HTTP status code 403 (Forbidden)', () => {
    return expectSaga(backendSaga)
      .withState({ session: { ...mockTokens, role: Role.Student } })
      .provide([[call(postAssessment, 0, mockTokens), { ...errorResp, status: 403 }]])
      .call(postAssessment, 0, mockTokens)
      .call(
        showWarningMessage,
        'Not allowed to finalise - assessment not open or already finalised.'
      )
      .not.put.actionType(actionTypes.UPDATE_ASSESSMENT_OVERVIEWS)
      .hasFinalState({ session: { ...mockTokens, role: Role.Student } })
      .dispatch({ type: actionTypes.SUBMIT_ASSESSMENT, payload: 0 })
      .silentRun();
  });

  test('when response is null', () => {
    return expectSaga(backendSaga)
      .withState({ session: { ...mockTokens, role: Role.Student } })
      .provide([[call(postAssessment, 0, mockTokens), null]])
      .call(postAssessment, 0, mockTokens)
      .call(showWarningMessage, "Couldn't reach our servers. Are you online?")
      .not.put.actionType(actionTypes.UPDATE_ASSESSMENT_OVERVIEWS)
      .hasFinalState({ session: { ...mockTokens, role: Role.Student } })
      .dispatch({ type: actionTypes.SUBMIT_ASSESSMENT, payload: 0 })
      .silentRun();
  });

  test('when role is not a student', () => {
    return expectSaga(backendSaga)
      .withState({ session: { role: Role.Staff } })
      .call(showWarningMessage, 'Submission rejected - only students can submit assessments.')
      .not.call.fn(postAssessment)
      .not.put.actionType(actionTypes.UPDATE_ASSESSMENT_OVERVIEWS)
      .hasFinalState({ session: { role: Role.Staff } })
      .dispatch({ type: actionTypes.SUBMIT_ASSESSMENT, payload: 0 })
      .silentRun();
  });
});

describe('Test FETCH_NOTIFICATIONS Action', () => {
  test('when notifications obtained', () => {
    return expectSaga(backendSaga)
      .withState(mockStates)
      .provide([[call(getNotifications, mockTokens), mockNotifications]])
      .put(actions.updateNotifications(mockNotifications))
      .dispatch({ type: actionTypes.FETCH_NOTIFICATIONS })
      .silentRun();
  });
});

describe('Test ACKNOWLEDGE_NOTIFICATIONS Action', () => {
  test('when response is ok', () => {
    const ids = [1, 2, 3];
    const mockNewNotifications = mockNotifications.filter(n => !ids.includes(n.id));
    return expectSaga(backendSaga)
      .withState(mockStates)
      .provide([[call(postAcknowledgeNotifications, mockTokens, ids), okResp]])
      .not.call(showWarningMessage)
      .put(actions.updateNotifications(mockNewNotifications))
      .dispatch({
        type: actionTypes.ACKNOWLEDGE_NOTIFICATIONS,
        payload: {
          withFilter: (notifications: Notification[]) =>
            notifications.filter(notification => ids.includes(notification.id))
        }
      })
      .silentRun();
  });

  test('when response has HTTP status code 404 (Not Found)', () => {
    const ids = mockNotifications.map(n => n.id);
    return expectSaga(backendSaga)
      .withState(mockStates)
      .provide([
        [call(postAcknowledgeNotifications, mockTokens, ids), { ...errorResp, status: 404 }]
      ])
      .call(showWarningMessage, 'Something went wrong (got 404 response)')
      .dispatch({ type: actionTypes.ACKNOWLEDGE_NOTIFICATIONS, payload: {} })
      .silentRun();
  });
});

describe('Test NOTIFY_CHATKIT_USERS Action', () => {
  test('called', () => {
    return expectSaga(backendSaga)
      .withState(mockStates)
      .call(postNotify, mockTokens, 1, undefined)
      .dispatch({ type: actionTypes.NOTIFY_CHATKIT_USERS, payload: { assessmentId: 1 } })
      .silentRun();
  });
});
