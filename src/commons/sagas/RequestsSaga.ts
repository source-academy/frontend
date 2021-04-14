import { call } from 'redux-saga/effects';

import {
  Achievement,
  Assessment as AssessmentResponse,
  Cadet,
  HttpResponse,
  SourceVariant
} from '../../commons/api';
import { SourceLanguage, styliseSublanguage } from '../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import {
  Assessment,
  AssessmentCategory,
  AssessmentOverview,
  GradingStatus,
  IProgrammingQuestion,
  QuestionType,
  QuestionTypes
} from '../../commons/assessment/AssessmentTypes';
import {
  AchievementAbility,
  AchievementGoal,
  AchievementItem,
  GoalDefinition,
  GoalMeta,
  GoalProgress
} from '../../features/achievement/AchievementTypes';
import { GradingSummary } from '../../features/dashboard/DashboardTypes';
import { Grading, GradingOverview, GradingQuestion } from '../../features/grading/GradingTypes';
import {
  Device,
  WebSocketEndpointInformation
} from '../../features/remoteExecution/RemoteExecutionTypes';
import { PlaybackData, SourcecastData } from '../../features/sourceRecorder/SourceRecorderTypes';
import { store } from '../../pages/createStore';
import { backendifyGoalDefinition } from '../achievement/utils/AchievementBackender';
import { Tokens, User } from '../application/types/SessionTypes';
import { Notification } from '../notificationBadge/NotificationBadgeTypes';
import { actions } from '../utils/ActionsHelper';
import { castLibrary } from '../utils/CastBackend';
import Constants from '../utils/Constants';
import { showWarningMessage } from '../utils/NotificationsHelper';

/**
 * @property accessToken - backend access token
 * @property errorMessage - message to showWarningMessage on failure
 * @property body - request body, for HTTP POST
 * @property noContentType - set to true when sending multipart data
 * @property noHeaderAccept - if Accept: application/json should be omitted
 * @property refreshToken - backend refresh token
 * @property shouldRefresh - if should attempt to refresh access token
 *
 * If shouldRefresh, accessToken and refreshToken are required.
 */
type RequestOptions = {
  accessToken?: string;
  errorMessage?: string;
  body?: object;
  noContentType?: boolean;
  noHeaderAccept?: boolean;
  refreshToken?: string;
  shouldAutoLogout?: boolean;
  shouldRefresh?: boolean;
};

/**
 * POST /auth/login
 */
export const postAuth = async (
  code: string,
  providerId: string,
  clientId?: string,
  redirectUri?: string
): Promise<Tokens | null> => {
  const resp = await Cadet.auth.create(
    {
      code,
      provider: providerId,
      ...(clientId ? { client_id: clientId } : {}),
      ...(redirectUri ? { redirect_uri: redirectUri } : {})
    },
    {
      errorMessage: 'Could not login. Please contact the module administrator.',
      shouldRefresh: false
    }
  );
  if (!resp.ok) {
    return null;
  }

  const tokens = resp.data;
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token
  };
};

/**
 * POST /auth/refresh
 */
const postRefresh = async (refreshToken: string): Promise<Tokens | null> => {
  const resp = await Cadet.auth.refresh({ refresh_token: refreshToken });
  if (!resp.ok) {
    return null;
  }

  const tokens = resp.data;
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token
  };
};

/**
 * GET /user
 */
export const getUser = async (tokens: Tokens): Promise<User | null> => {
  const resp = await Cadet.user.index({ ...tokens });
  // TODO
  return resp.ok ? (resp.data as User) : null;
};

/**
 * GET /achievements
 *
 * Will be updated after a separate db for student progress is ready
 */
