import { call } from 'redux-saga/effects';

import {
  AchievementGoal,
  AchievementItem,
  AchievementUser,
  GoalDefinition,
  GoalProgress
} from '../../features/achievement/AchievementTypes';
import { GradingSummary } from '../../features/dashboard/DashboardTypes';
import { Grading, GradingOverview, GradingQuestion } from '../../features/grading/GradingTypes';
import {
  Device,
  WebSocketEndpointInformation
} from '../../features/remoteExecution/RemoteExecutionTypes';
import { PlaybackData, SourcecastData } from '../../features/sourceRecorder/SourceRecorderTypes';
import { UsernameRoleGroup } from '../../pages/academy/adminPanel/subcomponents/AddUserPanel';
import { store } from '../../pages/createStore';
import {
  backendifyAchievementItem,
  backendifyGoalDefinition,
  frontendifyAchievementGoal,
  frontendifyAchievementItem
} from '../achievement/utils/AchievementBackender';
import { Role } from '../application/ApplicationTypes';
import { ExternalLibraryName } from '../application/types/ExternalTypes';
import {
  AdminPanelCourseRegistration,
  CourseConfiguration,
  CourseRegistration,
  NotificationConfiguration,
  NotificationPreference,
  TimeOption,
  Tokens,
  UpdateCourseConfiguration,
  User
} from '../application/types/SessionTypes';
import {
  Assessment,
  AssessmentConfiguration,
  AssessmentOverview,
  ContestEntry,
  GradingStatus,
  IContestVotingQuestion,
  IProgrammingQuestion,
  QuestionType,
  QuestionTypes
} from '../assessment/AssessmentTypes';
import { Notification } from '../notificationBadge/NotificationBadgeTypes';
import { castLibrary } from '../utils/CastBackend';
import { showWarningMessage } from '../utils/notifications/NotificationsHelper';
import { request } from '../utils/RequestHelper';

/**
 * POST /auth/login
 */
