/*eslint no-eval: "error"*/
/*eslint-env browser*/
import { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery } from 'redux-saga/effects';

import * as actions from '../actions';
import * as actionTypes from '../actions/actionTypes';
import { WorkspaceLocation } from '../actions/workspaces';
import {
  Grading,
  GradingOverview,
  GradingQuestion
} from '../components/academy/grading/gradingShape';
import {
  AssessmentStatuses,
  IAssessment,
  IAssessmentOverview,
  IQuestion
} from '../components/assessment/assessmentShape';
import {
  Notification,
  NotificationFilterFunction
} from '../components/notification/notificationShape';
import { IState, Role } from '../reducers/states';
import { history } from '../utils/history';
import { showSuccessMessage, showWarningMessage } from '../utils/notification';
import * as request from './requests';

function* backendSaga(): SagaIterator {
  yield takeEvery(actionTypes.FETCH_AUTH, function*(action) {
    const luminusCode = (action as actionTypes.IAction).payload;
    const tokens = yield call(request.postAuth, luminusCode);
    if (!tokens) {
      return yield history.push('/');
    }

    const user = yield call(request.getUser, tokens);
    if (!user) {
      return yield history.push('/');
    }

    // Old: Use dispatch instead of saga's put to guarantee the reducer has
    // finished setting values in the state before /academy begins rendering
    // New: Changed to yield put
    yield put(actions.setTokens(tokens));
    yield put(actions.setUser(user));
    yield history.push('/academy');
  });

  yield takeEvery(actionTypes.FETCH_ASSESSMENT_OVERVIEWS, function*() {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const assessmentOverviews = yield call(request.getAssessmentOverviews, tokens);
    if (assessmentOverviews) {
      yield put(actions.updateAssessmentOverviews(assessmentOverviews));
    }
  });

  yield takeEvery(actionTypes.FETCH_ASSESSMENT, function*(action) {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const id = (action as actionTypes.IAction).payload;
    const assessment: IAssessment = yield call(request.getAssessment, id, tokens);
    if (assessment) {
      yield put(actions.updateAssessment(assessment));
    }
  });

  yield takeEvery(actionTypes.SUBMIT_ANSWER, function*(action) {
    const role = yield select((state: IState) => state.session.role!);
    if (role !== Role.Student) {
      return yield call(showWarningMessage, 'Only students can submit answers.');
    }

    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const questionId = (action as actionTypes.IAction).payload.id;
    const answer = (action as actionTypes.IAction).payload.answer;
    const resp = yield call(request.postAnswer, questionId, answer, tokens);
    if (!resp) {
      return yield call(showWarningMessage, "Couldn't reach our servers. Are you online?");
    }
    if (!resp.ok) {
      let errorMessage: string;
      switch (resp.status) {
        case 401:
          errorMessage = 'Session expired. Please login again.';
          break;
        case 400:
          errorMessage = "Can't save an empty answer.";
          break;
        default:
          errorMessage = `Something went wrong (got ${resp.status} response)`;
          break;
      }
      return yield call(showWarningMessage, errorMessage);
    }
    yield call(showSuccessMessage, 'Saved!', 1000);
    // Now, update the answer for the question in the assessment in the store
    const assessmentId = yield select(
      (state: IState) => state.workspaces.assessment.currentAssessment!
    );
    const assessment = yield select((state: IState) => state.session.assessments.get(assessmentId));
    const newQuestions = assessment.questions.slice().map((question: IQuestion) => {
      if (question.id === questionId) {
        return { ...question, answer };
      }
      return question;
    });
    const newAssessment = {
      ...assessment,
      questions: newQuestions
    };
    yield put(actions.updateAssessment(newAssessment));
    return yield put(actions.updateHasUnsavedChanges('assessment' as WorkspaceLocation, false));
  });

  yield takeEvery(actionTypes.SUBMIT_ASSESSMENT, function*(action) {
    const role = yield select((state: IState) => state.session.role!);
    if (role !== Role.Student) {
      return yield call(showWarningMessage, 'Only students can submit assessments.');
    }

    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const assessmentId = (action as actionTypes.IAction).payload;
    const resp = yield call(request.postAssessment, assessmentId, tokens);
    if (!resp || !resp.ok) {
      return yield call(showWarningMessage, 'Something went wrong. Please try again.');
    }
    yield call(showSuccessMessage, 'Submitted!', 2000);
    // Now, update the status of the assessment overview in the store
    const overviews: IAssessmentOverview[] = yield select(
      (state: IState) => state.session.assessmentOverviews
    );
    const newOverviews = overviews.map(overview => {
      if (overview.id === assessmentId) {
        return { ...overview, status: AssessmentStatuses.submitted };
      }
      return overview;
    });
    return yield put(actions.updateAssessmentOverviews(newOverviews));
  });

  yield takeEvery(actionTypes.FETCH_GRADING_OVERVIEWS, function*(action) {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const filterToGroup = (action as actionTypes.IAction).payload;

    const gradingOverviews = yield call(request.getGradingOverviews, tokens, filterToGroup);
    if (gradingOverviews) {
      yield put(actions.updateGradingOverviews(gradingOverviews));
    }
  });

  yield takeEvery(actionTypes.FETCH_GRADING, function*(action) {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const id = (action as actionTypes.IAction).payload;
    const grading = yield call(request.getGrading, id, tokens);
    if (grading) {
      yield put(actions.updateGrading(id, grading));
    }
  });

  /**
   * Unsubmits the submission and updates the grading overviews of the new status.
   */
  yield takeEvery(actionTypes.UNSUBMIT_SUBMISSION, function*(action) {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const { submissionId } = (action as actionTypes.IAction).payload;

    const resp: Response = yield request.postUnsubmit(submissionId, tokens);
    if (!resp || !resp.ok) {
      yield request.handleResponseError(resp);
      return;
    }

    const overviews = yield select((state: IState) => state.session.gradingOverviews || []);
    const newOverviews = (overviews as GradingOverview[]).map(overview => {
      if (overview.submissionId === submissionId) {
        return { ...overview, submissionStatus: 'attempted' };
      }
      return overview;
    });
    yield call(showSuccessMessage, 'Unsubmit successful', 1000);
    yield put(actions.updateGradingOverviews(newOverviews));
  });

  const sendGrade = function*(action: actionTypes.IAction) {
    const role = yield select((state: IState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can submit answers.');
    }
    const {
      submissionId,
      questionId,
      gradeAdjustment,
      xpAdjustment,
      comments
    } = (action as actionTypes.IAction).payload;
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const resp = yield request.postGrading(
      submissionId,
      questionId,
      gradeAdjustment,
      xpAdjustment,
      tokens,
      comments
    );
    if (resp && resp.ok) {
      yield call(showSuccessMessage, 'Submitted!', 1000);

      // Now, update the grade for the question in the Grading in the store
      const grading: Grading = yield select((state: IState) =>
        state.session.gradings.get(submissionId)
      );
      const newGrading = grading.slice().map((gradingQuestion: GradingQuestion) => {
        if (gradingQuestion.question.id === questionId) {
          gradingQuestion.grade = {
            gradeAdjustment,
            xpAdjustment,
            roomId: gradingQuestion.grade.roomId,
            grade: gradingQuestion.grade.grade,
            xp: gradingQuestion.grade.xp,
            comments
          };
        }
        return gradingQuestion;
      });
      yield put(actions.updateGrading(submissionId, newGrading));
    } else {
      request.handleResponseError(resp);
    }
  };

  const sendGradeAndContinue = function*(action: actionTypes.IAction) {
    const { submissionId, questionId } = action.payload;
    yield* sendGrade(action);
    /**
     * Move to next question for grading: this only works because the
     * SUBMIT_GRADING_AND_CONTINUE Redux action is currently only
     * used in the Grading Workspace
     *
     * If the questionId is out of bounds, the componentDidUpdate callback of
     * GradingWorkspace will cause a redirect back to '/academy/grading'
     */
    yield history.push(`/academy/grading` + `/${submissionId}` + `/${questionId + 1}`);
  };

  yield takeEvery(actionTypes.SUBMIT_GRADING, sendGrade);

  yield takeEvery(actionTypes.SUBMIT_GRADING_AND_CONTINUE, sendGradeAndContinue);

  yield takeEvery(actionTypes.FETCH_NOTIFICATIONS, function*(action) {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const notifications = yield call(request.getNotifications, tokens);

    yield put(actions.updateNotifications(notifications));
  });

  yield takeEvery(actionTypes.ACKNOWLEDGE_NOTIFICATIONS, function*(action) {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const notificationFilter:
      | NotificationFilterFunction
      | undefined = (action as actionTypes.IAction).payload.withFilter;

    const notifications: Notification[] = yield select(
      (state: IState) => state.session.notifications
    );

    let notificationsToAcknowledge = notifications;

    if (notificationFilter) {
      notificationsToAcknowledge = notificationFilter(notifications);
    }

    if (notificationsToAcknowledge.length === 0) {
      return;
    }

    const ids = notificationsToAcknowledge.map(n => n.id);

    const newNotifications: Notification[] = notifications.filter(
      notification => !ids.includes(notification.id)
    );

    yield put(actions.updateNotifications(newNotifications));

    const resp: Response | null = yield call(request.postAcknowledgeNotifications, tokens, ids);

    if (!resp || !resp.ok) {
      yield call(showWarningMessage, "Something went wrong, couldn't acknowledge");
      return;
    }
  });

  yield takeEvery(actionTypes.NOTIFY_CHATKIT_USERS, function*(action) {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const assessmentId = (action as actionTypes.IAction).payload.assessmentId;
    const submissionId = (action as actionTypes.IAction).payload.submissionId;
    yield call(request.postNotify, tokens, assessmentId, submissionId);
  });

  yield takeEvery(actionTypes.DELETE_SOURCECAST_ENTRY, function*(action) {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const { id } = (action as actionTypes.IAction).payload;
    const resp: Response = yield request.deleteSourcecastEntry(id, tokens);
    if (!resp || !resp.ok) {
      yield call(showWarningMessage, `Something went wrong (got ${resp.status} response)`);
      return;
    }
    const sourcecastIndex = yield call(request.getSourcecastIndex, tokens);
    if (sourcecastIndex) {
      yield put(
        actions.updateSourcecastIndex(
          sourcecastIndex,
          (action as actionTypes.IAction).payload.workspaceLocation
        )
      );
    }
    yield call(showSuccessMessage, 'Deleted successfully!', 1000);
  });

  yield takeEvery(actionTypes.FETCH_SOURCECAST_INDEX, function*(action) {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const sourcecastIndex = yield call(request.getSourcecastIndex, tokens);
    if (sourcecastIndex) {
      yield put(
        actions.updateSourcecastIndex(
          sourcecastIndex,
          (action as actionTypes.IAction).payload.workspaceLocation
        )
      );
    }
  });

  yield takeEvery(actionTypes.SAVE_SOURCECAST_DATA, function*(action) {
    const role = yield select((state: IState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can save sourcecast.');
    }
    const { title, description, audio, playbackData } = (action as actionTypes.IAction).payload;
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const resp = yield request.postSourcecast(title, description, audio, playbackData, tokens);
    if (resp && resp.ok) {
      yield call(showSuccessMessage, 'Saved!', 1000);
      yield history.push('/sourcecast');
    } else if (resp !== null) {
      let errorMessage: string;
      switch (resp.status) {
        case 401:
          errorMessage = 'Session expired. Please login again.';
          break;
        default:
          errorMessage = `Something went wrong (got ${resp.status} response)`;
          break;
      }
      yield call(showWarningMessage, errorMessage);
    } else {
      yield call(showWarningMessage, "Couldn't reach our servers. Are you online?");
    }
  });
}

export default backendSaga;