export const getAchievements = async (tokens: Tokens): Promise<AchievementItem[] | null> => {
  const resp = await Cadet.incentives.indexAchievements({ ...tokens });

  if (!resp.ok) {
    return null; // invalid accessToken _and_ refreshToken
  }

  const achievements = resp.data;

  return achievements.map(
    achievement =>
      ({
        uuid: achievement.uuid || '',
        title: achievement.title || '',
        ability: achievement.ability as AchievementAbility,
        deadline: achievement.deadline ? new Date(achievement.deadline) : undefined,
        release: achievement.release ? new Date(achievement.release) : undefined,
        isTask: achievement.isTask,
        position: achievement.position,
        prerequisiteUuids: achievement.prerequisiteUuids,
        goalUuids: achievement.goalUuids,
        cardBackground: achievement.cardBackground || '',
        view: {
          coverImage: achievement.view.coverImage || '',
          completionText: achievement.view.completionText || '',
          description: achievement.view.description || ''
        }
      } as AchievementItem) // TODO
  );
};

/**
 * TODO: new mapping
 * GET /achievements/goals/{studentId}
 */
export const getGoals = async (
  tokens: Tokens,
  studentId: number
): Promise<AchievementGoal[] | null> => {
  const resp = await request(`achievements/goals/${studentId}`, 'GET', {
    ...tokens,
    shouldRefresh: true
  });

  if (!resp || !resp.ok) {
    return null;
  }

  const achievementGoals = await resp.json();

  return achievementGoals.map(
    (goal: any) =>
      ({
        uuid: goal.uuid || '',
        text: goal.text || '',
        meta: goal.meta as GoalMeta,
        xp: goal.xp,
        maxXp: goal.maxXp,
        completed: goal.completed
      } as AchievementGoal)
  );
};

/**
 * GET /self/goals
 */
export const getOwnGoals = async (tokens: Tokens): Promise<AchievementGoal[] | null> => {
  const resp = await Cadet.incentives.indexGoals({ ...tokens });

  if (!resp.ok) {
    return null; // invalid accessToken _and_ refreshToken
  }

  const achievementGoals = resp.data;

  return achievementGoals.map(goal => ({
    uuid: goal.uuid || '',
    text: goal.text || '',
    meta: goal.meta as GoalMeta,
    xp: goal.xp,
    maxXp: goal.maxXp,
    completed: goal.completed
  }));
};

/**
 * PUT /admin/achievements
 */
export async function bulkUpdateAchievements(
  achievements: AchievementItem[],
  tokens: Tokens
): Promise<Response | null> {
  // TODO
  const resp = await Cadet.adminAchievements.bulkUpdate(
    (achievements as unknown) as Achievement[],
    { ...tokens }
  );
  return resp;
  // TODO: confirmation notification
}

/**
 * PUT /admin/goals
 */
export async function bulkUpdateGoals(
  goals: GoalDefinition[],
  tokens: Tokens
): Promise<Response | null> {
  const resp = await Cadet.adminGoals.bulkUpdate(
    goals.map(goal => backendifyGoalDefinition(goal)),
    { ...tokens }
  );
  return resp;
  // TODO: confirmation notification
}

/**
 * POST /achievements/{achievement_uuid}
 */
export const editAchievement = async (
  achievement: AchievementItem,
  tokens: Tokens
): Promise<Response | null> => {
  const resp = await Cadet.adminAchievements.update(achievement.uuid, achievement as Achievement, {
    ...tokens
  });
  return resp;
};

/**
 * POST /achievements/goals/{goalUuid}
 */
export const editGoal = async (
  definition: GoalDefinition,
  tokens: Tokens
): Promise<Response | null> => {
  const resp = await request(`achievements/goals/${definition.uuid}`, 'POST', {
    ...tokens,
    // Backendify call to be removed once UUID has been implemented
    body: { definition: backendifyGoalDefinition(definition) },
    noHeaderAccept: true,
    shouldAutoLogout: false,
    shouldRefresh: true
  });

  return resp;
};

/**
 * POST /achievements/goals/{goalUuid}/{studentId}
 */
