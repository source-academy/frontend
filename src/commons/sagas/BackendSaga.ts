/*eslint no-eval: "error"*/
/*eslint-env browser*/
import { SagaIterator } from 'redux-saga';
import { call, put, select, takeEvery } from 'redux-saga/effects';

import {
  DELETE_SOURCECAST_ENTRY,
  SAVE_SOURCECAST_DATA
} from 'src/features/sourcereel/SourcereelTypes';
import * as actions from '../../actions'; // TODO: Fix after implementing GroundControlActions and GameActions
import { GameState, OverallState, Role } from '../../commons/application/ApplicationTypes';
import {
  Assessment,
  AssessmentOverview,
  AssessmentStatuses,
  FETCH_ASSESSMENT_OVERVIEWS,
  Question,
  SUBMIT_ASSESSMENT
} from '../../commons/assessment/AssessmentTypes';
import {
  Notification,
  NotificationFilterFunction
} from '../../commons/notificationBadge/NotificationBadgeTypes';
import {
  CHANGE_CHAPTER,
  FETCH_CHAPTER,
  WorkspaceLocation
} from '../../commons/workspace/WorkspaceTypes';
import { MaterialData } from '../../components/game-dev/storyShape';
import { FETCH_GROUP_OVERVIEWS } from '../../features/dashboard/DashboardTypes';
import { Grading, GradingOverview, GradingQuestion } from '../../features/grading/GradingTypes';
import { FETCH_SOURCECAST_INDEX } from '../../features/sourcecast/SourcecastTypes';
import { history } from '../../utils/history';
import { showSuccessMessage, showWarningMessage } from '../../utils/notification';
import {
  CHANGE_DATE_ASSESSMENT,
  CREATE_MATERIAL_FOLDER,
  DELETE_ASSESSMENT,
  DELETE_MATERIAL,
  DELETE_MATERIAL_FOLDER,
  FETCH_MATERIAL_INDEX,
  FETCH_TEST_STORIES,
  PUBLISH_ASSESSMENT,
  SAVE_USER_STATE,
  UPLOAD_ASSESSMENT,
  UPLOAD_MATERIAL
} from '../application/types/ActionTypes';
import {
  ACKNOWLEDGE_NOTIFICATIONS,
  FETCH_ASSESSMENT,
  FETCH_AUTH,
  FETCH_GRADING,
  FETCH_GRADING_OVERVIEWS,
  FETCH_NOTIFICATIONS,
  NOTIFY_CHATKIT_USERS,
  SUBMIT_ANSWER,
  SUBMIT_GRADING,
  SUBMIT_GRADING_AND_CONTINUE,
  UNSUBMIT_SUBMISSION
} from '../application/types/SessionTypes';
import {
  changeChapter,
  changeDateAssessment,
  deleteAssessment,
  deleteMaterial,
  deleteMaterialFolder,
  deleteSourcecastEntry,
  fetchChapter,
  getAssessment,
  getAssessmentOverviews,
  getGrading,
  getGradingOverviews,
  getGroupOverviews,
  getMaterialIndex,
  getNotifications,
  getSourcecastIndex,
  getUser,
  handleResponseError,
  postAcknowledgeNotifications,
  postAnswer,
  postAssessment,
  postAuth,
  postGrading,
  postMaterial,
  postMaterialFolder,
  postNotify,
  postSourcecast,
  postUnsubmit,
  publishAssessment,
  putUserGameState,
  uploadAssessment
} from './RequestsSaga';

