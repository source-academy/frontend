import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';

import { Notification } from '../../../commons/notificationBadge/NotificationBadgeTypes';
import { updateGroupGradingSummary } from '../../../features/dashboard/DashboardActions';
import {
  FETCH_GROUP_GRADING_SUMMARY,
  UPDATE_GROUP_GRADING_SUMMARY
} from '../../../features/dashboard/DashboardTypes';
import {
  setTokens,
  setUser,
  updateAssessment,
  updateAssessmentOverviews,
  updateNotifications
} from '../../application/actions/SessionActions';
import { GameState, Role, Story } from '../../application/ApplicationTypes';
import {
  ACKNOWLEDGE_NOTIFICATIONS,
  FETCH_ASSESSMENT,
  FETCH_AUTH,
  FETCH_NOTIFICATIONS,
  REAUTOGRADE_ANSWER,
  REAUTOGRADE_SUBMISSION,
  SET_TOKENS,
  SET_USER,
  SUBMIT_ANSWER,
  UPDATE_ASSESSMENT,
  UPDATE_ASSESSMENT_OVERVIEWS
} from '../../application/types/SessionTypes';
import {
  Assessment,
  AssessmentStatuses,
  FETCH_ASSESSMENT_OVERVIEWS,
  Question,
  SUBMIT_ASSESSMENT
} from '../../assessment/AssessmentTypes';
import {
  mockAssessmentOverviews,
  mockAssessmentQuestions,
  mockAssessments
} from '../../mocks/AssessmentMocks';
import { mockGradingSummary } from '../../mocks/GradingMocks';
import { mockNotifications } from '../../mocks/UserMocks';
import { computeRedirectUri } from '../../utils/AuthHelper';
import Constants from '../../utils/Constants';
import { showSuccessMessage, showWarningMessage } from '../../utils/NotificationsHelper';
import { updateChapter, updateHasUnsavedChanges } from '../../workspace/WorkspaceActions';
import {
  CHANGE_CHAPTER,
  FETCH_CHAPTER,
  UPDATE_HAS_UNSAVED_CHANGES,
  WorkspaceLocation
} from '../../workspace/WorkspaceTypes';
import BackendSaga from '../BackendSaga';
import {
  changeChapter,
  getAssessment,
  getAssessmentOverviews,
  getGradingSummary,
  getNotifications,
  getUser,
  postAcknowledgeNotifications,
  postAnswer,
  postAssessment,
  postAuth,
  postReautogradeAnswer,
  postReautogradeSubmission
} from '../RequestsSaga';

// ----------------------------------------
// Constants to use for testing

const mockAssessment: Assessment = mockAssessments[0];

const mockMapAssessments = new Map<number, Assessment>(mockAssessments.map(a => [a.id, a]));

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
  const code = 'luminusCode';
  const providerId = 'provider';
  const clientId = 'clientId';
  Constants.authProviders.set(providerId, {
    name: providerId,
    endpoint: `https://test/?client_id=${clientId}`,
    isDefault: true
  });
  const redirectUrl = computeRedirectUri(providerId);

  const user = {
    userId: 123,
    name: 'user',
    role: 'student' as Role,
    group: '42D',
    story: {
      story: '',
      playStory: false
    } as Story,
    grade: 1,
    gameState: {
      collectibles: {},
      completed_quests: []
    } as GameState
  };

  test('when tokens and user obtained', () => {
    return expectSaga(BackendSaga)
      .call(postAuth, code, providerId, clientId, redirectUrl)
      .call(getUser, mockTokens)
      .put(setTokens(mockTokens))
      .put(setUser(user))
      .provide([
        [call(postAuth, code, providerId, clientId, redirectUrl), mockTokens],
        [call(getUser, mockTokens), user]
      ])
      .dispatch({ type: FETCH_AUTH, payload: { code, providerId } })
      .silentRun();
  });

  test('when tokens is null', () => {
    return expectSaga(BackendSaga)
      .provide([
        [call(postAuth, code, providerId, clientId, redirectUrl), null],
        [call(getUser, mockTokens), user]
      ])
      .call(postAuth, code, providerId, clientId, redirectUrl)
      .not.call.fn(getUser)
      .not.put.actionType(SET_TOKENS)
      .not.put.actionType(SET_USER)
      .dispatch({ type: FETCH_AUTH, payload: { code, providerId } })
      .silentRun();
  });

  test('when user is null', () => {
    const nullUser = null;
    return expectSaga(BackendSaga)
      .provide([
        [call(postAuth, code, providerId, clientId, redirectUrl), mockTokens],
        [call(getUser, mockTokens), nullUser]
      ])
      .call(postAuth, code, providerId, clientId, redirectUrl)
      .call(getUser, mockTokens)
      .not.put.actionType(SET_TOKENS)
      .not.put.actionType(SET_USER)
      .dispatch({ type: FETCH_AUTH, payload: { code, providerId } })
      .silentRun();
  });
});