export const updateGoalProgress = async (
  studentId: number,
  progress: GoalProgress,
  tokens: Tokens
): Promise<Response | null> => {
  const resp = await request(`achievements/goals/${progress.uuid}/${studentId}`, 'POST', {
    ...tokens,
    body: { progress: progress },
    noHeaderAccept: true,
    shouldAutoLogout: false,
    shouldRefresh: true
  });

  return resp;
};

/**
 * DELETE /admin/achievements/{achievementUuid}
 */
export const removeAchievement = async (uuid: string, tokens: Tokens): Promise<Response | null> => {
  const resp = await Cadet.adminAchievements.delete(uuid, { ...tokens });
  return resp;
};

/**
 * DELETE /admin/goals/{goalUuid}
 */
export const removeGoal = async (uuid: string, tokens: Tokens): Promise<Response | null> => {
  const resp = await Cadet.adminGoals.delete(uuid, { ...tokens });
  return resp;
};

/**
 * GET /assessments
 */
export const getAssessmentOverviews = async (
  tokens: Tokens
): Promise<AssessmentOverview[] | null> => {
  const resp = await Cadet.assessments.index({ ...tokens });
  if (!resp.ok) {
    return null; // invalid accessToken _and_ refreshToken
  }
  const assessmentOverviews = resp.data;
  return assessmentOverviews.map(overviewOriginal => {
    const category = capitalise(overviewOriginal.type) as AssessmentCategory;
    const overview: AssessmentOverview = {
      ...overviewOriginal,
      /**
       * backend has property ->     type: 'mission' | 'sidequest' | 'path' | 'contest'
       *              we have -> category: 'Mission' | 'Sidequest' | 'Path' | 'Contest'
       */
      // TODO: practical
      category,
      gradingStatus: computeGradingStatus(
        category,
        overviewOriginal.status,
        overviewOriginal.gradedCount,
        overviewOriginal.questionCount
      ),
      story: overviewOriginal.story ?? null
      // TODO: omit the following properties
      // type: undefined,
      // gradedCount: undefined,
      // questionCount: undefined,
    };

    return overview;
  });
};

/**
 * GET /assessments/{assessmentId}
 * Note: if assessment is password-protected, a corresponding unlock request will be sent to
 * POST /assessments/{assessmentId}/unlock
 */
export const getAssessment = async (id: number, tokens: Tokens): Promise<Assessment | null> => {
  let resp: HttpResponse<AssessmentResponse, void> | null = await Cadet.assessments.show(id, {
    ...tokens
  });

  // Attempt to load password-protected assessment
  while (resp && resp.status === 403) {
    const input = window.prompt('Please enter password.', '');
    if (!input) {
      resp = null;
      window.history.back();
      return null;
    }

    resp = await Cadet.assessments.unlock(id, { password: input }, { ...tokens });
  }

  if (!resp.ok) {
    return null;
  }

  // TODO
  const assessment = (resp.data as unknown) as Assessment;
  // backend has property ->     type: 'mission' | 'sidequest' | 'path' | 'contest'
  //              we have -> category: 'Mission' | 'Sidequest' | 'Path' | 'Contest'
  assessment.category = capitalise((assessment as any).type) as AssessmentCategory;
  delete (assessment as any).type;
  assessment.questions = assessment.questions.map(q => {
    if (q.type === QuestionTypes.programming) {
      const question = q as IProgrammingQuestion;
      question.autogradingResults = question.autogradingResults || [];
      question.prepend = question.prepend || '';
      question.postpend = question.postpend || '';
      question.testcases = question.testcases || [];
      q = question;
    }

    // If the backend returns :nil (null) for grader, then the question is not graded
    // Delete the grader and gradedAt attributes
    if (q.grader === null) {
      delete q.grader;
      delete q.gradedAt;
    }

    // Make library.external.name uppercase
    q.library.external.name = q.library.external.name.toUpperCase() as ExternalLibraryName;
    // Make globals into an Array of (string, value)
    q.library.globals = Object.entries(q.library.globals as object).map(entry => {
      try {
        entry[1] = (window as any).eval(entry[1]);
      } catch (e) {}
      return entry;
    });

    return q;
  });

  return assessment;
};

