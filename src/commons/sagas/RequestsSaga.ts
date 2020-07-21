/*eslint no-eval: "error"*/
/*eslint-env browser*/
import { call } from 'redux-saga/effects';

import {
  GameState,
  SourceLanguage,
  styliseSublanguage
} from '../../commons/application/ApplicationTypes';
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
import { GradingSummary } from '../../features/dashboard/DashboardTypes';
import { Grading, GradingOverview, GradingQuestion } from '../../features/grading/GradingTypes';
import { PlaybackData, SourcecastData } from '../../features/sourceRecorder/SourceRecorderTypes';
import { store } from '../../pages/createStore';
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

type Tokens = {
  accessToken: string;
  refreshToken: string;
};
/**
 * POST /auth
 */
export async function postAuth(
  code: string,
  providerId: string,
  clientId?: string,
  redirectUri?: string
): Promise<Tokens | null> {
  const resp = await request('auth', 'POST', {
    body: {
      code,
      provider: providerId,
      ...(clientId ? { client_id: clientId } : {}),
      ...(redirectUri ? { redirect_uri: redirectUri } : {})
    },
    errorMessage: 'Could not login. Please contact the module administrator.'
  });
  if (!resp) {
    return null;
  }
  const tokens = await resp.json();
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token
  };
}

/**
 * POST /auth/refresh
 */
async function postRefresh(refreshToken: string): Promise<Tokens | null> {
  const resp = await request('auth/refresh', 'POST', {
    body: { refresh_token: refreshToken }
  });
  if (!resp) {
    return null;
  }
  const tokens = await resp.json();
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token
  };
}

/**
 * GET /user
 */
export async function getUser(tokens: Tokens): Promise<object | null> {
  const resp = await request('user', 'GET', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    shouldRefresh: true
  });
  if (!resp || !resp.ok) {
    return null;
  }
  return await resp.json();
}

/**
 * PUT /user/game_states/
 */
export async function putUserGameState(
  gameStates: GameState,
  tokens: Tokens
): Promise<Response | null> {
  const resp = await request('user/game_states/save', 'PUT', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    body: {
      gameStates: JSON.stringify(gameStates)
    }
  });
  return resp;
}

/**
 * GET /assessments
 */
export async function getAssessmentOverviews(tokens: Tokens): Promise<AssessmentOverview[] | null> {
  const resp = await request('assessments', 'GET', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    shouldRefresh: true
  });
  if (!resp || !resp.ok) {
    return null; // invalid accessToken _and_ refreshToken
  }
  const assessmentOverviews = await resp.json();
  return assessmentOverviews.map((overview: any) => {
    /**
     * backend has property ->     type: 'mission' | 'sidequest' | 'path' | 'contest'
     *              we have -> category: 'Mission' | 'Sidequest' | 'Path' | 'Contest'
     */
    overview.category = capitalise(overview.type);
    delete overview.type;

    overview.gradingStatus = computeGradingStatus(
      overview.category,
      overview.status,
      overview.gradedCount,
      overview.questionCount
    );
    delete overview.gradedCount;
    delete overview.questionCount;

    return overview as AssessmentOverview;
  });
}

/**
 * GET /assessments/${assessmentId}
 */
export async function getAssessment(id: number, tokens: Tokens): Promise<Assessment | null> {
  let resp = await request(`assessments/${id}`, 'POST', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    shouldAutoLogout: false,
    shouldRefresh: true
  });

  // Attempt to load password-protected assessment
  while (resp && resp.status === 403) {
    const input = window.prompt('Please enter password.', '');
    if (!input) {
      resp = null;
      window.history.back();
      return null;
    }

    resp = await request(`assessments/${id}`, 'POST', {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      body: {
        password: input
      },
      shouldAutoLogout: false,
      shouldRefresh: true
    });
  }

  if (!resp || !resp.ok) {
    return null;
  }

  const assessment = (await resp.json()) as Assessment;
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
}

/**
 * POST /assessments/question/${questionId}/submit
 */
export async function postAnswer(
  id: number,
  answer: string | number,
  tokens: Tokens
): Promise<Response | null> {
  const resp = await request(`assessments/question/${id}/submit`, 'POST', {
    accessToken: tokens.accessToken,
    body: { answer: `${answer}` },
    noHeaderAccept: true,
    refreshToken: tokens.refreshToken,
    shouldAutoLogout: false,
    shouldRefresh: true
  });
  return resp;
}

/**
 * POST /assessments/${assessmentId}/submit
 */
export async function postAssessment(id: number, tokens: Tokens): Promise<Response | null> {
  const resp = await request(`assessments/${id}/submit`, 'POST', {
    accessToken: tokens.accessToken,
    noHeaderAccept: true,
    refreshToken: tokens.refreshToken,
    shouldAutoLogout: false, // 400 if some questions unattempted
    shouldRefresh: true
  });
  return resp;
}