export const postAuth = async (
  code: string,
  providerId: string,
  clientId?: string,
  redirectUri?: string
): Promise<Tokens | null> => {
  const resp = await request('auth/login', 'POST', {
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
};

/**
 * POST /auth/refresh
 */
export const postRefresh = async (refreshToken: string): Promise<Tokens | null> => {
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
};

/**
 * GET /user
 */
export const getUser = async (
  tokens: Tokens
): Promise<{
  user: User | null;
  courseRegistration: CourseRegistration | null;
  courseConfiguration: CourseConfiguration | null;
  assessmentConfigurations: AssessmentConfiguration[] | null;
}> => {
  const resp = await request('user', 'GET', {
    ...tokens
  });
  if (!resp || !resp.ok) {
    return {
      user: null,
      courseRegistration: null,
      courseConfiguration: null,
      assessmentConfigurations: null
    };
  }

  return await resp.json();
};

/**
 * GET /user/latest_viewed_course
 */
export const getLatestCourseRegistrationAndConfiguration = async (
  tokens: Tokens
): Promise<{
  courseRegistration: CourseRegistration | null;
  courseConfiguration: CourseConfiguration | null;
  assessmentConfigurations: AssessmentConfiguration[] | null;
}> => {
  const resp = await request('user/latest_viewed_course', 'GET', {
    ...tokens
  });
  if (!resp || !resp.ok) {
    return {
      courseRegistration: null,
      courseConfiguration: null,
      assessmentConfigurations: null
    };
  }

  return await resp.json();
};

/**
 * PUT /user/latest_viewed_course
 */
export const putLatestViewedCourse = async (
  tokens: Tokens,
  courseId: number
): Promise<Response | null> => {
  const resp = await request(`user/latest_viewed_course`, 'PUT', {
    ...tokens,
    body: { courseId: courseId },
    noHeaderAccept: true
  });

  return resp;
};

/**
 * PUT /courses/{courseId}/user/research_agreement
 */
export const putCourseResearchAgreement = async (
  tokens: Tokens,
  agreedToResearch: boolean
): Promise<Response | null> => {
  const resp = await request(`${courseId()}/user/research_agreement`, 'PUT', {
    ...tokens,
    body: { agreedToResearch },
    noHeaderAccept: true
  });

  return resp;
};

/**
 * POST /config/create
 */
export const postCreateCourse = async (
  tokens: Tokens,
  courseConfig: UpdateCourseConfiguration
): Promise<Response | null> => {
  const resp = await request(`config/create`, 'POST', {
    ...tokens,
    body: { ...courseConfig },
    noHeaderAccept: true
  });

  return resp;
};

/**
 * GET /courses/{courseId}/config
 */
export const getCourseConfig = async (tokens: Tokens): Promise<CourseConfiguration | null> => {
  const resp = await request(`${courseId()}/config`, 'GET', {
    ...tokens
  });

  if (!resp || !resp.ok) {
    return null;
  }

  return resp.json();
};

/**
 * GET /courses/{courseId}/achievements
 *
 * Will be updated after a separate db for student progress is ready
 */
export const getAchievements = async (tokens: Tokens): Promise<AchievementItem[] | null> => {
  const resp = await request(`${courseId()}/achievements`, 'GET', {
    ...tokens
  });

  if (!resp || !resp.ok) {
    return null; // invalid accessToken _and_ refreshToken
  }

  const achievements = await resp.json();

  return achievements.map((achievement: any) => frontendifyAchievementItem(achievement));
};

/**
 * GET /courses/{courseId}/admin/users/{studentCourseRegId}/goals
 */
export const getGoals = async (
  tokens: Tokens,
  studentCourseRegId: number
): Promise<AchievementGoal[] | null> => {
  const resp = await request(`${courseId()}/admin/users/${studentCourseRegId}/goals`, 'GET', {
    ...tokens
  });

  if (!resp || !resp.ok) {
    return null;
  }

  const achievementGoals = await resp.json();

  return achievementGoals.map((goal: any) => frontendifyAchievementGoal(goal));
};

/**
 * GET /courses/{courseId}/self/goals
 */
export const getOwnGoals = async (tokens: Tokens): Promise<AchievementGoal[] | null> => {
  const resp = await request(`${courseId()}/self/goals`, 'GET', {
    ...tokens
  });

  if (!resp || !resp.ok) {
    return null; // invalid accessToken _and_ refreshToken
  }

  const achievementGoals = await resp.json();

  return achievementGoals.map((goal: any) => frontendifyAchievementGoal(goal));
};

/**
 * GET /courses/{courseId}/admin/users
 */
export const getAllUsers = async (tokens: Tokens): Promise<AchievementUser[] | null> => {
  const resp = await request(`${courseId()}/admin/users`, 'GET', {
    ...tokens
  });

  if (!resp || !resp.ok) {
    return null; // invalid accessToken _and_ refreshToken
  }

  const users = await resp.json();

  return users.map(
    (user: any): AchievementUser => ({
      name: user.name,
      courseRegId: user.courseRegId,
      group: user.group,
      username: user.username
    })
  );
};

/**
 * PUT /courses/{courseId}/admin/achievements
 */
export async function bulkUpdateAchievements(
  achievements: AchievementItem[],
  tokens: Tokens
): Promise<Response | null> {
  const resp = await request(`${courseId()}/admin/achievements`, 'PUT', {
    accessToken: tokens.accessToken,
    body: { achievements: achievements.map(achievement => backendifyAchievementItem(achievement)) },
    noHeaderAccept: true,
    refreshToken: tokens.refreshToken
  });

  return resp;
  // TODO: confirmation notification
}

/**
 * PUT /courses/{courseId}/admin/goals
 */
export async function bulkUpdateGoals(
  goals: GoalDefinition[],
  tokens: Tokens
): Promise<Response | null> {
  const resp = await request(`${courseId()}/admin/goals`, 'PUT', {
    accessToken: tokens.accessToken,
    body: {
      goals: goals.map(goal => backendifyGoalDefinition(goal))
    },
    noHeaderAccept: true,
    refreshToken: tokens.refreshToken
  });

  return resp;
  // TODO: confirmation notification
}

/**
 * POST /courses/{courseId}/self/goals/{goalUuid}/progress
 */
export const updateOwnGoalProgress = async (
  progress: GoalProgress,
  tokens: Tokens
): Promise<Response | null> => {
  const resp = await request(`${courseId()}/self/goals/${progress.uuid}/progress`, 'POST', {
    ...tokens,
    body: { progress: progress },
    noHeaderAccept: true
  });

  return resp;
};

/**
 * POST /courses/{courseId}/admin/users/{studentCourseRegId}/goals/{goalUuid}/progress
 */
export const updateGoalProgress = async (
  studentCourseRegId: number,
  progress: GoalProgress,
  tokens: Tokens
): Promise<Response | null> => {
  const resp = await request(
    `${courseId()}/admin/users/${studentCourseRegId}/goals/${progress.uuid}/progress`,
    'POST',
    {
      ...tokens,
      body: { progress: progress },
      noHeaderAccept: true
    }
  );

  return resp;
};

/**
 * DELETE /courses/{courseId}/admin/achievements/{achievementUuid}
 */
export const removeAchievement = async (uuid: string, tokens: Tokens): Promise<Response | null> => {
  const resp = await request(`${courseId()}/admin/achievements/${uuid}`, 'DELETE', {
    ...tokens,
    body: { uuid: uuid },
    noHeaderAccept: true
  });

  return resp;
};

/**
 * DELETE /courses/{courseId}/admin/goals/{goalUuid}
 */
export const removeGoal = async (uuid: string, tokens: Tokens): Promise<Response | null> => {
  const resp = await request(`${courseId()}/admin/goals/${uuid}`, 'DELETE', {
    ...tokens,
    body: { uuid: uuid },
    noHeaderAccept: true
  });

  return resp;
};

/**
 * GET /courses/{courseId}/assessments
 */
export const getAssessmentOverviews = async (
  tokens: Tokens
): Promise<AssessmentOverview[] | null> => {
  const resp = await request(`${courseId()}/assessments`, 'GET', {
    ...tokens
  });
  if (!resp || !resp.ok) {
    return null; // invalid accessToken _and_ refreshToken
  }
  const assessmentOverviews = await resp.json();
  return assessmentOverviews.map((overview: any) => {
    overview.gradingStatus = computeGradingStatus(
      overview.isManuallyGraded,
      overview.status,
      overview.gradedCount,
      overview.questionCount
    );
    delete overview.gradedCount;
    delete overview.questionCount;

    return overview as AssessmentOverview;
  });
};

/**
 * GET /courses/{courseId}/user/total_xp
 */
export const getTotalXp = async (tokens: Tokens, courseRegId?: number): Promise<number | null> => {
  let resp;
  if (courseRegId !== undefined) {
    // If courseRegId is provided, get the total XP of a specific student
    resp = await request(`${courseId()}/admin/users/${courseRegId}/total_xp`, 'GET', {
      ...tokens
    });
  } else {
    // Otherwise, get the total XP of the current user
    resp = await request(`${courseId()}/user/total_xp`, 'GET', {
      ...tokens
    });
  }

  if (!resp || !resp.ok) {
    return null; // invalid accessToken _and_ refreshToken
  }
  const totalXp = await resp.json();
  return totalXp;
};

/**
 * GET /courses/{courseId}/admin/users/total_xp
 */
export const getAllUserXp = async (tokens: Tokens): Promise<number | null> => {
  const resp = await request(`${courseId()}/admin/users/total_xp`, 'GET', {
    ...tokens
  });
  if (!resp || !resp.ok) {
    return null; // invalid accessToken _and_ refreshToken
  }
  const totalXp = await resp.json();
  return totalXp;
};

/**
 * GET /courses/{courseId}/admin/users/{course_reg_id}/assessments
 */
export const getUserAssessmentOverviews = async (
  courseRegId: number,
  tokens: Tokens
): Promise<AssessmentOverview[] | null> => {
  const resp = await request(`${courseId()}/admin/users/${courseRegId}/assessments`, 'GET', {
    ...tokens
  });
  if (!resp || !resp.ok) {
    return null; // invalid accessToken _and_ refreshToken
  }
  const assessmentOverviews = await resp.json();
  return assessmentOverviews.map((overview: any) => {
    overview.gradingStatus = computeGradingStatus(
      overview.isManuallyGraded,
      overview.status,
      overview.gradedCount,
      overview.questionCount
    );
    delete overview.gradedCount;
    delete overview.questionCount;

    return overview as AssessmentOverview;
  });
};

/**
 * GET /courses/{courseId}/assessments/{assessmentId}
 * Note: if assessment is password-protected, a corresponding unlock request will be sent to
 * POST /courses/{courseId}/assessments/{assessmentId}/unlock
 */
export const getAssessment = async (
  assessmentId: number,
  tokens: Tokens,
  courseRegId?: number
): Promise<Assessment | null> => {
  let resp;
  if (courseRegId !== undefined) {
    // If courseRegId is provided, we are getting the assessment for another user as an admin
    resp = await request(
      `${courseId()}/admin/users/${courseRegId}/assessments/${assessmentId}`,
      'GET',
      {
        ...tokens
      }
    );
  } else {
    // Otherwise, we are getting the assessment for the current user
    resp = await request(`${courseId()}/assessments/${assessmentId}`, 'GET', {
      ...tokens
    });
  }

  // Attempt to load password-protected assessment
  while (resp && resp.status === 403) {
    const input = window.prompt('Please enter password.', '');
    if (!input) {
      resp = null;
      window.history.back();
      return null;
    }

    resp = await request(`${courseId()}/assessments/${assessmentId}/unlock`, 'POST', {
      ...tokens,
      body: {
        password: input
      }
    });
  }

  if (!resp || !resp.ok) {
    return null;
  }

  const assessment = (await resp.json()) as Assessment;

  assessment.questions = assessment.questions.map(q => {
    if (q.type === QuestionTypes.programming) {
      const question = q as IProgrammingQuestion;
      question.autogradingResults = question.autogradingResults || [];
      question.prepend = question.prepend || '';
      question.postpend = question.postpend || '';
      question.testcases = question.testcases || [];
      q = question;
    }

    if (q.type === QuestionTypes.voting) {
      const question = q as IContestVotingQuestion;
      question.prepend = question.prepend || '';
      question.postpend = question.postpend || '';
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
 * POST /courses/{courseId}/assessments/question/{questionId}/answer
 */
export const postAnswer = async (
  id: number,
  answer: string | number | ContestEntry[],
  tokens: Tokens
): Promise<Response | null> => {
  const resp = await request(`${courseId()}/assessments/question/${id}/answer`, 'POST', {
    ...tokens,
    body: typeof answer == 'object' ? { answer: answer } : { answer: `${answer}` },
    noHeaderAccept: true
  });
  return resp;
};

/**
 * POST /courses/{courseId}/assessments/{assessmentId}/submit
 */
export const postAssessment = async (id: number, tokens: Tokens): Promise<Response | null> => {
  const resp = await request(`${courseId()}/assessments/${id}/submit`, 'POST', {
    ...tokens,
    noHeaderAccept: true
  });

  return resp;
};

/*
 * GET /courses/{courseId}/admin/grading
 */
export const getGradingOverviews = async (
  tokens: Tokens,
  group: boolean
): Promise<GradingOverview[] | null> => {
  const resp = await request(`${courseId()}/admin/grading?group=${group}`, 'GET', {
    ...tokens
  });
  if (!resp) {
    return null; // invalid accessToken _and_ refreshToken
  }
  const gradingOverviews = await resp.json();
  return gradingOverviews
    .map((overview: any) => {
      const gradingOverview: GradingOverview = {
        assessmentId: overview.assessment.id,
        assessmentNumber: overview.assessment.assessmentNumber,
        assessmentName: overview.assessment.title,
        assessmentType: overview.assessment.type,
        studentId: overview.student.id,
        studentUsername: overview.student.username,
        studentName: overview.student.name,
        submissionId: overview.id,
        submissionStatus: overview.status,
        groupName: overview.student.groupName,
        groupLeaderId: overview.student.groupLeaderId,
        // Grading Status
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
        overview.assessment.isManuallyGraded,
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
 * GET /courses/{courseId}/admin/grading/{submissionId}
 */
export const getGrading = async (submissionId: number, tokens: Tokens): Promise<Grading | null> => {
  const resp = await request(`${courseId()}/admin/grading/${submissionId}`, 'GET', {
    ...tokens
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
        id: question.id,
        library: castLibrary(question.library),
        solution: gradingQuestion.solution || question.solution || null,
        solutionTemplate: question.solutionTemplate,
        prepend: question.prepend || '',
        postpend: question.postpend || '',
        testcases: question.testcases || [],
        type: question.type as QuestionType,
        maxXp: question.maxXp
      },
      student,
      grade: {
        xp: grade.xp,
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
 * POST /courses/{courseId}/admin/grading/{submissionId}/{questionId}
 */
export const postGrading = async (
  submissionId: number,
  questionId: number,
  xpAdjustment: number,
  tokens: Tokens,
  comments?: string
): Promise<Response | null> => {
  const resp = await request(`${courseId()}/admin/grading/${submissionId}/${questionId}`, 'POST', {
    ...tokens,
    body: {
      grading: {
        xpAdjustment,
        comments
      }
    },
    noHeaderAccept: true
  });

  return resp;
};

/**
 * POST /courses/{courseId}/admin/grading/{submissionId}/autograde
 */
export const postReautogradeSubmission = async (
  submissionId: number,
  tokens: Tokens
): Promise<Response | null> => {
  const resp = await request(`${courseId()}/admin/grading/${submissionId}/autograde`, 'POST', {
    ...tokens,
    noHeaderAccept: true
  });

  return resp;
};

/**
 * POST /courses/{courseId}/admin/grading/{submissionId}/{questionId}/autograde
 */
export const postReautogradeAnswer = async (
  submissionId: number,
  questionId: number,
  tokens: Tokens
): Promise<Response | null> => {
  const resp = await request(
    `${courseId()}/admin/grading/${submissionId}/${questionId}/autograde`,
    'POST',
    {
      ...tokens,
      noHeaderAccept: true
    }
  );

  return resp;
};

/**
 * POST /courses/{courseId}/admin/grading/{submissionId}/unsubmit
 */
export const postUnsubmit = async (
  submissionId: number,
  tokens: Tokens
): Promise<Response | null> => {
  const resp = await request(`${courseId()}/admin/grading/${submissionId}/unsubmit`, 'POST', {
    ...tokens,
    noHeaderAccept: true
  });

  return resp;
};

/**
 * GET /courses/{courseId}/notifications
 */
export const getNotifications = async (tokens: Tokens): Promise<Notification[]> => {
  const resp: Response | null = await request(`${courseId()}/notifications`, 'GET', {
    ...tokens
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
      assessment_type: notification.assessment ? notification.assessment.type : undefined,
      assessment_title: notification.assessment ? notification.assessment.title : undefined,
      submission_id: notification.submission_id || undefined
    } as Notification;
  });

  return notifications;
};

/**
 * POST /courses/{courseId}/notifications/acknowledge
 */
export const postAcknowledgeNotifications = async (
  tokens: Tokens,
  ids: number[]
): Promise<Response | null> => {
  const resp: Response | null = await request(`${courseId()}/notifications/acknowledge`, 'POST', {
    ...tokens,
    body: { notificationIds: ids }
  });

  return resp;
};

/**
 * GET /courses/{courseId}/sourcecast
 */
export const getSourcecastIndex = async (tokens: Tokens): Promise<SourcecastData[] | null> => {
  const resp = await request(`${courseId()}/sourcecast`, 'GET', {
    ...tokens
  });
  if (!resp || !resp.ok) {
    return null;
  }

  return await resp.json();
};

/**
 * POST /courses/{courseId}/admin/sourcecast
 */
export const postSourcecast = async (
  title: string,
  description: string,
  uid: string,
  audio: Blob,
  playbackData: PlaybackData,
  tokens: Tokens
): Promise<Response | null> => {
  const formData = new FormData();
  const filename = Date.now().toString() + '.wav';
  formData.append('sourcecast[title]', title);
  formData.append('sourcecast[description]', description);
  formData.append('sourcecast[uid]', uid);
  formData.append('sourcecast[audio]', audio, filename);
  formData.append('sourcecast[playbackData]', JSON.stringify(playbackData));
  const resp = await request(`${courseId()}/admin/sourcecast`, 'POST', {
    ...tokens,
    body: formData,
    noContentType: true,
    noHeaderAccept: true
  });

  return resp;
};

/**
 * DELETE /courses/{courseId}/admin/sourcecast/{sourcecastId}
 */
export const deleteSourcecastEntry = async (
  id: number,
  tokens: Tokens
): Promise<Response | null> => {
  const resp = await request(`${courseId()}/admin/sourcecast/${id}`, 'DELETE', {
    ...tokens,
    noHeaderAccept: true
  });

  return resp;
};

/**
 * POST /courses/{courseId}/admin/assessments/{assessmentId}
 */
export const updateAssessment = async (
  id: number,
  body: { openAt?: string; closeAt?: string; isPublished?: boolean },
  tokens: Tokens
): Promise<Response | null> => {
  const resp = await request(`${courseId()}/admin/assessments/${id}`, 'POST', {
    ...tokens,
    body: body,
    noHeaderAccept: true
  });

  return resp;
};

/**
 * DELETE /courses/{courseId}/admin/assessments/{assessmentId}
 */
export const deleteAssessment = async (id: number, tokens: Tokens): Promise<Response | null> => {
  const resp = await request(`${courseId()}/admin/assessments/${id}`, 'DELETE', {
    ...tokens,
    noHeaderAccept: true
  });

  return resp;
};

/**
 * POST /courses/{courseId}/admin/assessments
 */
export const uploadAssessment = async (
  file: File,
  tokens: Tokens,
  forceUpdate: boolean,
  assessmentConfigId: number
): Promise<Response | null> => {
  const formData = new FormData();
  formData.append('assessment[file]', file);
  formData.append('forceUpdate', String(forceUpdate));
  formData.append('assessmentConfigId', String(assessmentConfigId));
  const resp = await request(`${courseId()}/admin/assessments`, 'POST', {
    ...tokens,
    body: formData,
    noContentType: true,
    noHeaderAccept: true
  });

  return resp;
};

/**
 * GET /courses/{courseId}/admin/grading/summary
 */
export const getGradingSummary = async (tokens: Tokens): Promise<GradingSummary | null> => {
  const resp = await request(`${courseId()}/admin/grading/summary`, 'GET', {
    ...tokens
  });
  if (!resp || !resp.ok) {
    return null;
  }

  return await resp.json();
};

/**
 * PUT /courses/{courseId}/admin/config
 */
export const putCourseConfig = async (
  tokens: Tokens,
  courseConfig: UpdateCourseConfiguration
): Promise<Response | null> => {
  const resp = await request(`${courseId()}/admin/config`, 'PUT', {
    ...tokens,
    body: courseConfig,
    noHeaderAccept: true
  });

  return resp;
};

/**
 * GET /courses/{courseId}/admin/config/assessment_configs
 */
export const getAssessmentConfigs = async (
  tokens: Tokens
): Promise<AssessmentConfiguration[] | null> => {
  const resp = await request(`${courseId()}/admin/config/assessment_configs`, 'GET', {
    ...tokens
  });
  if (!resp || !resp.ok) {
    return null;
  }

  return await resp.json();
};

/**
 * PUT /courses/{courseId}/admin/config/assessment_configs
 */
export const putAssessmentConfigs = async (
  tokens: Tokens,
  assessmentConfigs: AssessmentConfiguration[],
  overrideCourseId?: number
): Promise<Response | null> => {
  const resp = await request(
    `${
      overrideCourseId != null ? `courses/${overrideCourseId}` : courseId()
    }/admin/config/assessment_configs`,
    'PUT',
    {
      ...tokens,
      body: { assessmentConfigs },
      noHeaderAccept: true
    }
  );

  return resp;
};

export const putNotificationConfigs = async (
  tokens: Tokens,
  notificationConfigs: NotificationConfiguration[]
) => {
  return await request(`notifications/config`, 'PUT', {
    ...tokens,
    body: notificationConfigs,
    noHeaderAccept: true
  });
};

export const putTimeOption = async (
  tokens: Tokens,
  timeOption: TimeOption
): Promise<Response | null> => {
  const resp = await request(`notifications/options/${timeOption.id}`, 'PUT', {
    ...tokens,
    body: {
      isDefault: timeOption.isDefault
    },
    noHeaderAccept: true
  });

  return resp;
};

export const postTimeOption = async (
  tokens: Tokens,
  timeOption: TimeOption,
  notificationConfigId: number
): Promise<Response | null> => {
  const resp = await request(`notifications/options`, 'POST', {
    ...tokens,
    body: {
      isDefault: timeOption.isDefault,
      minutes: timeOption.minutes,
      notification_config_id: notificationConfigId
    },
    noHeaderAccept: true
  });

  return resp;
};

/**
 * DELETE /courses/{courseId}/admin/config/assessment_config/{assessmentConfigId}
 */
export const removeAssessmentConfig = async (
  tokens: Tokens,
  assessmentConfig: AssessmentConfiguration
): Promise<Response | null> => {
  const resp = await request(
    `${courseId()}/admin/config/assessment_config/${assessmentConfig.assessmentConfigId}`,
    'DELETE',
    {
      ...tokens,
      noHeaderAccept: true
    }
  );

  return resp;
};

export const removeTimeOptions = async (
  tokens: Tokens,
  timeOptionIds: number[]
): Promise<Response | null> => {
  const resp = await request(`notifications/options`, 'DELETE', {
    ...tokens,
    body: timeOptionIds,
    noHeaderAccept: true
  });

  return resp;
};

export const putTimeOptions = async (
  tokens: Tokens,
  timeOptions: TimeOption[]
): Promise<Response | null> => {
  const resp = await request(`notifications/options`, 'PUT', {
    ...tokens,
    body: timeOptions,
    noHeaderAccept: true
  });

  return resp;
};

export const getNotificationConfigs = async (
  tokens: Tokens
): Promise<NotificationConfiguration[] | null> => {
  const resp = await request(`notifications/config/${courseIdWithoutPrefix()}`, 'GET', {
    ...tokens
  });
  if (!resp || !resp.ok) {
    return null;
  }

  return await resp.json();
};

export const getConfigurableNotificationConfigs = async (
  tokens: Tokens,
  courseRegId: number
): Promise<NotificationConfiguration[] | null> => {
  const resp = await request(`notifications/config/user/${courseRegId}`, 'GET', {
    ...tokens
  });
  if (!resp || !resp.ok) {
    return null;
  }

  return await resp.json();
};

export const postNotificationPreference = async (
  tokens: Tokens,
  notiPref: NotificationPreference,
  notificationConfigId: number,
  courseRegId: number
): Promise<Response | null> => {
  const resp = await request(`notifications/preference`, 'POST', {
    ...tokens,
    body: {
      is_enabled: notiPref.isEnabled,
      time_option_id: notiPref.timeOptionId,
      notification_config_id: notificationConfigId,
      course_reg_id: courseRegId
    },
    noHeaderAccept: true
  });

  return resp;
};

export const putNotificationPreferences = async (
  tokens: Tokens,
  notiPrefs: NotificationPreference[],
  courseRegId: number
): Promise<Response | null> => {
  const resp = await request(`notifications/preferences`, 'PUT', {
    ...tokens,
    body: notiPrefs.map(pref => {
      return { ...pref, courseRegId: courseRegId };
    }),
    noHeaderAccept: true
  });

  return resp;
};

/**
 * GET /courses/{courseId}/admin/users
 */
export const getUserCourseRegistrations = async (
  tokens: Tokens
): Promise<AdminPanelCourseRegistration[] | null> => {
  const resp = await request(`${courseId()}/admin/users`, 'GET', {
    ...tokens
  });
  if (!resp || !resp.ok) {
    return null;
  }

  return await resp.json();
};

/**
 * PUT /courses/{courseId}/admin/users
 */
export const putNewUsers = async (
  tokens: Tokens,
  users: UsernameRoleGroup[],
  provider: string
): Promise<Response | null> => {
  const resp = await request(`${courseId()}/admin/users`, 'PUT', {
    ...tokens,
    body: { users, provider },
    noHeaderAccept: true
  });

  return resp;
};

/**
 * PUT /courses/{courseId}/admin/users/{courseRegId}/role
 */
export const putUserRole = async (
  tokens: Tokens,
  courseRegId: number,
  role: Role
): Promise<Response | null> => {
  const resp = await request(`${courseId()}/admin/users/${courseRegId}/role`, 'PUT', {
    ...tokens,
    body: { role },
    noHeaderAccept: true
  });

  return resp;
};

/**
 * DELETE /courses/{courseId}/admin/users/{courseRegId}
 */
export const removeUserCourseRegistration = async (
  tokens: Tokens,
  courseRegId: number
): Promise<Response | null> => {
  const resp = await request(`${courseId()}/admin/users/${courseRegId}`, 'DELETE', {
    ...tokens,
    noHeaderAccept: true
  });

  return resp;
};

/**
 * GET /devices
 */
export async function fetchDevices(tokens: Tokens): Promise<Device | null> {
  const resp = await request(`devices`, 'GET', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  });

  return resp && resp.ok ? resp.json() : null;
}

/**
 * GET /devices/:id/ws_endpoint
 */
export async function getDeviceWSEndpoint(
  device: Device,
  tokens: Tokens
): Promise<WebSocketEndpointInformation | null> {
  const resp = await request(`devices/${device.id}/ws_endpoint`, 'GET', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  });

  return resp && resp.ok ? resp.json() : null;
}

/**
 * POST /devices
 */
export async function registerDevice(device: Omit<Device, 'id'>, tokens?: Tokens): Promise<Device> {
  tokens = fillTokens(tokens);
  const resp = await request(`devices`, 'POST', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    body: device
  });

  if (!resp) {
    throw new Error('Unknown error occurred.');
  }

  if (!resp.ok) {
    const message = await resp.text();
    throw new Error(`Failed to register: ${message}`);
  }

  return resp.json();
}

/**
 * POST /devices/:id
 */
export async function editDevice(
  device: Pick<Device, 'id' | 'title'>,
  tokens?: Tokens
): Promise<boolean> {
  tokens = fillTokens(tokens);
  const resp = await request(`devices/${device.id}`, 'POST', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    body: { title: device.title }
  });

  if (!resp) {
    throw new Error('Unknown error occurred.');
  }

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
  const resp = await request(`devices/${device.id}`, 'DELETE', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  });

  if (!resp) {
    throw new Error('Unknown error occurred.');
  }

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
 * Handles display of warning notifications for failed HTTP requests, i.e. those with no response
 * or a HTTP error status code (not 2xx).
 *
 * @param {(Response|null)} resp Result of the failed HTTP request
 */
export function* handleResponseError(resp: Response | null): any {
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

const computeGradingStatus = (
  isManuallyGraded: boolean,
  submissionStatus: any,
  numGraded: number,
  numQuestions: number
): GradingStatus =>
  // isGraded refers to whether the assessment type is graded or not, as specified in
  // the respective assessment configuration
  isManuallyGraded && submissionStatus === 'submitted'
    ? numGraded === 0
      ? 'none'
      : numGraded === numQuestions
      ? 'graded'
      : 'grading'
    : 'excluded';

const courseId: () => string = () => {
  const id = store.getState().session.courseId;
  if (id) {
    return `courses/${id}`;
  } else {
    // TODO: Rewrite this logic
    showWarningMessage(`No course selected!`, 1000);
    throw new Error(`No course selected`);
  }
};

export const courseIdWithoutPrefix: () => string = () => {
  const id = store.getState().session.courseId;
  if (id) {
    return `${id}`;
  } else {
    // TODO: Rewrite this logic
    showWarningMessage(`No course selected!`, 1000);
    throw new Error(`No course selected`);
  }
};