/**
 * POST /assessments/question/{questionId}/answer
 */
export const postAnswer = async (
  id: number,
  answer: string | number,
  tokens: Tokens
): Promise<Response | null> => {
  const resp = await Cadet.answer.submit(id, { answer }, { ...tokens });
  return resp;
};

/**
 * POST /assessments/{assessmentId}/submit
 */
export const postAssessment = async (id: number, tokens: Tokens): Promise<Response | null> => {
  const resp = await Cadet.assessments.submit(id, { ...tokens });
  return resp;
};

/*
 * GET /admin/grading
 */
export const getGradingOverviews = async (
  tokens: Tokens,
  group: boolean
): Promise<GradingOverview[] | null> => {
  const resp = await Cadet.adminGrading.index({ group }, { ...tokens });
  if (!resp.ok) {
    return null; // invalid accessToken _and_ refreshToken
  }
  const gradingOverviews = resp.data;
  return gradingOverviews
    .map(overview => {
      const gradingOverview: GradingOverview = {
        assessmentId: overview.assessment.id,
        assessmentName: overview.assessment.title,
        assessmentCategory: capitalise(overview.assessment.type) as AssessmentCategory,
        studentId: overview.student.id,
        studentName: overview.student.name,
        submissionId: overview.id,
        submissionStatus: overview.status,
        // TODO: make type optional?
        groupName: overview.student.groupName!,
        groupLeaderId: overview.student.groupLeaderId,
        // Grade
        initialGrade: overview.grade,
        gradeAdjustment: overview.adjustment,
        currentGrade: overview.grade + overview.adjustment,
        maxGrade: overview.assessment.maxGrade,
        gradingStatus: 'none',
        questionCount: overview.assessment.questionCount,
        gradedCount: overview.gradedCount,
        // XP
        initialXp: overview.xp,
        xpAdjustment: overview.xpAdjustment,
        currentXp: overview.xp + overview.xpAdjustment,
        maxXp: overview.assessment.maxXp,
        xpBonus: overview.xpBonus
      };
      gradingOverview.gradingStatus = computeGradingStatus(
        gradingOverview.assessmentCategory,
        gradingOverview.submissionStatus,
        gradingOverview.gradedCount,
        gradingOverview.questionCount
      );
      return gradingOverview;
    })
    .sort((subX: GradingOverview, subY: GradingOverview) =>
      subX.assessmentId !== subY.assessmentId
        ? subY.assessmentId - subX.assessmentId
        : subY.submissionId - subX.submissionId
    );
};

/**
 * GET /admin/grading/{submissionId}
 */
export const getGrading = async (submissionId: number, tokens: Tokens): Promise<Grading | null> => {
  const resp = await Cadet.adminGrading.show(submissionId, { ...tokens });

  if (!resp.ok) {
    return null;
  }

  const gradingResult = resp.data;
  const grading: Grading = gradingResult.map(gradingQuestion => {
    const { student, question, grade } = gradingQuestion;
    const result = {
      question: {
        answer: question.answer,
        autogradingResults: question.autogradingResults || [],
        choices: question.choices,
        content: question.content,
        id: question.id,
        library: castLibrary(question.library),
        solution: gradingQuestion.solution || question.solution || null,
        solutionTemplate: question.solutionTemplate,
        prepend: question.prepend || '',
        postpend: question.postpend || '',
        testcases: question.testcases || [],
        type: question.type as QuestionType,
        maxGrade: question.maxGrade,
        maxXp: question.maxXp
      },
      student,
      grade: {
        grade: grade.grade,
        xp: grade.xp,
        gradeAdjustment: grade.adjustment,
        xpAdjustment: grade.xpAdjustment,
        comments: grade.comments
      }
    } as GradingQuestion;

    if (gradingQuestion.grade.grader !== null) {
      result.grade.grader = gradingQuestion.grade.grader;
      result.grade.gradedAt = gradingQuestion.grade.gradedAt;
    }

    return result;
  });

  return grading;
};

