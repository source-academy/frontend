import { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery } from 'redux-saga/effects';

import * as actions from '../actions';
import * as actionTypes from '../actions/actionTypes';
import { Grading, GradingQuestion } from '../components/academy/grading/gradingShape';
import { IQuestion } from '../components/assessment/assessmentShape';
import { store } from '../createStore';
import { IState } from '../reducers/states';
import { history } from '../utils/history';
import { showSuccessMessage } from '../utils/notification';
import { mockAssessmentOverviews, mockAssessments } from './assessmentAPI';
import { mockFetchGrading, mockFetchGradingOverview } from './gradingAPI';

export function* mockBackendSaga(): SagaIterator {
  yield takeEvery(actionTypes.FETCH_AUTH, function*(action) {
    const tokens = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken'
    };
    const user = {
      name: 'DevStaff',
      role: 'staff',
      story: {
        story: 'mission-1',
        playStory: true
      },
      grade: 0
    };
    store.dispatch(actions.setTokens(tokens));
    store.dispatch(actions.setUser(user));
    yield history.push('/academy');
  });

  yield takeEvery(actionTypes.FETCH_ASSESSMENT_OVERVIEWS, function*() {
    yield put(actions.updateAssessmentOverviews([...mockAssessmentOverviews]));
  });

  yield takeEvery(actionTypes.FETCH_ASSESSMENT, function*(action) {
    const id = (action as actionTypes.IAction).payload;
    const assessment = mockAssessments[id];
    yield put(actions.updateAssessment({ ...assessment }));
  });

  yield takeEvery(actionTypes.FETCH_GRADING_OVERVIEWS, function*(action) {
    const accessToken = yield select((state: IState) => state.session.accessToken);
    const filterToGroup = (action as actionTypes.IAction).payload;
    const gradingOverviews = yield call(() => mockFetchGradingOverview(accessToken, filterToGroup));
    if (gradingOverviews !== null) {
      yield put(actions.updateGradingOverviews([...gradingOverviews]));
    }
  });

  yield takeEvery(actionTypes.FETCH_GRADING, function*(action) {
    const submissionId = (action as actionTypes.IAction).payload;
    const accessToken = yield select((state: IState) => state.session.accessToken);
    const grading = yield call(() => mockFetchGrading(accessToken, submissionId));
    if (grading !== null) {
      yield put(actions.updateGrading(submissionId, [...grading]));
    }
  });

  yield takeEvery(actionTypes.SUBMIT_ANSWER, function*(action) {
    const questionId = (action as actionTypes.IAction).payload.id;
    const answer = (action as actionTypes.IAction).payload.answer;
    // Now, update the answer for the question in the assessment in the store
    const assessmentId = yield select(
      (state: IState) => state.workspaces.assessment.currentAssessment!
    );
    const assessment = yield select((state: IState) => state.session.assessments.get(assessmentId));
    const newQuestions = assessment.questions.slice().map((question: IQuestion) => {
      if (question.id === questionId) {
        question.answer = answer;
      }
      return question;
    });
    const newAssessment = {
      ...assessment,
      questions: newQuestions
    };
    yield put(actions.updateAssessment(newAssessment));
    yield call(showSuccessMessage, 'Saved!', 1000);
  });

  yield takeEvery(actionTypes.SUBMIT_GRADING, function*(action) {
    const {
      submissionId,
      questionId,
      comment,
      gradeAdjustment,
      xpAdjustment
    } = (action as actionTypes.IAction).payload;
    // Now, update the grade for the question in the Grading in the store
    const grading: Grading = yield select((state: IState) =>
      state.session.gradings.get(submissionId)
    );
    const newGrading = grading.slice().map((gradingQuestion: GradingQuestion) => {
      if (gradingQuestion.question.id === questionId) {
        gradingQuestion.grade = {
          gradeAdjustment,
          xpAdjustment,
          comment,
          grade: gradingQuestion.grade.grade,
          xp: gradingQuestion.grade.xp
        };
      }
      return gradingQuestion;
    });
    yield put(actions.updateGrading(submissionId, newGrading));
    yield call(showSuccessMessage, 'Saved!', 1000);
  });
}