/*
 * GET /grading
 * @params group - a boolean if true gets the submissions from the grader's group
 * @returns {Array} GradingOverview[]
 */
export async function getGradingOverviews(
  tokens: Tokens,
  group: boolean
): Promise<GradingOverview[] | null> {
  const resp = await request(`grading?group=${group}`, 'GET', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    shouldRefresh: true
  });
  if (!resp) {
    return null; // invalid accessToken _and_ refreshToken
  }
  const gradingOverviews = await resp.json();
  return gradingOverviews
    .map((overview: any) => {
      const gradingOverview: GradingOverview = {
        assessmentId: overview.assessment.id,
        assessmentName: overview.assessment.title,
        assessmentCategory: capitalise(overview.assessment.type) as AssessmentCategory,
        studentId: overview.student.id,
        studentName: overview.student.name,
        submissionId: overview.id,
        submissionStatus: overview.status,
        groupName: overview.student.groupName,
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
}

/**
 * GET /grading/${submissionId}
 * @returns {Grading}
 */
export async function getGrading(submissionId: number, tokens: Tokens): Promise<Grading | null> {
  const resp = await request(`grading/${submissionId}`, 'GET', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    shouldRefresh: true
  });
  if (!resp) {
    return null;
  }
  const gradingResult = await resp.json();
  const grading: Grading = gradingResult.map((gradingQuestion: any) => {
    const { student, question, grade } = gradingQuestion;

    const result = {
      question: {
        answer: question.answer,
        autogradingResults: question.autogradingResults || [],
        choices: question.choices,
        content: question.content,
        roomId: null,
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
        roomId: grade.roomId || '',
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
}

/**
 * POST /grading/{submissionId}/{questionId}
 */
export const postGrading = async (
  submissionId: number,
  questionId: number,
  gradeAdjustment: number,
  xpAdjustment: number,
  tokens: Tokens,
  comments?: string
) => {
  const resp = await request(`grading/${submissionId}/${questionId}`, 'POST', {
    accessToken: tokens.accessToken,
    body: {
      grading: {
        adjustment: gradeAdjustment,
        xpAdjustment,
        comments
      }
    },
    noHeaderAccept: true,
    refreshToken: tokens.refreshToken,
    shouldAutoLogout: false,
    shouldRefresh: true
  });
  return resp;
};

/**
 * POST /grading/{submissionId}/unsubmit
 */
export async function postUnsubmit(submissionId: number, tokens: Tokens) {
  const resp = await request(`grading/${submissionId}/unsubmit`, 'POST', {
    accessToken: tokens.accessToken,
    noHeaderAccept: true,
    refreshToken: tokens.refreshToken,
    shouldAutoLogout: false,
    shouldRefresh: true
  });
  return resp;
}

/**
 * GET /notification
 */
export async function getNotifications(tokens: Tokens) {
  const resp: Response | null = await request('notification', 'GET', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    shouldAutoLogout: false
  });
  let notifications: Notification[] = [];

  if (!resp || !resp.ok) {
    return notifications;
  }

  const result = await resp.json();
  notifications = result.map((notification: any) => {
    return {
      id: notification.id,
      type: notification.type,
      assessment_id: notification.assessment_id || undefined,
      assessment_type: notification.assessment
        ? capitalise(notification.assessment.type)
        : undefined,
      assessment_title: notification.assessment ? notification.assessment.title : undefined,
      submission_id: notification.submission_id || undefined
    } as Notification;
  });

  return notifications;
}

/**
 * POST /notification/acknowledge
 */
export async function postAcknowledgeNotifications(tokens: Tokens, ids: number[]) {
  const resp: Response | null = await request(`notification/acknowledge`, 'POST', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    body: { notificationIds: ids },
    shouldAutoLogout: false
  });

  return resp;
}

/**
 * DELETE /sourcecast
 */
export async function deleteSourcecastEntry(id: number, tokens: Tokens) {
  const resp = await request(`sourcecast/${id}`, 'DELETE', {
    accessToken: tokens.accessToken,
    noHeaderAccept: true,
    refreshToken: tokens.refreshToken,
    shouldAutoLogout: false,
    shouldRefresh: true
  });
  return resp;
}

/**
 * GET /sourcecast
 */
export async function getSourcecastIndex(tokens: Tokens): Promise<SourcecastData[] | null> {
  const resp = await request('sourcecast', 'GET', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    shouldAutoLogout: false,
    shouldRefresh: true
  });
  if (!resp || !resp.ok) {
    return null;
  }
  const index = await resp.json();
  return index;
}

/**
 * POST /sourcecast
 */
export const postSourcecast = async (
  title: string,
  description: string,
  audio: Blob,
  playbackData: PlaybackData,
  tokens: Tokens
) => {
  const formData = new FormData();
  const filename = Date.now().toString() + '.wav';
  formData.append('sourcecast[title]', title);
  formData.append('sourcecast[description]', description);
  formData.append('sourcecast[audio]', audio, filename);
  formData.append('sourcecast[playbackData]', JSON.stringify(playbackData));
  const resp = await request(`sourcecast`, 'POST', {
    accessToken: tokens.accessToken,
    body: formData,
    noContentType: true,
    noHeaderAccept: true,
    refreshToken: tokens.refreshToken,
    shouldAutoLogout: false,
    shouldRefresh: true
  });
  return resp;
};

export async function changeDateAssessment(
  id: number,
  closeAt: string,
  openAt: string,
  tokens: Tokens
) {
  const resp = await request(`assessments/update/${id}`, 'POST', {
    accessToken: tokens.accessToken,
    body: { closeAt, openAt },
    noHeaderAccept: true,
    refreshToken: tokens.refreshToken,
    shouldAutoLogout: false,
    shouldRefresh: true
  });
  return resp ? await resp.text() : null;
}

export async function deleteAssessment(id: number, tokens: Tokens) {
  const resp = await request(`assessments/${id}`, 'DELETE', {
    accessToken: tokens.accessToken,
    noHeaderAccept: true,
    refreshToken: tokens.refreshToken,
    shouldAutoLogout: false,
    shouldRefresh: true
  });
  return resp;
}

export async function publishAssessment(id: number, togglePublishTo: boolean, tokens: Tokens) {
  const resp = await request(`assessments/publish/${id}`, 'POST', {
    accessToken: tokens.accessToken,
    body: { togglePublishTo },
    noHeaderAccept: true,
    refreshToken: tokens.refreshToken,
    shouldAutoLogout: false,
    shouldRefresh: true
  });
  return resp;
}

export const uploadAssessment = async (file: File, tokens: Tokens, forceUpdate: boolean) => {
  const formData = new FormData();
  formData.append('assessment[file]', file);
  formData.append('forceUpdate', String(forceUpdate));
  const resp = await request(`assessments`, 'POST', {
    accessToken: tokens.accessToken,
    body: formData,
    noContentType: true,
    noHeaderAccept: true,
    refreshToken: tokens.refreshToken,
    shouldAutoLogout: false,
    shouldRefresh: true
  });
  return resp ? await resp.text() : null;
};

export async function getGradingSummary(tokens: Tokens): Promise<GradingSummary | null> {
  const resp = await request('grading/summary', 'GET', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    shouldRefresh: true
  });
  if (!resp || !resp.ok) {
    return null;
  }

  return await resp.json();
}

/**
 * GET /settings/sublanguage
 */
export async function getSublanguage(): Promise<SourceLanguage | null> {
  const resp = await request('settings/sublanguage', 'GET', {
    noHeaderAccept: true,
    shouldAutoLogout: false,
    shouldRefresh: true
  });

  if (!resp || !resp.ok) {
    return null;
  }

  const sublang = (await resp.json()).sublanguage;
  return {
    ...sublang,
    displayName: styliseSublanguage(sublang.chapter, sublang.variant)
  };
}

/**
 * PUT /settings/sublanguage
 */
export async function postSublanguage(chapter: number, variant: string, tokens: Tokens) {
  const resp = await request(`settings/sublanguage`, 'PUT', {
    accessToken: tokens.accessToken,
    body: { chapter, variant },
    noHeaderAccept: true,
    refreshToken: tokens.refreshToken,
    shouldAutoLogout: false,
    shouldRefresh: true
  });
  return resp;
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
async function request(
  path: string,
  method: string,
  opts: RequestOptions
): Promise<Response | null> {
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
    const resp = await fetch(`${Constants.backendUrl}/v1/${path}`, fetchOpts);
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
}

/**
 * Handles display of warning notifications for failed HTTP requests, i.e. those with no response
 * or a HTTP error status code (not 2xx).
 *
 * @param   {(Response|null)}     resp    Result of the failed HTTP request
 * @param   {Map<number, string>} codes   Optional Map for status codes to custom warning messages
 */
export function* handleResponseError(resp: Response | null, codes?: Map<number, string>) {
  // Default: check if the response is null
  if (!resp) {
    yield call(showWarningMessage, "Couldn't reach our servers. Are you online?");
    return;
  }

  let errorMessage: string;

  // Show a generic message if the failed response is missing a status code
  if (!resp.status) {
    errorMessage = 'Something went wrong (received response with no status code)';
  } else if (codes && codes.has(resp.status)) {
    // If the optional map was supplied, check the response against it with its status code
    errorMessage = codes.get(resp.status)!;
  } else {
    // Otherwise match on the status code for common status codes
    switch (resp.status) {
      case 401:
        errorMessage = 'Session expired. Please login again.';
        break;
      default:
        errorMessage = `Something went wrong (got ${resp.status} response)`;
        break;
    }
  }

  yield call(showWarningMessage, errorMessage);
}

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const computeGradingStatus = (
  category: AssessmentCategory,
  submissionStatus: any,
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