/**
 * POST /admin/grading/{submissionId}/{questionId}
 */
export const postGrading = async (
  submissionId: number,
  questionId: number,
  gradeAdjustment: number,
  xpAdjustment: number,
  tokens: Tokens,
  comments?: string
): Promise<Response | null> => {
  const resp = await Cadet.adminGrading.update(
    submissionId,
    questionId,
    {
      grading: {
        adjustment: gradeAdjustment,
        xpAdjustment,
        comments
      }
    },
    { ...tokens }
  );
  return resp;
};

/**
 * POST /admin/grading/{submissionId}/autograde
 */
export const postReautogradeSubmission = async (
  submissionId: number,
  tokens: Tokens
): Promise<Response | null> => {
  const resp = await Cadet.adminGrading.autogradeSubmission(submissionId, { ...tokens });
  return resp;
};

/**
 * POST /admin/grading/{submissionId}/{questionId}/autograde
 */
export const postReautogradeAnswer = async (
  submissionId: number,
  questionId: number,
  tokens: Tokens
): Promise<Response | null> => {
  const resp = await Cadet.adminGrading.autogradeAnswer(submissionId, questionId, { ...tokens });
  return resp;
};

/**
 * POST /admin/grading/{submissionId}/unsubmit
 */
export const postUnsubmit = async (
  submissionId: number,
  tokens: Tokens
): Promise<Response | null> => {
  const resp = await Cadet.adminGrading.unsubmit(submissionId, { ...tokens });
  return resp;
};

/**
 * GET /notifications
 */
export const getNotifications = async (tokens: Tokens): Promise<Notification[]> => {
  const resp = await Cadet.notifications.index({ ...tokens });

  let notifications: Notification[] = [];

  if (!resp.ok) {
    return notifications;
  }

  const result = resp.data;

  notifications = result.map(notification => {
    return {
      id: notification.id,
      // TODO: avoid casting
      type: notification.type,
      assessment_id: notification.assessment_id || undefined,
      assessment_type: notification.assessment
        ? // TODO: avoid casting
          (capitalise(notification.assessment.type) as AssessmentCategory)
        : undefined,
      assessment_title: notification.assessment ? notification.assessment.title : undefined,
      submission_id: notification.submission_id || undefined
    };
  });

  return notifications;
};

/**
 * POST /notifications/acknowledge
 */
export const postAcknowledgeNotifications = async (
  ids: number[],
  tokens: Tokens
): Promise<Response | null> => {
  const resp = await Cadet.notifications.acknowledge({ notificationIds: ids }, { ...tokens });
  return resp;
};

// TODO: all sourcecasts are untyped?

/**
 * GET /sourcecast
 */
export const getSourcecastIndex = async (tokens: Tokens): Promise<SourcecastData[] | null> => {
  const resp = await Cadet.sourcecast.index({ ...tokens });
  // TODO
  return resp.ok ? ((resp.data as unknown) as SourcecastData[]) : null;
};

/**
 * POST /sourcecast
 */
export const postSourcecast = async (
  title: string,
  description: string,
  uid: string,
  audio: Blob,
  playbackData: PlaybackData,
  tokens: Tokens
): Promise<Response | null> => {
  const filename = Date.now().toString() + '.wav';
  const audioFile = new File([audio], filename);

  const sourcecast = {
    title,
    description,
    uid,
    audio: audioFile,
    playbackData: JSON.stringify(playbackData)
  };

  const resp = await Cadet.sourcecast.create(sourcecast, { ...tokens });
  return resp;
};