describe('Test FETCH_ASSESSMENT_OVERVIEWS Action', () => {
  test('when assesments is obtained', () => {
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getAssessmentOverviews, mockTokens), mockAssessmentOverviews]])
      .put(updateAssessmentOverviews(mockAssessmentOverviews))
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: FETCH_ASSESSMENT_OVERVIEWS })
      .silentRun();
  });

  test('when assessments overviews is null', () => {
    const ret = null;
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getAssessmentOverviews, mockTokens), ret]])
      .call(getAssessmentOverviews, mockTokens)
      .not.put.actionType(UPDATE_ASSESSMENT_OVERVIEWS)
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: FETCH_ASSESSMENT_OVERVIEWS })
      .silentRun();
  });
});

describe('Test FETCH_ASSESSMENT Action', () => {
  test('when assesment is obtained', () => {
    const mockId = mockAssessment.id;
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getAssessment, mockId, mockTokens), mockAssessment]])
      .put(updateAssessment(mockAssessment))
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: FETCH_ASSESSMENT, payload: mockId })
      .silentRun();
  });

  test('when assesment is null', () => {
    const mockId = mockAssessment.id;
    return expectSaga(BackendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getAssessment, mockId, mockTokens), null]])
      .call(getAssessment, mockId, mockTokens)
      .not.put.actionType(UPDATE_ASSESSMENT)
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: FETCH_ASSESSMENT, payload: mockId })
      .silentRun();
  });
});

