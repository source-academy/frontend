import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import * as actions from '../../actions';
import * as actionTypes from '../../actions/actionTypes';
import { GradingOverview } from '../../components/academy/grading/gradingShape';
import { mockGrading, mockGradingOverviews } from '../../mocks/gradingAPI';
import { defaultState, Role } from '../../reducers/states';
import { showSuccessMessage, showWarningMessage } from '../../utils/notification';
import backendSaga, { getGrading, getGradingOverviews, postUnsubmit } from '../backend';

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
    test('for appropriate response to a successful unsubmit', () => {
      const mockState = {
        ...defaultState,
        session: {
          GradingOverview: mockGradingOverviews
        }
      };
      const unsubmittedOverviews: GradingOverview[] = [
        {
          gradeAdjustment: 0,
          xpAdjustment: 0,
          assessmentCategory: 'Mission',
          assessmentId: 0,
          assessmentName: 'Mission 0 ',
          currentGrade: 69,
          currentXp: 69,
          xpBonus: 10,
          initialGrade: 69,
          initialXp: 69,
          maxGrade: 100,
          maxXp: 100,
          studentId: 0,
          studentName: 'Al Gorithm',
          submissionId: 0,
          submissionStatus: 'attempted',
          groupName: '1D'
        },
        {
          gradeAdjustment: -2,
          xpAdjustment: -2,
          assessmentCategory: 'Mission',
          assessmentId: 1,
          assessmentName: 'Mission 1',
          currentGrade: -2,
          currentXp: -2,
          xpBonus: 12,
          initialGrade: 0,
          initialXp: 0,
          maxGrade: 400,
          maxXp: 400,
          studentId: 0,
          studentName: 'Dee Sign',
          submissionId: 1,
          submissionStatus: 'attempted',
          groupName: '1F'
        },
        {
          gradeAdjustment: 4,
          xpAdjustment: 4,
          assessmentCategory: 'Mission',
          assessmentId: 0,
          assessmentName: 'Mission 0',
          currentGrade: 1000,
          currentXp: 1000,
          xpBonus: 12,
          initialGrade: 996,
          initialXp: 996,
          maxGrade: 1000,
          maxXp: 1000,
          studentId: 1,
          studentName: 'May Trix',
          submissionId: 2,
          submissionStatus: 'submitted',
          groupName: '1F'
        }
      ];

      return expectSaga(backendSaga)
        .withState(mockState)
        .provide([[matchers.call.fn(postUnsubmit), { ok: true }]])
        .call(showSuccessMessage, 'Unsubmit successful', 1000)
        .put(actions.updateGradingOverviews(unsubmittedOverviews))
        .dispatch({
          type: actionTypes.UNSUBMIT_SUBMISSION,
          payload: 1
        })
        .silentRun();
    });
  });
});
