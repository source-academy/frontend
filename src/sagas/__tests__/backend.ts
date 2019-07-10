import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import * as actions from '../../actions';
import * as actionTypes from '../../actions/actionTypes';
import {
  Grading,
  GradingOverview,
  GradingQuestion
} from '../../components/academy/grading/gradingShape';
import { mockGrading, mockGradingOverviews } from '../../mocks/gradingAPI';
import { defaultSession, defaultState, IState, Role } from '../../reducers/states';
import { showSuccessMessage, showWarningMessage } from '../../utils/notification';
import backendSaga, {
  getGrading,
  getGradingOverviews,
  postGrading,
  postUnsubmit
} from '../backend';

describe('Backend Sagas tests', () => {
  describe('Response to FETCH_GRADING_OVERVIEWS', () => {
    test('puts updateGradingOverview with a dummy overview', () => {
      return expectSaga(backendSaga)
        .withState(defaultState)
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
    const mockState: IState = {
      ...defaultState,
      session: {
        ...defaultSession,
        gradingOverviews: mockGradingOverviews
      }
    };
    const mockSubmissionId: number = 1;
    const unsubmittedOverviews: GradingOverview[] = mockGradingOverviews.map(overview => {
      if (overview.submissionId === mockSubmissionId) {
        return { ...overview, submissionStatus: 'attempted' };
      }
      return overview;
    });

    test('for appropriate response to a successful unsubmit', () => {
      return expectSaga(backendSaga)
        .withState(mockState)
        .provide([[matchers.call.fn(postUnsubmit), { ok: true }]])
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
          .withState(mockState)
          .provide([[matchers.call.fn(postUnsubmit), null]])
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
          .withState(mockState)
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
          .withState(mockState)
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
          comment: mockComment,
          grade: gradingQuestion.grade.grade,
          xp: gradingQuestion.grade.xp
        };
      }
      return gradingQuestion;
    });

    test('for appropriate response to successful grading', () => {
      return expectSaga(backendSaga)
        .withState(mockStateStaff)
        .provide([[matchers.call.fn(postGrading), { ok: true }]])
        .call(showSuccessMessage, 'Saved!', 1000)
        .put(actions.updateGrading(mockSubmissionId, newGrading))
        .dispatch({
          type: actionTypes.SUBMIT_GRADING,
          payload: {
            submissionId: mockSubmissionId,
            questionId: mockQuestionId,
            comment: mockComment,
            gradeAdjustment: mockGradeAdjustment,
            xpAdjustment: mockXpAdjustment
          }
        })
        .silentRun();
    });

    describe('Unsucessful grading', () => {
      test('User is student error response', () => {
        const mockStateStudent: IState = {
          ...defaultState,
          session: {
            ...defaultSession,
            role: Role.Student
          }
        };
        return expectSaga(backendSaga)
          .withState(mockStateStudent)
          .call(showWarningMessage, 'Only staff can submit answers.')
          .not.call(showSuccessMessage, 'Saved!', 1000)
          .not.put(actions.updateGrading(mockSubmissionId, newGrading))
          .dispatch({
            type: actionTypes.SUBMIT_GRADING,
            payload: {
              submissionId: mockSubmissionId,
              questionId: mockQuestionId,
              comment: mockComment,
              gradeAdjustment: mockGradeAdjustment,
              xpAdjustment: mockXpAdjustment
            }
          })
          .silentRun();
      });

      test('Server connection failed response', () => {
        return expectSaga(backendSaga)
          .withState(mockStateStaff)
          .provide([[matchers.call.fn(postGrading), null]])
          .call(showWarningMessage, "Couldn't reach our servers. Are you online?")
          .not.call(showSuccessMessage, 'Saved!', 1000)
          .not.put(actions.updateGrading(mockSubmissionId, newGrading))
          .dispatch({
            type: actionTypes.SUBMIT_GRADING,
            payload: {
              submissionId: mockSubmissionId,
              questionId: mockQuestionId,
              comment: mockComment,
              gradeAdjustment: mockGradeAdjustment,
              xpAdjustment: mockXpAdjustment
            }
          })
          .silentRun();
      });

      test('401 session expiry response', () => {
        return expectSaga(backendSaga)
          .withState(mockStateStaff)
          .provide([
            [
              matchers.call.fn(postGrading),
              {
                ok: false,
                status: 401
              }
            ]
          ])
          .call(showWarningMessage, 'Session expired. Please login again.')
          .not.call(showSuccessMessage, 'Saved!', 1000)
          .not.put(actions.updateGrading(mockSubmissionId, newGrading))
          .dispatch({
            type: actionTypes.SUBMIT_GRADING,
            payload: {
              submissionId: mockSubmissionId,
              questionId: mockQuestionId,
              comment: mockComment,
              gradeAdjustment: mockGradeAdjustment,
              xpAdjustment: mockXpAdjustment
            }
          })
          .silentRun();
      });

      test('Other error responses', () => {
        return expectSaga(backendSaga)
          .withState(mockStateStaff)
          .provide([
            [
              matchers.call.fn(postGrading),
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
              comment: mockComment,
              gradeAdjustment: mockGradeAdjustment,
              xpAdjustment: mockXpAdjustment
            }
          })
          .silentRun();
      });
    });
  });
});