describe('Test SUBMIT_ANSWER Action', () => {
  test('when response is ok', () => {
    const mockAnsweredAssessmentQuestion: Question =
      mockAssessmentQuestion.type === 'mcq'
        ? { ...mockAssessmentQuestion, answer: 42 }
        : { ...mockAssessmentQuestion, answer: '42' };
    const mockNewQuestions: Question[] = mockAssessment.questions.map(
      (question: Question): Question => {
        if (question.id === mockAnsweredAssessmentQuestion.id) {
          return { ...question, answer: mockAnsweredAssessmentQuestion.answer } as Question;
        }
        return question;
      }
    );
    const mockNewAssessment = {
      ...mockAssessment,
      questions: mockNewQuestions
    };
    expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([
        [
          call(
            postAnswer,
            mockAnsweredAssessmentQuestion.id,
            mockAnsweredAssessmentQuestion.answer || '',
            mockTokens
          ),
          okResp
        ]
      ])
      .not.call.fn(showWarningMessage)
      .call(showSuccessMessage, 'Saved!', 1000)
      .put(updateAssessment(mockNewAssessment))
      .put(updateHasUnsavedChanges('assessment' as WorkspaceLocation, false))
      .dispatch({ type: SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
    // To make sure no changes in state
    return expect(
      mockStates.session.assessments.get(mockNewAssessment.id)!.questions[0].answer
    ).toEqual(null);
  });

  test('when role is not student', () => {
    const mockAnsweredAssessmentQuestion: Question =
      mockAssessmentQuestion.type === 'mcq'
        ? { ...mockAssessmentQuestion, answer: 42 }
        : { ...mockAssessmentQuestion, answer: '42' };
    const mockNewQuestions: Question[] = mockAssessment.questions.map(
      (question: Question): Question => {
        if (question.id === mockAnsweredAssessmentQuestion.id) {
          return { ...question, answer: mockAnsweredAssessmentQuestion.answer } as Question;
        }
        return question;
      }
    );
    const mockNewAssessment = {
      ...mockAssessment,
      questions: mockNewQuestions
    };
    expectSaga(BackendSaga)
      .withState({ ...mockStates, session: { ...mockStates.session, role: Role.Staff } })
      .provide([
        [
          call(
            postAnswer,
            mockAnsweredAssessmentQuestion.id,
            mockAnsweredAssessmentQuestion.answer || '',
            mockTokens
          ),
          okResp
        ]
      ])
      .not.call.fn(showWarningMessage)
      .call(showSuccessMessage, 'Saved!', 1000)
      .put(updateAssessment(mockNewAssessment))
      .put(updateHasUnsavedChanges('assessment' as WorkspaceLocation, false))
      .dispatch({ type: SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
    // To make sure no changes in state
    return expect(
      mockStates.session.assessments.get(mockNewAssessment.id)!.questions[0].answer
    ).toEqual(null);
  });

  test('when response is null', () => {
    const mockAnsweredAssessmentQuestion = { ...mockAssessmentQuestion, answer: '42' };
    return expectSaga(BackendSaga)
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
      .not.put.actionType(UPDATE_ASSESSMENT)
      .not.put.actionType(UPDATE_HAS_UNSAVED_CHANGES)
      .hasFinalState({ session: { ...mockTokens, role: Role.Student } })
      .dispatch({ type: SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
  });

  test('when response has HTTP status code 403 (Forbidden)', () => {
    const mockAnsweredAssessmentQuestion = { ...mockAssessmentQuestion, answer: '42' };
    return expectSaga(BackendSaga)
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
      .not.put.actionType(UPDATE_ASSESSMENT)
      .not.put.actionType(UPDATE_HAS_UNSAVED_CHANGES)
      .hasFinalState({ session: { ...mockTokens, role: Role.Student } })
      .dispatch({ type: SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
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
    expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(postAssessment, mockAssessmentId, mockTokens), okResp]])
      .not.call(showWarningMessage)
      .call(showSuccessMessage, 'Submitted!', 2000)
      .put(updateAssessmentOverviews(mockNewOverviews))
      .dispatch({ type: SUBMIT_ASSESSMENT, payload: mockAssessmentId })
      .silentRun();
    expect(mockStates.session.assessmentOverviews[0].id).toEqual(mockAssessmentId);
    return expect(mockStates.session.assessmentOverviews[0].status).not.toEqual(
      AssessmentStatuses.submitted
    );
  });

  test('when response has HTTP status code 403 (Forbidden)', () => {
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Student } })
      .provide([[call(postAssessment, 0, mockTokens), { ...errorResp, status: 403 }]])
      .call(postAssessment, 0, mockTokens)
      .call(
        showWarningMessage,
        'Not allowed to finalise - assessment not open or already finalised.'
      )
      .not.put.actionType(UPDATE_ASSESSMENT_OVERVIEWS)
      .hasFinalState({ session: { ...mockTokens, role: Role.Student } })
      .dispatch({ type: SUBMIT_ASSESSMENT, payload: 0 })
      .silentRun();
  });

  test('when response is null', () => {
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Student } })
      .provide([[call(postAssessment, 0, mockTokens), null]])
      .call(postAssessment, 0, mockTokens)
      .call(showWarningMessage, "Couldn't reach our servers. Are you online?")
      .not.put.actionType(UPDATE_ASSESSMENT_OVERVIEWS)
      .hasFinalState({ session: { ...mockTokens, role: Role.Student } })
      .dispatch({ type: SUBMIT_ASSESSMENT, payload: 0 })
      .silentRun();
  });

  test('when role is not a student', () => {
    const mockAssessmentId = mockAssessment.id;
    const mockNewOverviews = mockAssessmentOverviews.map(overview => {
      if (overview.id === mockAssessmentId) {
        return { ...overview, status: AssessmentStatuses.submitted };
      }
      return overview;
    });
    expectSaga(BackendSaga)
      .withState({ ...mockStates, session: { ...mockStates.session, role: Role.Staff } })
      .provide([[call(postAssessment, mockAssessmentId, mockTokens), okResp]])
      .not.call(showWarningMessage)
      .call(showSuccessMessage, 'Submitted!', 2000)
      .put(updateAssessmentOverviews(mockNewOverviews))
      .dispatch({ type: SUBMIT_ASSESSMENT, payload: mockAssessmentId })
      .silentRun();
    expect(mockStates.session.assessmentOverviews[0].id).toEqual(mockAssessmentId);
    return expect(mockStates.session.assessmentOverviews[0].status).not.toEqual(
      AssessmentStatuses.submitted
    );
  });
});

describe('Test FETCH_NOTIFICATIONS Action', () => {
  test('when notifications obtained', () => {
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(getNotifications, mockTokens), mockNotifications]])
      .put(updateNotifications(mockNotifications))
      .dispatch({ type: FETCH_NOTIFICATIONS })
      .silentRun();
  });
});