function* backendSaga(): SagaIterator {
  yield takeEvery(FETCH_AUTH, function*(action: ReturnType<typeof actions.fetchAuth>) {
    const luminusCode = action.payload;
    const tokens = yield call(postAuth, luminusCode);
    if (!tokens) {
      return yield history.push('/');
    }

    const user = yield call(getUser, tokens);
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

  yield takeEvery(FETCH_ASSESSMENT_OVERVIEWS, function*() {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const assessmentOverviews = yield call(getAssessmentOverviews, tokens);
    if (assessmentOverviews) {
      yield put(actions.updateAssessmentOverviews(assessmentOverviews));
    }
  });

  yield takeEvery(FETCH_ASSESSMENT, function*(action: ReturnType<typeof actions.fetchAssessment>) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const id = action.payload;
    const assessment: Assessment = yield call(getAssessment, id, tokens);
    if (assessment) {
      yield put(actions.updateAssessment(assessment));
    }
  });

  yield takeEvery(SUBMIT_ANSWER, function*(action: ReturnType<typeof actions.submitAnswer>) {
    const role = yield select((state: OverallState) => state.session.role!);
    if (role !== Role.Student) {
      return yield call(showWarningMessage, 'Answer rejected - only students can submit answers.');
    }

    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const questionId = action.payload.id;
    const answer = action.payload.answer;
    const resp = yield call(postAnswer, questionId, answer, tokens);

    const codes: Map<number, string> = new Map([
      [400, "Answer rejected - can't save an empty answer."],
      [403, 'Answer rejected - assessment not open or already finalised.']
    ]);
    if (!resp || !resp.ok) {
      yield handleResponseError(resp, codes);
      return;
    }

    yield call(showSuccessMessage, 'Saved!', 1000);
    // Now, update the answer for the question in the assessment in the store
    const assessmentId = yield select(
      (state: OverallState) => state.workspaces.assessment.currentAssessment!
    );
    const assessment = yield select((state: OverallState) =>
      state.session.assessments.get(assessmentId)
    );
    const newQuestions = assessment.questions.slice().map((question: Question) => {
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

  yield takeEvery(SUBMIT_ASSESSMENT, function*(
    action: ReturnType<typeof actions.submitAssessment>
  ) {
    const role = yield select((state: OverallState) => state.session.role!);
    if (role !== Role.Student) {
      return yield call(
        showWarningMessage,
        'Submission rejected - only students can submit assessments.'
      );
    }

    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const assessmentId = action.payload;
    const resp = yield call(postAssessment, assessmentId, tokens);

    const codes: Map<number, string> = new Map([
      [400, 'Not allowed to finalise - some questions are unattempted.'],
      [403, 'Not allowed to finalise - assessment not open or already finalised.']
    ]);
    if (!resp || !resp.ok) {
      yield handleResponseError(resp, codes);
      return;
    }

    yield call(showSuccessMessage, 'Submitted!', 2000);
    // Now, update the status of the assessment overview in the store
    const overviews: AssessmentOverview[] = yield select(
      (state: OverallState) => state.session.assessmentOverviews
    );
    const newOverviews = overviews.map(overview => {
      if (overview.id === assessmentId) {
        return { ...overview, status: AssessmentStatuses.submitted };
      }
      return overview;
    });
    return yield put(actions.updateAssessmentOverviews(newOverviews));
  });

  yield takeEvery(FETCH_GRADING_OVERVIEWS, function*(
    action: ReturnType<typeof actions.fetchGradingOverviews>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const filterToGroup = action.payload;

    const gradingOverviews = yield call(getGradingOverviews, tokens, filterToGroup);
    if (gradingOverviews) {
      yield put(actions.updateGradingOverviews(gradingOverviews));
    }
  });

  yield takeEvery(FETCH_GRADING, function*(action: ReturnType<typeof actions.fetchGrading>) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const id = action.payload;
    const grading = yield call(getGrading, id, tokens);
    if (grading) {
      yield put(actions.updateGrading(id, grading));
    }
  });

  /**
   * Unsubmits the submission and updates the grading overviews of the new status.
   */
  yield takeEvery(UNSUBMIT_SUBMISSION, function*(
    action: ReturnType<typeof actions.unsubmitSubmission>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const { submissionId } = action.payload;

    const resp: Response = yield postUnsubmit(submissionId, tokens);

    const codes: Map<number, string> = new Map([
      [400, 'Not allowed to unsubmit - submission incomplete or not submitted.'],
      [403, "Not allowed to unsubmit - not this student's Avenger or an Admin."]
    ]);
    if (!resp || !resp.ok) {
      yield handleResponseError(resp, codes);
      return;
    }

    const overviews = yield select((state: OverallState) => state.session.gradingOverviews || []);
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
    const role = yield select((state: OverallState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can submit answers.');
    }
    const { submissionId, questionId, gradeAdjustment, xpAdjustment, comments } = action.payload;
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const resp = yield postGrading(
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
      yield handleResponseError(resp, codes);
      return;
    }

    yield call(showSuccessMessage, 'Submitted!', 1000);
    // Now, update the grade for the question in the Grading in the store
    const grading: Grading = yield select((state: OverallState) =>
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
      (state: OverallState) => state.workspaces.grading.currentQuestion
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

  yield takeEvery(SUBMIT_GRADING, sendGrade);

  yield takeEvery(SUBMIT_GRADING_AND_CONTINUE, sendGradeAndContinue);

  yield takeEvery(FETCH_NOTIFICATIONS, function*(
    action: ReturnType<typeof actions.fetchNotifications>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const notifications = yield call(getNotifications, tokens);

    yield put(actions.updateNotifications(notifications));
  });

  yield takeEvery(ACKNOWLEDGE_NOTIFICATIONS, function*(
    action: ReturnType<typeof actions.acknowledgeNotifications>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const notificationFilter: NotificationFilterFunction | undefined = action.payload.withFilter;

    const notifications: Notification[] = yield select(
      (state: OverallState) => state.session.notifications
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

    const resp: Response | null = yield call(postAcknowledgeNotifications, tokens, ids);

    if (!resp || !resp.ok) {
      yield handleResponseError(resp);
      return;
    }
  });

  yield takeEvery(NOTIFY_CHATKIT_USERS, function*(
    action: ReturnType<typeof actions.notifyChatUsers>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const assessmentId = action.payload.assessmentId;
    const submissionId = action.payload.submissionId;
    yield call(postNotify, tokens, assessmentId, submissionId);
  });

  yield takeEvery(DELETE_SOURCECAST_ENTRY, function*(
    action: ReturnType<typeof actions.deleteSourcecastEntry>
  ) {
    const role = yield select((state: OverallState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can delete sourcecasts.');
    }

    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const { id } = action.payload;
    const resp: Response = yield deleteSourcecastEntry(id, tokens);

    if (!resp || !resp.ok) {
      yield handleResponseError(resp);
      return;
    }

    const sourcecastIndex = yield call(getSourcecastIndex, tokens);
    if (sourcecastIndex) {
      yield put(actions.updateSourcecastIndex(sourcecastIndex, action.payload.workspaceLocation));
    }
    yield call(showSuccessMessage, 'Deleted successfully!', 1000);
  });

  yield takeEvery(FETCH_SOURCECAST_INDEX, function*(
    action: ReturnType<typeof actions.fetchSourcecastIndex>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const sourcecastIndex = yield call(getSourcecastIndex, tokens);
    if (sourcecastIndex) {
      yield put(actions.updateSourcecastIndex(sourcecastIndex, action.payload.workspaceLocation));
    }
  });

  yield takeEvery(SAVE_SOURCECAST_DATA, function*(
    action: ReturnType<typeof actions.saveSourcecastData>
  ) {
    const role = yield select((state: OverallState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can save sourcecast.');
    }
    const { title, description, audio, playbackData } = action.payload;
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const resp = yield postSourcecast(title, description, audio, playbackData, tokens);

    if (!resp || !resp.ok) {
      yield handleResponseError(resp, new Map());
      return;
    }

    yield call(showSuccessMessage, 'Saved successfully!', 1000);
    yield history.push('/sourcecast');
  });

  yield takeEvery(DELETE_MATERIAL, function*(action: ReturnType<typeof actions.deleteMaterial>) {
    const role = yield select((state: OverallState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can delete material.');
    }
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const { id } = action.payload;
    const resp: Response = yield deleteMaterial(id, tokens);

    if (!resp || !resp.ok) {
      yield handleResponseError(resp);
      return;
    }
    const materialDirectoryTree = yield select(
      (state: OverallState) => state.session.materialDirectoryTree!
    );
    const directoryLength = materialDirectoryTree.length;
    const folderId = !!directoryLength ? materialDirectoryTree[directoryLength - 1].id : -1;
    yield put(actions.fetchMaterialIndex(folderId));
    yield call(showSuccessMessage, 'Deleted successfully!', 1000);
  });

  yield takeEvery(FETCH_MATERIAL_INDEX, function*(
    action: ReturnType<typeof actions.fetchMaterialIndex>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const { id } = action.payload;
    const resp = yield call(getMaterialIndex, id, tokens);
    if (resp) {
      const directory_tree = resp.directory_tree;
      const materialIndex = resp.index;
      yield put(actions.updateMaterialDirectoryTree(directory_tree));
      yield put(actions.updateMaterialIndex(materialIndex));
    }
  });

  yield takeEvery(UPLOAD_MATERIAL, function*(action: ReturnType<typeof actions.uploadMaterial>) {
    const role = yield select((state: OverallState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can upload materials.');
    }
    const { file, title, description } = action.payload;
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const materialDirectoryTree = yield select(
      (state: OverallState) => state.session.materialDirectoryTree!
    );
    const directoryLength = materialDirectoryTree.length;
    const parentId = !!directoryLength ? materialDirectoryTree[directoryLength - 1].id : -1;
    const resp = yield postMaterial(file, title, description, parentId, tokens);

    if (!resp || !resp.ok) {
      yield handleResponseError(resp);
      return;
    }

    yield put(actions.fetchMaterialIndex(parentId));
    yield call(showSuccessMessage, 'Saved successfully!', 1000);
  });

  yield takeEvery(CREATE_MATERIAL_FOLDER, function*(
    action: ReturnType<typeof actions.createMaterialFolder>
  ) {
    const role = yield select((state: OverallState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can create materials folder.');
    }
    const { title } = action.payload;
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const materialDirectoryTree = yield select(
      (state: OverallState) => state.session.materialDirectoryTree!
    );
    const directoryLength = materialDirectoryTree.length;
    const parentId = !!directoryLength ? materialDirectoryTree[directoryLength - 1].id : -1;
    const resp = yield postMaterialFolder(title, parentId, tokens);

    if (!resp || !resp.ok) {
      yield handleResponseError(resp);
      return;
    }

    yield put(actions.fetchMaterialIndex(parentId));
    yield call(showSuccessMessage, 'Created successfully!', 1000);
  });

  yield takeEvery(DELETE_MATERIAL_FOLDER, function*(
    action: ReturnType<typeof actions.deleteMaterial>
  ) {
    const role = yield select((state: OverallState) => state.session.role!);
    if (role === Role.Student) {
      return yield call(showWarningMessage, 'Only staff can delete material folder.');
    }
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const { id } = action.payload;
    const resp: Response = yield deleteMaterialFolder(id, tokens);

    if (!resp || !resp.ok) {
      yield handleResponseError(resp);
      return;
    }

    const materialDirectoryTree = yield select(
      (state: OverallState) => state.session.materialDirectoryTree!
    );
    const directoryLength = materialDirectoryTree.length;
    const parentId = !!directoryLength ? materialDirectoryTree[directoryLength - 1].id : -1;
    yield put(actions.fetchMaterialIndex(parentId));
    yield call(showSuccessMessage, 'Deleted successfully!', 1000);
  });

  yield takeEvery(FETCH_CHAPTER, function*() {
    const chapter = yield call(fetchChapter);

    if (chapter) {
      yield put(actions.updateChapter(chapter.chapter.chapterno, chapter.chapter.variant));
    }
  });

  yield takeEvery(CHANGE_CHAPTER, function*(action: ReturnType<typeof actions.changeChapter>) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));

    const chapter = action.payload;
    const resp: Response = yield changeChapter(chapter.chapter, chapter.variant, tokens);

    if (!resp || !resp.ok) {
      yield handleResponseError(resp);
      return;
    }

    yield put(actions.updateChapter(chapter.chapter, chapter.variant));
    yield call(showSuccessMessage, 'Updated successfully!', 1000);
  });

  yield takeEvery(FETCH_GROUP_OVERVIEWS, function*(
    action: ReturnType<typeof actions.fetchGroupOverviews>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const groupOverviews = yield call(getGroupOverviews, tokens);
    if (groupOverviews) {
      yield put(actions.updateGroupOverviews(groupOverviews));
    }
  });

  yield takeEvery(CHANGE_DATE_ASSESSMENT, function*(
    action: ReturnType<typeof actions.changeDateAssessment>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const id = action.payload.id;
    const closeAt = action.payload.closeAt;
    const openAt = action.payload.openAt;
    const respMsg: string | null = yield changeDateAssessment(id, closeAt, openAt, tokens);
    if (respMsg == null) {
      yield handleResponseError(respMsg);
      return;
    } else if (respMsg !== 'OK') {
      yield call(showWarningMessage, respMsg, 5000);
      return;
    }

    yield put(actions.fetchAssessmentOverviews());
    yield call(showSuccessMessage, 'Updated successfully!', 1000);
  });

  yield takeEvery(DELETE_ASSESSMENT, function*(
    action: ReturnType<typeof actions.deleteAssessment>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const id = action.payload;
    const resp: Response = yield deleteAssessment(id, tokens);

    if (!resp || !resp.ok) {
      yield handleResponseError(resp);
      return;
    }

    yield put(actions.fetchAssessmentOverviews());
    yield call(showSuccessMessage, 'Deleted successfully!', 1000);
  });

  yield takeEvery(PUBLISH_ASSESSMENT, function*(
    action: ReturnType<typeof actions.publishAssessment>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const id = action.payload.id;
    const togglePublishTo = action.payload.togglePublishTo;
    const resp: Response = yield publishAssessment(id, togglePublishTo, tokens);

    if (!resp || !resp.ok) {
      yield handleResponseError(resp);
      return;
    }

    yield put(actions.fetchAssessmentOverviews());

    if (togglePublishTo) {
      yield call(showSuccessMessage, 'Published successfully!', 1000);
    } else {
      yield call(showSuccessMessage, 'Unpublished successfully!', 1000);
    }
  });

  yield takeEvery(UPLOAD_ASSESSMENT, function*(
    action: ReturnType<typeof actions.uploadAssessment>
  ) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const file = action.payload.file;
    const forceUpdate = action.payload.forceUpdate;
    const respMsg = yield uploadAssessment(file, tokens, forceUpdate);
    if (!respMsg) {
      yield handleResponseError(respMsg);
    } else if (respMsg === 'OK') {
      yield call(showSuccessMessage, 'Uploaded successfully!', 2000);
    } else if (respMsg === 'Force Update OK') {
      yield call(showSuccessMessage, 'Assessment force updated successfully!', 2000);
    } else {
      yield call(showWarningMessage, respMsg, 10000);
      return;
    }
    yield put(actions.fetchAssessmentOverviews());
  });

  yield takeEvery(FETCH_TEST_STORIES, function*(
    action: ReturnType<typeof actions.fetchTestStories>
  ) {
    const fileName: string = 'Test Stories';
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    let resp = yield call(getMaterialIndex, -1, tokens);
    if (resp) {
      let materialIndex = resp.index;
      let storyFolder = yield materialIndex.find((x: MaterialData) => x.title === fileName);
      if (storyFolder === undefined) {
        const role = yield select((state: OverallState) => state.session.role!);
        if (role === Role.Student) {
          return yield call(showWarningMessage, 'Only staff can create materials folder.');
        }
        resp = yield postMaterialFolder(fileName, -1, tokens);
        if (!resp || !resp.ok) {
          yield handleResponseError(resp);
          return;
        }
      }
      resp = yield call(getMaterialIndex, -1, tokens);
      if (resp) {
        materialIndex = resp.index;
        storyFolder = yield materialIndex.find((x: MaterialData) => x.title === fileName);
        resp = yield call(getMaterialIndex, storyFolder.id, tokens);
        if (resp) {
          const directory_tree = resp.directory_tree;
          materialIndex = resp.index;
          yield put(actions.updateMaterialDirectoryTree(directory_tree));
          yield put(actions.updateMaterialIndex(materialIndex));
        }
      }
    }
  });

  yield takeEvery(SAVE_USER_STATE, function*(action: ReturnType<typeof actions.saveUserData>) {
    const tokens = yield select((state: OverallState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }));
    const gameState: GameState = action.payload;
    const resp = yield putUserGameState(gameState, tokens);
    if (!resp || !resp.ok) {
      yield handleResponseError(resp);
      return;
    }
    yield put(actions.setGameState(gameState));
  });
}

export default backendSaga;
