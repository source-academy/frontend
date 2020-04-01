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
import { MaterialData } from '../components/material/materialShape';
import {
  Notification,
  NotificationFilterFunction
} from '../components/notification/notificationShape';
import { IState, Role } from '../reducers/states';
import { history } from '../utils/history';
import { showSuccessMessage, showWarningMessage } from '../utils/notification';
import * as request from './requests';

function* backendSaga(): SagaIterator {
  yield takeEvery(actionTypes.FETCH_AUTH, function*(action: ReturnType<typeof actions.fetchAuth>) {
    const luminusCode = action.payload;
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

  yield takeEvery(actionTypes.FETCH_ASSESSMENT, function*(
    action: ReturnType<typeof actions.fetchAssessment>
  ) {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const id = action.payload;
    const assessment: IAssessment = yield call(request.getAssessment, id, tokens);
    if (assessment) {
      yield put(actions.updateAssessment(assessment));
    }
  });

  yield takeEvery(actionTypes.SUBMIT_ANSWER, function*(
    action: ReturnType<typeof actions.submitAnswer>
  ) {
    const role = yield select((state: IState) => state.session.role!);
    if (role !== Role.Student) {
      return yield call(showWarningMessage, 'Answer rejected - only students can submit answers.');
    }

    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const questionId = action.payload.id;
    const answer = action.payload.answer;
    const resp = yield call(request.postAnswer, questionId, answer, tokens);

    const codes: Map<number, string> = new Map([
      [400, "Answer rejected - can't save an empty answer."],
      [403, 'Answer rejected - assessment not open or already finalised.']
    ]);
    if (!resp || !resp.ok) {
      yield request.handleResponseError(resp, codes);
      return;
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

  yield takeEvery(actionTypes.SUBMIT_ASSESSMENT, function*(
    action: ReturnType<typeof actions.submitAssessment>
  ) {
    const role = yield select((state: IState) => state.session.role!);
    if (role !== Role.Student) {
      return yield call(
        showWarningMessage,
        'Submission rejected - only students can submit assessments.'
      );
    }

    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const assessmentId = action.payload;
    const resp = yield call(request.postAssessment, assessmentId, tokens);

    const codes: Map<number, string> = new Map([
      [400, 'Not allowed to finalise - some questions are unattempted.'],
      [403, 'Not allowed to finalise - assessment not open or already finalised.']
    ]);
    if (!resp || !resp.ok) {
      yield request.handleResponseError(resp, codes);
      return;
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

  yield takeEvery(actionTypes.FETCH_GRADING_OVERVIEWS, function*(
    action: ReturnType<typeof actions.fetchGradingOverviews>
  ) {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const filterToGroup = action.payload;

    const gradingOverviews = yield call(request.getGradingOverviews, tokens, filterToGroup);
    if (gradingOverviews) {
      yield put(actions.updateGradingOverviews(gradingOverviews));
    }
  });

  yield takeEvery(actionTypes.FETCH_GRADING, function*(
    action: ReturnType<typeof actions.fetchGrading>
  ) {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const id = action.payload;
    const grading = yield call(request.getGrading, id, tokens);
    if (grading) {
      yield put(actions.updateGrading(id, grading));
    }
  });

  /**
   * Unsubmits the submission and updates the grading overviews of the new status.
   */
  yield takeEvery(actionTypes.UNSUBMIT_SUBMISSION, function*(
    action: ReturnType<typeof actions.unsubmitSubmission>
  ) {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const { submissionId } = action.payload;

    const resp: Response = yield request.postUnsubmit(submissionId, tokens);

    const codes: Map<number, string> = new Map([
      [400, 'Not allowed to unsubmit - submission incomplete or not submitted.'],
      [403, "Not allowed to unsubmit - not this student's Avenger or an Admin."]
    ]);
    if (!resp || !resp.ok) {
      yield request.handleResponseError(resp, codes);
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

  const sendGrade = function*(
    action:
      | ReturnType<typeof actions.submitGrading>
      | ReturnType<typeof actions.submitGradingAndContinue>
  ) {
    const role = yield select((state: IState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can submit answers.');
    }
    const { submissionId, questionId, gradeAdjustment, xpAdjustment, comments } = action.payload;
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

    const codes: Map<number, string> = new Map([
      [400, 'Grading rejected - missing permissions or invalid grade parameters.'],
      [405, 'Not allowed to grade - submission incomplete or not submitted.']
    ]);
    if (!resp || !resp.ok) {
      yield request.handleResponseError(resp, codes);
      return;
    }

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
  };

  const sendGradeAndContinue = function*(
    action: ReturnType<typeof actions.submitGradingAndContinue>
  ) {
    const { submissionId } = action.payload;
    yield* sendGrade(action);

    const currentQuestion = yield select(
      (state: IState) => state.workspaces.grading.currentQuestion
    );
    /**
     * Move to next question for grading: this only works because the
     * SUBMIT_GRADING_AND_CONTINUE Redux action is currently only
     * used in the Grading Workspace
     *
     * If the questionId is out of bounds, the componentDidUpdate callback of
     * GradingWorkspace will cause a redirect back to '/academy/grading'
     */
    yield history.push('/academy/grading' + `/${submissionId}` + `/${(currentQuestion || 0) + 1}`);
  };

  yield takeEvery(actionTypes.SUBMIT_GRADING, sendGrade);

  yield takeEvery(actionTypes.SUBMIT_GRADING_AND_CONTINUE, sendGradeAndContinue);

  yield takeEvery(actionTypes.FETCH_NOTIFICATIONS, function*(
    action: ReturnType<typeof actions.fetchNotifications>
  ) {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const notifications = yield call(request.getNotifications, tokens);

    yield put(actions.updateNotifications(notifications));
  });

  yield takeEvery(actionTypes.ACKNOWLEDGE_NOTIFICATIONS, function*(
    action: ReturnType<typeof actions.acknowledgeNotifications>
  ) {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const notificationFilter: NotificationFilterFunction | undefined = action.payload.withFilter;

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
      yield request.handleResponseError(resp);
      return;
    }
  });

  yield takeEvery(actionTypes.NOTIFY_CHATKIT_USERS, function*(
    action: ReturnType<typeof actions.notifyChatUsers>
  ) {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const assessmentId = action.payload.assessmentId;
    const submissionId = action.payload.submissionId;
    yield call(request.postNotify, tokens, assessmentId, submissionId);
  });

  yield takeEvery(actionTypes.DELETE_SOURCECAST_ENTRY, function*(
    action: ReturnType<typeof actions.deleteSourcecastEntry>
  ) {
    const role = yield select((state: IState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can delete sourcecasts.');
    }

    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const { id } = action.payload;
    const resp: Response = yield request.deleteSourcecastEntry(id, tokens);

    if (!resp || !resp.ok) {
      yield request.handleResponseError(resp);
      return;
    }

    const sourcecastIndex = yield call(request.getSourcecastIndex, tokens);
    if (sourcecastIndex) {
      yield put(actions.updateSourcecastIndex(sourcecastIndex, action.payload.workspaceLocation));
    }
    yield call(showSuccessMessage, 'Deleted successfully!', 1000);
  });

  yield takeEvery(actionTypes.FETCH_SOURCECAST_INDEX, function*(
    action: ReturnType<typeof actions.fetchSourcecastIndex>
  ) {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const sourcecastIndex = yield call(request.getSourcecastIndex, tokens);
    if (sourcecastIndex) {
      yield put(actions.updateSourcecastIndex(sourcecastIndex, action.payload.workspaceLocation));
    }
  });

  yield takeEvery(actionTypes.SAVE_SOURCECAST_DATA, function*(
    action: ReturnType<typeof actions.saveSourcecastData>
  ) {
    const role = yield select((state: IState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can save sourcecast.');
    }
    const { title, description, audio, playbackData } = action.payload;
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const resp = yield request.postSourcecast(title, description, audio, playbackData, tokens);

    if (!resp || !resp.ok) {
      yield request.handleResponseError(resp, new Map());
      return;
    }

    yield call(showSuccessMessage, 'Saved successfully!', 1000);
    yield history.push('/sourcecast');
  });

  yield takeEvery(actionTypes.DELETE_MATERIAL, function*(
    action: ReturnType<typeof actions.deleteMaterial>
  ) {
    const role = yield select((state: IState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can delete material.');
    }
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const { id } = action.payload;
    const resp: Response = yield request.deleteMaterial(id, tokens);

    if (!resp || !resp.ok) {
      yield request.handleResponseError(resp);
      return;
    }
    const materialDirectoryTree = yield select(
      (state: IState) => state.session.materialDirectoryTree!
    );
    const directoryLength = materialDirectoryTree.length;
    const folderId = !!directoryLength ? materialDirectoryTree[directoryLength - 1].id : -1;
    yield put(actions.fetchMaterialIndex(folderId));
    yield call(showSuccessMessage, 'Deleted successfully!', 1000);
  });

  yield takeEvery(actionTypes.FETCH_MATERIAL_INDEX, function*(
    action: ReturnType<typeof actions.fetchMaterialIndex>
  ) {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const { id } = action.payload;
    const resp = yield call(request.getMaterialIndex, id, tokens);
    if (resp) {
      const directory_tree = resp.directory_tree;
      const materialIndex = resp.index;
      yield put(actions.updateMaterialDirectoryTree(directory_tree));
      yield put(actions.updateMaterialIndex(materialIndex));
    }
  });

  yield takeEvery(actionTypes.UPLOAD_MATERIAL, function*(
    action: ReturnType<typeof actions.uploadMaterial>
  ) {
    const role = yield select((state: IState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can upload materials.');
    }
    const { file, title, description } = action.payload;
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const materialDirectoryTree = yield select(
      (state: IState) => state.session.materialDirectoryTree!
    );
    const directoryLength = materialDirectoryTree.length;
    const parentId = !!directoryLength ? materialDirectoryTree[directoryLength - 1].id : -1;
    const resp = yield request.postMaterial(file, title, description, parentId, tokens);

    if (!resp || !resp.ok) {
      yield request.handleResponseError(resp);
      return;
    }

    yield put(actions.fetchMaterialIndex(parentId));
    yield call(showSuccessMessage, 'Saved successfully!', 1000);
  });

  yield takeEvery(actionTypes.CREATE_MATERIAL_FOLDER, function*(
    action: ReturnType<typeof actions.createMaterialFolder>
  ) {
    const role = yield select((state: IState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can create materials folder.');
    }
    const { title } = action.payload;
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const materialDirectoryTree = yield select(
      (state: IState) => state.session.materialDirectoryTree!
    );
    const directoryLength = materialDirectoryTree.length;
    const parentId = !!directoryLength ? materialDirectoryTree[directoryLength - 1].id : -1;
    const resp = yield request.postMaterialFolder(title, parentId, tokens);

    if (!resp || !resp.ok) {
      yield request.handleResponseError(resp);
      return;
    }

    yield put(actions.fetchMaterialIndex(parentId));
    yield call(showSuccessMessage, 'Created successfully!', 1000);
  });

  yield takeEvery(actionTypes.DELETE_MATERIAL_FOLDER, function*(
    action: ReturnType<typeof actions.deleteMaterial>
  ) {
    const role = yield select((state: IState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can delete material folder.');
    }
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const { id } = action.payload;
    const resp: Response = yield request.deleteMaterialFolder(id, tokens);

    if (!resp || !resp.ok) {
      yield request.handleResponseError(resp);
      return;
    }

    const materialDirectoryTree = yield select(
      (state: IState) => state.session.materialDirectoryTree!
    );
    const directoryLength = materialDirectoryTree.length;
    const parentId = !!directoryLength ? materialDirectoryTree[directoryLength - 1].id : -1;
    yield put(actions.fetchMaterialIndex(parentId));
    yield call(showSuccessMessage, 'Deleted successfully!', 1000);
  });

  yield takeEvery(actionTypes.FETCH_TEST_STORIES, function*(
    action: ReturnType<typeof actions.fetchTestStories>
  ) {
    const fileName: string = 'Test Stories';
    /*
    yield put(actions.fetchMaterialIndex());
    let materialIndex = null;
    while (materialIndex === null) {
      materialIndex = yield select(
        (state: IState) => state.session.materialIndex!
      );
    }
    let storyFolder = yield materialIndex.find((x :MaterialData) => x.title === fileName);
    
    if (storyFolder === undefined) {
      yield put(actions.createMaterialFolder(fileName));
      while (yield materialIndex.find((x :MaterialData) => x.title === fileName) === undefined) {
        materialIndex = yield select(
          (state: IState) => state.session.materialIndex!
        );
      }
      storyFolder = yield materialIndex.find((x :MaterialData) => x.title === fileName);
    }
    // tslint:disable-next-line:no-console
    console.log(storyFolder.id == null ? 1 : 0);
    yield put(actions.fetchMaterialIndex(storyFolder.id));
    */

    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    let resp = yield call(request.getMaterialIndex, -1, tokens);
    if (resp) {
      let materialIndex = resp.index;
      let storyFolder = yield materialIndex.find((x: MaterialData) => x.title === fileName);
      if (storyFolder === undefined) {
        const role = yield select((state: IState) => state.session.role!);
        if (role === Role.Student) {
          return yield call(showWarningMessage, 'Only staff can create materials folder.');
        }
        resp = yield request.postMaterialFolder(fileName, -1, tokens);
        if (!resp || !resp.ok) {
          yield request.handleResponseError(resp);
          return;
        }
      }

      resp = yield call(request.getMaterialIndex, -1, tokens);
      if (resp) {
        materialIndex = resp.index;
        storyFolder = yield materialIndex.find((x: MaterialData) => x.title === fileName);
        resp = yield call(request.getMaterialIndex, storyFolder.id, tokens);
        if (resp) {
          const directory_tree = resp.directory_tree;
          materialIndex = resp.index;
          yield put(actions.updateMaterialDirectoryTree(directory_tree));
          yield put(actions.updateMaterialIndex(materialIndex));
        }
      }
    }
  });
}

export default backendSaga;
