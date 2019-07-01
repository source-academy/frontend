import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';
import * as actions from '../../actions';
import * as actionTypes from '../../actions/actionTypes';
import {
  IAssessment,
  IAssessmentOverview
  // IQuestion
} from '../../components/assessment/assessmentShape';
import backendSaga, {
  getAssessment,
  getAssessmentOverviews,
  getUser,
  postAuth
  // postAnswer,
} from '../backend';
// import { defaultState } from '../../reducers/states';

test('When backendSaga receives an action with type FETCH_AUTH', () => {
  const luminousCode = 'luminousCode';
  const tokens = { accessToken: 'a', refreshToken: 'b' };
  const user = tokens ? 'user' : null;
  return (
    expectSaga(backendSaga)
      // .put(actions.setTokens(tokens))
      // .put(actions.setUser(user))
      .provide([[call(postAuth, luminousCode), tokens], [call(getUser, tokens), user]])
      .dispatch({ type: actionTypes.FETCH_AUTH, payload: luminousCode })
      .silentRun()
  );
});

test('When backendSaga receives an action with type FETCH_ASSESSMENT_OVERVIEWS', () => {
  const fakeAssessmentOverviews: IAssessmentOverview[] = [
    {
      category: 'Contest',
      closeAt: 'a',
      coverImage: 'a',
      fileName: 'a',
      grade: 0,
      id: 0,
      maxGrade: 0,
      maxXp: 0,
      openAt: 'a',
      title: 'a',
      reading: 'a',
      shortSummary: 'a',
      status: 'submitted',
      story: null,
      xp: 0,
      gradingStatus: 'graded'
    }
  ];
  const fakeStates = { session: { accessToken: 'a', refreshToken: 'b' } };
  const tokens = { accessToken: 'a', refreshToken: 'b' };
  return expectSaga(backendSaga)
    .withState(fakeStates)
    .provide([[call(getAssessmentOverviews, tokens), fakeAssessmentOverviews]])
    .put(actions.updateAssessmentOverviews(fakeAssessmentOverviews))
    .dispatch({ type: actionTypes.FETCH_ASSESSMENT_OVERVIEWS })
    .silentRun();
});

test('When backendSaga receives an action with type FETCH_ASSESSMENT', () => {
  const fakeStates = { session: { accessToken: 'a', refreshToken: 'b' } };
  const tokens = { accessToken: 'a', refreshToken: 'b' };
  const id = 0;
  const fakeAssessment: IAssessment = {
    category: 'Contest',
    globalDeployment: undefined,
    graderDeployment: undefined,
    id: 0,
    longSummary: 'a',
    missionPDF: 'a',
    questions: [],
    title: 'a'
  };
  return expectSaga(backendSaga)
    .withState(fakeStates)
    .provide([[call(getAssessment, id, tokens), fakeAssessment]])
    .put(actions.updateAssessment(fakeAssessment))
    .dispatch({ type: actionTypes.FETCH_ASSESSMENT, payload: id })
    .silentRun();
});