describe('Test ACKNOWLEDGE_NOTIFICATIONS Action', () => {
  test('when response is ok', () => {
    const ids = [1, 2, 3];
    const mockNewNotifications = mockNotifications.filter(n => !ids.includes(n.id));
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([[call(postAcknowledgeNotifications, mockTokens, ids), okResp]])
      .not.call(showWarningMessage)
      .put(updateNotifications(mockNewNotifications))
      .dispatch({
        type: ACKNOWLEDGE_NOTIFICATIONS,
        payload: {
          withFilter: (notifications: Notification[]) =>
            notifications.filter(notification => ids.includes(notification.id))
        }
      })
      .silentRun();
  });

  test('when response has HTTP status code 404 (Not Found)', () => {
    const ids = mockNotifications.map(n => n.id);
    return expectSaga(BackendSaga)
      .withState(mockStates)
      .provide([
        [call(postAcknowledgeNotifications, mockTokens, ids), { ...errorResp, status: 404 }]
      ])
      .call(showWarningMessage, 'Something went wrong (got 404 response)')
      .dispatch({ type: ACKNOWLEDGE_NOTIFICATIONS, payload: {} })
      .silentRun();
  });
});

describe('Test FETCH_CHAPTER Action', () => {
  test('when chapter is obtained', () => {
    return expectSaga(BackendSaga).dispatch({ type: FETCH_CHAPTER }).silentRun();
  });
});

describe('Test CHANGE_CHAPTER Action', () => {
  test('when chapter is changed', () => {
    return expectSaga(BackendSaga)
      .withState({ session: { role: Role.Staff, ...mockTokens } })
      .call(changeChapter, 1, 'default', mockTokens)
      .put(updateChapter(1, 'default'))
      .provide([[call(changeChapter, 1, 'default', mockTokens), { ok: true }]])
      .dispatch({ type: CHANGE_CHAPTER, payload: { chapter: 1, variant: 'default' } })
      .silentRun();
  });
});

describe('Test FETCH_GROUP_GRADING_SUMMARY Action', () => {
  test('when grading summary is obtained', () => {
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Staff } })
      .provide([[call(getGradingSummary, mockTokens), mockGradingSummary]])
      .put(updateGroupGradingSummary(mockGradingSummary))
      .hasFinalState({ session: { ...mockTokens, role: Role.Staff } })
      .dispatch({ type: FETCH_GROUP_GRADING_SUMMARY })
      .silentRun();
  });

  test('when response is null', () => {
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Staff } })
      .provide([[call(getGradingSummary, mockTokens), null]])
      .call(getGradingSummary, mockTokens)
      .not.put.actionType(UPDATE_GROUP_GRADING_SUMMARY)
      .hasFinalState({ session: { ...mockTokens, role: Role.Staff } })
      .dispatch({ type: FETCH_GROUP_GRADING_SUMMARY })
      .silentRun();
  });
});

describe('Test REAUTOGRADE_SUBMISSION Action', () => {
  const submissionId = 123;
  test('when successful', () => {
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Staff } })
      .provide([[call(postReautogradeSubmission, submissionId, mockTokens), true]])
      .call(postReautogradeSubmission, submissionId, mockTokens)
      .call.fn(showSuccessMessage)
      .not.call.fn(showWarningMessage)
      .dispatch({ type: REAUTOGRADE_SUBMISSION, payload: submissionId })
      .silentRun();
  });

  test('when unsuccessful', () => {
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Staff } })
      .provide([[call(postReautogradeSubmission, submissionId, mockTokens), false]])
      .call(postReautogradeSubmission, submissionId, mockTokens)
      .not.call.fn(showSuccessMessage)
      .call.fn(showWarningMessage)
      .dispatch({ type: REAUTOGRADE_SUBMISSION, payload: submissionId })
      .silentRun();
  });
});

describe('Test REAUTOGRADE_ANSWER Action', () => {
  const submissionId = 123;
  const questionId = 456;

  test('when successful', () => {
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Staff } })
      .provide([[call(postReautogradeAnswer, submissionId, questionId, mockTokens), true]])
      .call(postReautogradeAnswer, submissionId, questionId, mockTokens)
      .call.fn(showSuccessMessage)
      .not.call.fn(showWarningMessage)
      .dispatch({ type: REAUTOGRADE_ANSWER, payload: { submissionId, questionId } })
      .silentRun();
  });

  test('when unsuccessful', () => {
    const submissionId = 123;
    return expectSaga(BackendSaga)
      .withState({ session: { ...mockTokens, role: Role.Staff } })
      .provide([[call(postReautogradeAnswer, submissionId, questionId, mockTokens), false]])
      .call(postReautogradeAnswer, submissionId, questionId, mockTokens)
      .not.call.fn(showSuccessMessage)
      .call.fn(showWarningMessage)
      .dispatch({ type: REAUTOGRADE_ANSWER, payload: { submissionId, questionId } })
      .silentRun();
  });
});