/**
 * DELETE /sourcecast/{sourcecastId}
 */
export const deleteSourcecastEntry = async (
  id: number,
  tokens: Tokens
): Promise<Response | null> => {
  const resp = await Cadet.sourcecast.delete(id, { ...tokens });
  return resp;
};

/**
 * POST /admin/assessments/{assessmentId}
 */
export const updateAssessment = async (
  id: number,
  body: { openAt?: string; closeAt?: string; isPublished?: boolean },
  tokens: Tokens
): Promise<Response | null> => {
  const resp = await Cadet.adminAssessments.update(id, body, tokens);
  return resp;
};

/**
 * DELETE /admin/assessments/{assessmentId}
 */
export const deleteAssessment = async (id: number, tokens: Tokens): Promise<Response | null> => {
  const resp = await Cadet.adminAssessments.delete(id, { ...tokens });
  return resp;
};

/**
 * POST /admin/assessments
 */
export const uploadAssessment = async (
  file: File,
  tokens: Tokens,
  forceUpdate: boolean
): Promise<Response | null> => {
  // TODO: check assessment
  // formData.append('assessment[file]', file);
  const resp = await Cadet.adminAssessments.create(
    { assessment: file, forceUpdate },
    { ...tokens }
  );
  return resp;
};

/**
 * GET /admin/grading/summary
 */
export const getGradingSummary = async (tokens: Tokens): Promise<GradingSummary | null> => {
  const resp = await Cadet.adminGrading.gradingSummary({ ...tokens });
  return resp.ok ? resp.data : null;
};

/**
 * GET /settings/sublanguage
 */
export const getSublanguage = async (): Promise<SourceLanguage | null> => {
  const resp = await Cadet.settings.index();
  if (!resp.ok) {
    return null;
  }

  const sublang = resp.data;

  return {
    ...sublang,
    displayName: styliseSublanguage(sublang.chapter, sublang.variant)
  };
};

/**
 * PUT /admin/settings/sublanguage
 */
export const postSublanguage = async (
  chapter: number,
  variant: string,
  tokens: Tokens
): Promise<Response | null> => {
  // TODO: variant
  const resp = await Cadet.adminSettings.update(
    { chapter, variant: variant as SourceVariant },
    { ...tokens }
  );
  return resp;
};

/**
 * GET /devices
 */
export async function fetchDevices(tokens: Tokens): Promise<Device[] | null> {
  const resp = await Cadet.devices.index({ ...tokens });
  return resp.ok ? resp.data : null;
}

/**
 * GET /devices/:id/ws_endpoint
 */
export async function getDeviceWSEndpoint(
  device: Device,
  tokens: Tokens
): Promise<WebSocketEndpointInformation | null> {
  const resp = await Cadet.devices.getWsEndpoint(device.id, { ...tokens });
  return resp.ok ? resp.data : null;
}

/**
 * POST /devices
 */
export async function registerDevice(device: Omit<Device, 'id'>, tokens?: Tokens): Promise<Device> {
  tokens = fillTokens(tokens);
  const resp = await Cadet.devices.register(device, { ...tokens });

  if (!resp.ok) {
    const message = await resp.text();
    throw new Error(`Failed to register: ${message}`);
  }

  return resp.data;
}

/**
 * POST /devices/:id
 */
export async function editDevice(
  device: Pick<Device, 'id' | 'title'>,
  tokens?: Tokens
): Promise<boolean> {
  tokens = fillTokens(tokens);
  const resp = await Cadet.devices.edit(device.id, device, { ...tokens });

  if (!resp.ok) {
    const message = await resp.text();
    throw new Error(`Failed to edit: ${message}`);
  }

  return true;
}

/**
 * DELETE /devices/:id
 */
export async function deleteDevice(device: Pick<Device, 'id'>, tokens?: Tokens): Promise<boolean> {
  tokens = fillTokens(tokens);
  const resp = await Cadet.devices.deregister(device.id, { ...tokens });

  if (!resp.ok) {
    const message = await resp.text();
    throw new Error(`Failed to delete: ${message}`);
  }

  return true;
}

