import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { call } from 'redux-saga/effects';

import * as actions from '../../actions';
import * as actionTypes from '../../actions/actionTypes';
import { WorkspaceLocation } from '../../actions/workspaces';
import {
  Grading,
  GradingOverview,
  GradingQuestion
} from '../../components/academy/grading/gradingShape';
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
import { mockGrading, mockGradingOverviews } from '../../mocks/gradingAPI';
import { mockNotifications } from '../../mocks/userAPI';
import { defaultSession, defaultState, IState, Role, Story } from '../../reducers/states';
import { showSuccessMessage, showWarningMessage } from '../../utils/notification';
import backendSaga from '../backend';
import {
  getAssessment,
  getAssessmentOverviews,
  getGrading,
  getGradingOverviews,
  getNotifications,
  getUser,
  postAcknowledgeNotifications,
  postAnswer,
  postAssessment,
  postAuth,
  postGrading,
  postNotify,
  postUnsubmit
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
    gradingOverviews: mockGradingOverviews,
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

describe('Backend Sagas tests', () => {
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
    test('when respond is ok', () => {
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
        .call(showWarningMessage, 'Only students can submit answers.')
        .not.call.fn(postAnswer)
        .not.put.actionType(actionTypes.UPDATE_ASSESSMENT)
        .not.put.actionType(actionTypes.UPDATE_HAS_UNSAVED_CHANGES)
        .hasFinalState({ session: { role: Role.Staff } })
        .dispatch({ type: actionTypes.SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
        .silentRun();
    });

    test('when respond is null', () => {
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

    test('when respond is error', () => {
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
            errorResp
          ]
        ])
        .call.fn(showWarningMessage)
        .not.call.fn(showSuccessMessage)
        .not.put.actionType(actionTypes.UPDATE_ASSESSMENT)
        .not.put.actionType(actionTypes.UPDATE_HAS_UNSAVED_CHANGES)
        .hasFinalState({ session: { ...mockTokens, role: Role.Student } })
        .dispatch({ type: actionTypes.SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
        .silentRun();
    });
  });

  describe('Test SUBMIT_ASSESSMENT Action', () => {
    test('when respond is ok', () => {
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

    test('when respond is error', () => {
      return expectSaga(backendSaga)
        .withState({ session: { ...mockTokens, role: Role.Student } })
        .provide([[call(postAssessment, 0, mockTokens), errorResp]])
        .call(postAssessment, 0, mockTokens)
        .call(showWarningMessage, 'Something went wrong. Please try again.')
        .not.put.actionType(actionTypes.UPDATE_ASSESSMENT_OVERVIEWS)
        .hasFinalState({ session: { ...mockTokens, role: Role.Student } })
        .dispatch({ type: actionTypes.SUBMIT_ASSESSMENT, payload: 0 })
        .silentRun();
    });

    test('when respond is null', () => {
      return expectSaga(backendSaga)
        .withState({ session: { ...mockTokens, role: Role.Student } })
        .provide([[call(postAssessment, 0, mockTokens), null]])
        .call(postAssessment, 0, mockTokens)
        .call(showWarningMessage, 'Something went wrong. Please try again.')
        .not.put.actionType(actionTypes.UPDATE_ASSESSMENT_OVERVIEWS)
        .hasFinalState({ session: { ...mockTokens, role: Role.Student } })
        .dispatch({ type: actionTypes.SUBMIT_ASSESSMENT, payload: 0 })
        .silentRun();
    });

    test('when role is not a student', () => {
      return expectSaga(backendSaga)
        .withState({ session: { role: Role.Staff } })
        .call(showWarningMessage, 'Only students can submit assessments.')
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
    test('when respond is ok', () => {
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

    test('when respond is error', () => {
      const ids = mockNotifications.map(n => n.id);
      return expectSaga(backendSaga)
        .withState(mockStates)
        .provide([[call(postAcknowledgeNotifications, mockTokens, ids), errorResp]])
        .call(showWarningMessage, "Something went wrong, couldn't acknowledge")
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

  describe('Response to FETCH_GRADING_OVERVIEWS', () => {
    test('puts updateGradingOverview with a dummy overview', () => {
      return expectSaga(backendSaga)
        .withState({ session: mockTokens })
        .provide([[matchers.call.fn(getGradingOverviews), mockGradingOverviews]])
        .put(actions.updateGradingOverviews(mockGradingOverviews))
        .dispatch({
          type: actionTypes.FETCH_GRADING_OVERVIEWS,
          payload: true
        })
        .silentRun();
    });

    test('does not put updateGradingOverviews when there is none.', () => {
      return expectSaga(backendSaga)
        .withState(defaultState)
        .provide([[matchers.call.fn(getGradingOverviews), null]])
        .dispatch({
          type: actionTypes.FETCH_GRADING_OVERVIEWS,
          payload: true
        })
        .silentRun()
        .then(({ effects }: any) => {
          expect(effects.put).toBeUndefined();
        });
    });
  });

  describe('Response to FETCH_GRADING', () => {
    test('puts updateGrading with a dummy grading', () => {
      return expectSaga(backendSaga)
        .withState(defaultState)
        .provide([[matchers.call.fn(getGrading), mockGrading]])
        .put(actions.updateGrading(42, mockGrading))
        .dispatch({
          type: actionTypes.FETCH_GRADING,
          payload: 42
        })
        .silentRun();
    });

    test('does not put updateGrading when there is none.', () => {
      return expectSaga(backendSaga)
        .withState(defaultState)
        .provide([[matchers.call.fn(getGrading), null]])
        .dispatch({
          type: actionTypes.FETCH_GRADING,
          payload: 42
        })
        .silentRun()
        .then(({ effects }: any) => {
          expect(effects.put).toBeUndefined();
        });
    });
  });

  describe('Response to UNSUBMIT_SUBMISSION', () => {
    const mockSubmissionId: number = 1;
    const unsubmittedOverviews: GradingOverview[] = mockGradingOverviews.map(overview => {
      if (overview.submissionId === mockSubmissionId) {
        return { ...overview, submissionStatus: 'attempted' };
      }
      return overview;
    });

    test('for appropriate response to a successful unsubmit', () => {
      return expectSaga(backendSaga)
        .withState(mockStates)
        .provide([[call(postUnsubmit, mockSubmissionId, mockTokens), okResp]])
        .call(showSuccessMessage, 'Unsubmit successful', 1000)
        .put(actions.updateGradingOverviews(unsubmittedOverviews))
        .dispatch({
          type: actionTypes.UNSUBMIT_SUBMISSION,
          payload: {
            submissionId: mockSubmissionId
          }
        })
        .silentRun();
    });

    describe('Unsuccessful unsubmits', () => {
      test('Server connection failed response', () => {
        return expectSaga(backendSaga)
          .withState(mockStates)
          .provide([[call(postUnsubmit, mockSubmissionId, mockTokens), null]])
          .call(showWarningMessage, "Couldn't reach our servers. Are you online?")
          .not.put(actions.updateGradingOverviews(unsubmittedOverviews))
          .not.call(showSuccessMessage, 'Unsubmit successful', 1000)
          .dispatch({
            type: actionTypes.UNSUBMIT_SUBMISSION,
            payload: {
              submissionId: mockSubmissionId
            }
          })
          .silentRun();
      });

      test('401 session expiry response', () => {
        return expectSaga(backendSaga)
          .withState(mockStates)
          .provide([
            [
              matchers.call.fn(postUnsubmit),
              {
                ok: false,
                status: 401
              }
            ]
          ])
          .call(showWarningMessage, 'Session expired. Please login again.')
          .not.put(actions.updateGradingOverviews(unsubmittedOverviews))
          .not.call(showSuccessMessage, 'Unsubmit successful', 1000)
          .dispatch({
            type: actionTypes.UNSUBMIT_SUBMISSION,
            payload: {
              submissionId: 0
            }
          })
          .silentRun();
      });

      test('Other error responses', () => {
        return expectSaga(backendSaga)
          .withState(mockStates)
          .provide([
            [
              matchers.call.fn(postUnsubmit),
              {
                ok: false,
                status: 42,
                statusText: 'Servers exploded'
              }
            ]
          ])
          .call(showWarningMessage, 'Error 42: Servers exploded')
          .not.put(actions.updateGradingOverviews(unsubmittedOverviews))
          .not.call(showSuccessMessage, 'Unsubmit successful', 1000)
          .dispatch({
            type: actionTypes.UNSUBMIT_SUBMISSION,
            payload: {
              submissionId: 0
            }
          })
          .silentRun();
      });
    });
  });

  describe('Response to SUBMIT_GRADING', () => {
    const mockStateStaff: IState = {
      ...defaultState,
      session: {
        ...defaultSession,
        accessToken: 'access',
        refreshToken: 'refresherOrb',
        role: Role.Staff
      }
    };
    const mockSubmissionId: number = 0;
    const mockQuestionId: number = 0;
    const mockGradeAdjustment: number = 42;
    const mockXpAdjustment: number = 42;
    const mockComment: string = 'Stop using global variables!';
    mockStateStaff.session.gradings.set(mockSubmissionId, mockGrading);

    const newGrading: Grading = mockGrading.slice().map((gradingQuestion: GradingQuestion) => {
      if (gradingQuestion.question.id === mockQuestionId) {
        gradingQuestion.grade = {
          gradeAdjustment: mockGradeAdjustment,
          xpAdjustment: mockXpAdjustment,
          roomId: mockComment,
          grade: gradingQuestion.grade.grade,
          xp: gradingQuestion.grade.xp,
          comments: mockComment
        };
      }
      return gradingQuestion;
    });

    test('for appropriate response to successful grading', () => {
      return expectSaga(backendSaga)
        .withState(mockStateStaff)
        .provide([
          [
            call(
              postGrading,
              mockSubmissionId,
              mockQuestionId,
              mockGradeAdjustment,
              mockXpAdjustment,
              mockTokens,
              mockComment
            ),
            okResp
          ]
        ])
        .call(
          postGrading,
          mockSubmissionId,
          mockQuestionId,
          mockGradeAdjustment,
          mockXpAdjustment,
          mockTokens,
          mockComment
        )
        .call(showSuccessMessage, 'Submitted!', 1000)
        .put(actions.updateGrading(mockSubmissionId, newGrading))
        .dispatch({
          type: actionTypes.SUBMIT_GRADING,
          payload: {
            submissionId: mockSubmissionId,
            questionId: mockQuestionId,
            gradeAdjustment: mockGradeAdjustment,
            xpAdjustment: mockXpAdjustment,
            comments: mockComment
          }
        })
        .silentRun();
    });

    describe('Unsucessful grading', () => {
      test('User is student error response', () => {
        return expectSaga(backendSaga)
          .withState(mockStates)
          .call(showWarningMessage, 'Only staff can submit answers.')
          .not.call(showSuccessMessage, 'Submitted!', 1000)
          .not.put(actions.updateGrading(mockSubmissionId, newGrading))
          .dispatch({
            type: actionTypes.SUBMIT_GRADING,
            payload: {
              submissionId: mockSubmissionId,
              questionId: mockQuestionId,
              gradeAdjustment: mockGradeAdjustment,
              xpAdjustment: mockXpAdjustment,
              comments: mockComment
            }
          })
          .silentRun();
      });

      test('Server connection failed response', () => {
        return expectSaga(backendSaga)
          .withState(mockStateStaff)
          .provide([
            [
              call(
                postGrading,
                mockSubmissionId,
                mockQuestionId,
                mockGradeAdjustment,
                mockXpAdjustment,
                mockTokens,
                mockComment
              ),
              null
            ]
          ])
          .call(showWarningMessage, "Couldn't reach our servers. Are you online?")
          .not.call(showSuccessMessage, 'Submitted!', 1000)
          .not.put(actions.updateGrading(mockSubmissionId, newGrading))
          .dispatch({
            type: actionTypes.SUBMIT_GRADING,
            payload: {
              submissionId: mockSubmissionId,
              questionId: mockQuestionId,
              gradeAdjustment: mockGradeAdjustment,
              xpAdjustment: mockXpAdjustment,
              comments: mockComment
            }
          })
          .silentRun();
      });

      test('401 session expiry response', () => {
        return expectSaga(backendSaga)
          .withState(mockStateStaff)
          .provide([
            [
              call(
                postGrading,
                mockSubmissionId,
                mockQuestionId,
                mockGradeAdjustment,
                mockXpAdjustment,
                mockTokens,
                mockComment
              ),
              {
                ok: false,
                status: 401
              }
            ]
          ])
          .call(showWarningMessage, 'Session expired. Please login again.')
          .not.call(showSuccessMessage, 'Submitted!', 1000)
          .not.put(actions.updateGrading(mockSubmissionId, newGrading))
          .dispatch({
            type: actionTypes.SUBMIT_GRADING,
            payload: {
              submissionId: mockSubmissionId,
              questionId: mockQuestionId,
              gradeAdjustment: mockGradeAdjustment,
              xpAdjustment: mockXpAdjustment,
              comments: mockComment
            }
          })
          .silentRun();
      });

      test('Other error responses', () => {
        return expectSaga(backendSaga)
          .withState(mockStateStaff)
          .provide([
            [
              call(
                postGrading,
                mockSubmissionId,
                mockQuestionId,
                mockGradeAdjustment,
                mockXpAdjustment,
                mockTokens,
                mockComment
              ),
              {
                ok: false,
                status: 42,
                statusText: 'Servers exploded'
              }
            ]
          ])
          .call(showWarningMessage, 'Error 42: Servers exploded')
          .not.call(showSuccessMessage, 'Saved!', 1000)
          .not.put(actions.updateGrading(mockSubmissionId, newGrading))
          .dispatch({
            type: actionTypes.SUBMIT_GRADING,
            payload: {
              submissionId: mockSubmissionId,
              questionId: mockQuestionId,
              gradeAdjustment: mockGradeAdjustment,
              xpAdjustment: mockXpAdjustment,
              comments: mockComment
            }
          })
          .silentRun();
      });
    });
  });
});
