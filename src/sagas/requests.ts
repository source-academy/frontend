/*eslint no-eval: "error"*/
/*eslint-env browser*/
import { call } from 'redux-saga/effects';

import * as actions from '../actions';
import {
  Grading,
  GradingOverview,
  GradingQuestion
} from '../components/academy/grading/gradingShape';
import {
  AssessmentCategory,
  ExternalLibraryName,
  IAssessment,
  IAssessmentOverview,
  IProgrammingQuestion,
  QuestionType,
  QuestionTypes
} from '../components/assessment/assessmentShape';
import { MaterialData } from '../components/material/materialShape';
import { Notification } from '../components/notification/notificationShape';
import { IPlaybackData, ISourcecastData } from '../components/sourcecast/sourcecastShape';
import { store } from '../createStore';
import { castLibrary } from '../utils/castBackend';
import { BACKEND_URL } from '../utils/constants';
import { showWarningMessage } from '../utils/notification';

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
export async function postAuth(luminusCode: string): Promise<Tokens | null> {
  const resp = await request('auth', 'POST', {
    body: { login: { luminus_code: luminusCode } },
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
 * GET /assessments
 */
export async function getAssessmentOverviews(
  tokens: Tokens
): Promise<IAssessmentOverview[] | null> {
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

    return overview as IAssessmentOverview;
  });
}

/**
 * GET /assessments/${assessmentId}
 */
export async function getAssessment(id: number, tokens: Tokens): Promise<IAssessment | null> {
  const resp = await request(`assessments/${id}`, 'GET', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    shouldRefresh: true
  });
  if (!resp || !resp.ok) {
    return null;
  }
  const assessment = (await resp.json()) as IAssessment;
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
  return gradingOverviews.map((overview: any) => {
    const gradingOverview: GradingOverview = {
      assessmentId: overview.assessment.id,
      assessmentName: overview.assessment.title,
      assessmentCategory: capitalise(overview.assessment.type) as AssessmentCategory,
      studentId: overview.student.id,
      studentName: overview.student.name,
      submissionId: overview.id,
      submissionStatus: overview.status,
      groupName: overview.groupName,
      // Grade
      initialGrade: overview.grade,
      gradeAdjustment: overview.adjustment,
      currentGrade: overview.grade + overview.adjustment,
      maxGrade: overview.assessment.maxGrade,
      gradingStatus: overview.gradingStatus,
      questionCount: overview.questionCount,
      gradedCount: overview.gradedCount,
      // XP
      initialXp: overview.xp,
      xpAdjustment: overview.xpAdjustment,
      currentXp: overview.xp + overview.xpAdjustment,
      maxXp: overview.assessment.maxXp,
      xpBonus: overview.xpBonus
    };
    return gradingOverview;
  });
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

    return {
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
 * POST /chat/notify
 */
export async function postNotify(tokens: Tokens, assessmentId?: number, submissionId?: number) {
  await request(`chat/notify`, 'POST', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    body: {
      assessmentId,
      submissionId
    },
    shouldAutoLogout: false
  });
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
export async function getSourcecastIndex(tokens: Tokens): Promise<ISourcecastData[] | null> {
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
  playbackData: IPlaybackData,
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

/**
 * DELETE /material
 */
export async function deleteMaterial(id: number, tokens: Tokens) {
  const resp = await request(`material/${id}`, 'DELETE', {
    accessToken: tokens.accessToken,
    noHeaderAccept: true,
    refreshToken: tokens.refreshToken,
    shouldAutoLogout: false,
    shouldRefresh: true
  });
  return resp;
}

/**
 * GET /material
 */
export async function getMaterialIndex(id: number, tokens: Tokens): Promise<MaterialData[] | null> {
  const url = id === -1 ? `material` : `material?id=${id}`;
  const resp = await request(url, 'GET', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    shouldAutoLogout: false,
    shouldRefresh: true
  });
  if (resp && resp.ok) {
    return await resp.json();
  } else {
    return null;
  }
}

/**
 * POST /material
 */
export const postMaterial = async (
  file: File,
  title: string,
  description: string,
  parentId: number,
  tokens: Tokens
) => {
  const formData = new FormData();
  formData.append('material[file]', file, title);
  formData.append('material[title]', title);
  formData.append('material[description]', description);
  if (parentId !== -1) {
    formData.append('material[parentId]', parentId.toString());
  }
  const resp = await request(`material`, 'POST', {
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

/**
 * DELETE /category
 */
export async function deleteMaterialFolder(id: number, tokens: Tokens) {
  const resp = await request(`category/${id}`, 'DELETE', {
    accessToken: tokens.accessToken,
    noHeaderAccept: true,
    refreshToken: tokens.refreshToken,
    shouldAutoLogout: false,
    shouldRefresh: true
  });
  return resp;
}

/**
 * POST /category
 */
export const postMaterialFolder = async (title: string, parentId: number, tokens: Tokens) => {
  const resp = await request(`category`, 'POST', {
    accessToken: tokens.accessToken,
    body: { title, parentId: parentId === -1 ? null : parentId },
    noHeaderAccept: true,
    refreshToken: tokens.refreshToken,
    shouldAutoLogout: false,
    shouldRefresh: true
  });
  return resp;
};

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
    const resp = await fetch(`${BACKEND_URL}/v1/${path}`, fetchOpts);
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