function fillTokens(tokens?: Tokens): Tokens {
  tokens = tokens || getTokensFromStore();
  if (!tokens) {
    throw new Error('Not logged in.');
  }
  return tokens;
}

function getTokensFromStore(): Tokens | undefined {
  const { accessToken, refreshToken } = store.getState().session;

  return accessToken && refreshToken ? { accessToken, refreshToken } : undefined;
}

/**
 * @returns {(Response|null)} Response if successful, otherwise null.
 *
 * @see @type{RequestOptions} for options to this function.
 *
 * If opts.shouldRefresh, an initial response status of < 200 or > 299 will
 * cause this function to call postRefresh to attempt to setToken with fresh
 * tokens.
 *
 * If fetch throws an error, or final response has status code < 200 or > 299,
 * this function will cause the user to logout.
 */
export const request = async (
  path: string,
  method: string,
  opts: RequestOptions
): Promise<Response | null> => {
  const headers = new Headers();
  if (!opts.noHeaderAccept) {
    headers.append('Accept', 'application/json');
  }
  if (opts.accessToken) {
    headers.append('Authorization', `Bearer ${opts.accessToken}`);
  }

  const fetchOpts: any = { method, headers };
  if (opts.body) {
    if (opts.noContentType) {
      // Content Type is not needed for sending multipart data
      fetchOpts.body = opts.body;
    } else {
      headers.append('Content-Type', 'application/json');
      fetchOpts.body = JSON.stringify(opts.body);
    }
  }

  try {
    const resp = await fetch(`${Constants.backendUrl}/v2/${path}`, fetchOpts);

    // response.ok is (200 <= response.status <= 299)
    // response.status of > 299 does not raise error; so deal with in in the try clause
    if (opts.shouldRefresh && resp && resp.status === 401) {
      const newTokens = await postRefresh(opts.refreshToken!);
      store.dispatch(actions.setTokens(newTokens!));
      const newOpts = {
        ...opts,
        accessToken: newTokens!.accessToken,
        shouldRefresh: false
      };
      return request(path, method, newOpts);
    }

    if (resp && !resp.ok && opts.shouldAutoLogout === false) {
      // this clause is mostly for SUBMIT_ANSWER; show an error message instead
      // and ask student to manually logout, so that they have a chance to save
      // their answers
      return resp;
    }

    if (!resp || !resp.ok) {
      throw new Error('API call failed or got non-OK response');
    }

    return resp;
  } catch (e) {
    store.dispatch(actions.logOut());
    showWarningMessage(opts.errorMessage ? opts.errorMessage : 'Please login again.');

    return null;
  }
};

/**
 * Handles display of warning notifications for failed HTTP requests, i.e. those with no response
 * or a HTTP error status code (not 2xx).
 *
 * @param {(Response|null)} resp Result of the failed HTTP request
 */
export function* handleResponseError(resp: Response | null) {
  // Default: check if the response is null
  if (!resp) {
    yield call(showWarningMessage, "Couldn't reach our servers. Are you online?");
    return;
  }

  let respText = yield resp.text();

  if (respText.length > 100 && resp.status) {
    // This happens when error is not properly handled in backend
    // Hence returning status code instead for bug reporting
    respText = `Something went wrong (got ${resp.status} response)`;
  }

  yield call(showWarningMessage, respText);
}

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const computeGradingStatus = (
  category: AssessmentCategory,
  submissionStatus: string,
  numGraded: number,
  numQuestions: number
): GradingStatus =>
  ['Mission', 'Sidequest', 'Practical'].includes(category) && submissionStatus === 'submitted'
    ? numGraded === 0
      ? 'none'
      : numGraded === numQuestions
      ? 'graded'
      : 'grading'
    : 'excluded';
