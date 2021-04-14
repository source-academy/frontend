/**
 * Assessment type
 */
export enum AssessmentType {
  Mission = 'mission',
  Sidequest = 'sidequest',
  Path = 'path',
  Contest = 'contest',
  Practical = 'practical'
}

export interface AssessmentInfo {
  /** assessment id */
  id: number;

  /** The max grade for this assessment */
  maxGrade: number;

  /** The max xp for this assessment */
  maxXp: number;

  /** number of questions in this assessment */
  questionCount: number;

  /** Mission title */
  title: string;

  /** Either mission/sidequest/path/contest */
  type: AssessmentType;
}

/**
 * A list of all assessments
 */
export type AssessmentsList = AssessmentOverview[];

/**
 * Goals, including user's progress
 */
export interface GoalWithProgress {
  /** Whether the goal has been completed by the user */
  completed: boolean;

  /** Total EXP for this goal */
  maxXp: number;

  /** Goal satisfication information */
  meta?: object;

  /** Text to show when goal is completed */
  text?: string;

  /** Goal type */
  type?: string;

  /**
   * Goal UUID
   * @format uuid
   */
  uuid?: string;

  /** EXP currently attained by the user for this goal */
  xp: number;
}

export interface AutogradingResult {
  actual?: string;
  expected?: string;

  /** One of pass/fail/error */
  resultType?: AutogradingResultType;
}

export interface AssessmentOverview {
  /**
   * The closing date
   * @format date-time
   */
  closeAt: string;

  /** The URL to the cover picture */
  coverImage: string;

  /** The grade earned for this assessment */
  grade: number;

  /** The number of answers in the submission which have been graded */
  gradedCount: number;

  /** The assessment ID */
  id: number;

  /** Is the assessment published? */
  isPublished: boolean;

  /** The maximum grade for this assessment */
  maxGrade: number;

  /** The maximum XP for this assessment */
  maxXp: number;

  /** The string identifying the relative position of this assessment */
  number: string;

  /**
   * The opening date
   * @format date-time
   */
  openAt: string;

  /** Is this an private assessment? */
  private: boolean;

  /** The number of questions in this assessment */
  questionCount: number;

  /** The reading for this assessment */
  reading?: string;

  /** Short summary */
  shortSummary: string;

  /** One of 'not_attempted/attempting/attempted/submitted' indicating whether the assessment has been attempted by the current user */
  status: AssessmentStatus;

  /** The story that should be shown for this assessment */
  story?: string;

  /** The title of the assessment */
  title: string;

  /** The assessment type */
  type: AssessmentType;

  /** The XP earned for this assessment */
  xp: number;
}

export interface RegisterDevicePayload {
  /** Device unique secret */
  secret: string;

  /** User-given device title */
  title: string;

  /** User type */
  type: string;
}

export enum SourceVariant {
  Default = 'default',
  Concurrent = 'concurrent',
  Gpu = 'gpu',
  Lazy = 'lazy',
  NonDet = 'non-det',
  Wasm = 'wasm'
}

export interface StudentInfo {
  /** user id of group leader */
  groupLeaderId?: number;

  /** name of student's group */
  groupName?: string;

  /** student id */
  id: number;

  /** student name */
  name: string;
}

/**
 * A path to an asset
 * @example assets/hello.png
 */
export type Asset = object;

export interface Assessment {
  /** The assessment ID */
  id: number;

  /** Long summary */
  longSummary: string;

  /** The URL to the assessment pdf */
  missionPDF?: string;

  /** The string identifying the relative position of this assessment */
  number: string;

  /** The list of questions for this assessment */
  questions?: Questions;

  /** The reading for this assessment */
  reading?: string;

  /** The story that should be shown for this assessment */
  story?: string;

  /** The title of the assessment */
  title: string;

  /** The assessment type */
  type: AssessmentType;
}

export interface Grade {
  /** Grade adjustment given */
  adjustment?: number;

  /** Comments given by grader */
  comments?: string;

  /** Grade awarded by autograder */
  grade?: number;

  /**
   * Last graded at
   * @format date-time
   */
  gradedAt?: string;
  grader?: GraderInfo;

  /** XP awarded by autograder */
  xp?: number;

  /** XP adjustment given */
  xpAdjustment: number;
}

export interface Tokens {
  /** Access token with TTL of 1 hour */
  access_token: string;

  /** Refresh token with TTL of 1 week */
  refresh_token: string;
}

export enum NotificationType {
  New = 'new',
  Deadline = 'deadline',
  Autograded = 'autograded',
  Graded = 'graded',
  Submitted = 'submitted',
  Unsubmitted = 'unsubmitted',
  NewMessage = 'new_message'
}

export interface Question {
  /** Previous answer for this question (string/int) depending on question type */
  answer: string | number;
  autogradingResults?: AutogradingResult[];

  /** The status of the autograder */
  autogradingStatus?: AutogradingStatus;

  /** MCQ choices if question type is mcq */
  choices?: MCQChoice[];

  /** String of comments given to a student's answer */
  comments?: string;

  /** The question content */
  content: string;

  /** Final grade given to this question. Only provided for students. */
  grade?: number;

  /**
   * Last graded at
   * @format date-time
   */
  gradedAt?: string;
  grader?: GraderInfo;

  /** The question ID */
  id: number;

  /** The library used for this question */
  library?: Library;

  /** The max grade for this question */
  maxGrade: number;

  /** The max xp for this question */
  maxXp: number;

  /** Postpend program for programming questions */
  postpend?: string;

  /** Prepend program for programming questions */
  prepend?: string;

  /** Solution to a mcq question if it belongs to path assessment */
  solution?: number;

  /** Solution template for programming questions */
  solutionTemplate?: string;

  /** Testcase programs for programming questions */
  testcases?: Testcase[];

  /** The question type (mcq/programming) */
  type: string;

  /** Final XP given to this question. Only provided for students. */
  xp?: number;
}

/**
 * Goals, including user's progress
 */
export interface Goal {
  /** Total EXP for this goal */
  maxXp?: number;

  /** Goal satisfication information */
  meta?: object;

  /** Text to show when goal is completed */
  text?: string;

  /** Goal type */
  type?: string;

  /**
   * Goal UUID
   * @format uuid
   */
  uuid?: string;
}

export interface UserStory {
  /** Whether story should be played (false indicates story field should only be used to fetch assets, display open world view) */
  playStory?: boolean;

  /** Name of story to be displayed to current user. May only be null before start of semester when no assessments are open */
  story?: string;
}

/**
 * A URL to an uploaded asset
 * @example https://bucket-name.s3.amazonaws.com/assets/hello.png
 */
export type AssetURL = string;

export interface Testcase {
  answer?: string;
  program?: string;
  score?: number;

  /** One of public/hidden/private */
  type?: TestcaseType;
}

export interface GraderInfo {
  /** grader id */
  id: number;

  /** grader name */
  name: string;
}

export interface WebSocketEndpoint {
  /** Client name prefix to use */
  clientNamePrefix: string;

  /** Endpoint URL */
  endpoint: string;

  /** Device name */
  thingName: string;
}

export enum AutogradingResultType {
  Pass = 'pass',
  Fail = 'fail',
  Error = 'error'
}

export interface EditDevicePayload {
  /** User-given device title */
  title: string;
}

/**
 * An array of asset paths
 */
export type Assets = Asset[];

/**
 * @example {"chapter":2,"variant":"lazy"}
 */
export interface AdminSublanguage {
  /**
   * Chapter number from 1 to 4
   * @min 1
   * @max 4
   */
  chapter: number;

  /** Variant name */
  variant: SourceVariant;
}

export enum TestcaseType {
  Public = 'public',
  Hidden = 'hidden',
  Private = 'private'
}

export interface AdminUpdateAssessmentPayload {
  /** Open date */
  closeAt?: string;

  /** Whether the assessment is published */
  isPublished?: boolean;

  /** Close date */
  openAt?: string;
}

export type UserGameStates = object;

export interface RefreshToken {
  /** Refresh token */
  refresh_token: string;
}

/**
 * A list of questions with submitted answers, solution and previous grading info if available
 */
export type GradingInfo = {
  grade: Grade;
  maxGrade: number;
  maxXp: number;
  question: Question;
  solution: string;
  student: StudentInfo;
}[];

/**
 * A list of questions
 */
export type Questions = Question[];

export interface Story {
  /**
   * The closing date
   * @format date-time
   */
  closeAt: string;

  /** Filenames of txt files */
  filenames: string[];

  /** Path to image shown in Chapter Select Screen */
  imageUrl?: string;

  /** Whether or not is published */
  isPublished?: boolean;

  /**
   * The opening date
   * @format date-time
   */
  openAt: string;

  /** Title shown in Chapter Select Screen */
  title: string;
}

/**
 * @example {"chapter":1,"variant":"default"}
 */
export interface Sublanguage {
  /**
   * Chapter number from 1 to 4
   * @min 1
   * @max 4
   */
  chapter: number;

  /** Variant name */
  variant: SourceVariant;
}

export interface NotificationIds {
  /** the notification ids */
  notificationIds?: number[];
}

export interface Device {
  /** Device ID (unique to user) */
  id: number;

  /** Device unique secret */
  secret: string;

  /** User-given device title */
  title: string;

  /** User type */
  type: string;
}

export enum AutogradingStatus {
  None = 'none',
  Processing = 'processing',
  Success = 'success',
  Failed = 'failed'
}

/**
 * Information about a single notification
 */
export interface Notification {
  /** the assessment the notification references */
  assessment?: AssessmentInfo;

  /** the assessment id the notification references */
  assessment_id?: number;

  /** the notification id */
  id: number;

  /** the question id the notification references */
  question_id?: number;

  /** the read status of the notification */
  read: boolean;

  /** the submission id the notification references */
  submission_id: number;

  /** the type of the notification */
  type: NotificationType;
}

export enum AssessmentStatus {
  NotAttempted = 'not_attempted',
  Attempting = 'attempting',
  Attempted = 'attempted',
  Submitted = 'submitted'
}

export interface Grading {
  grading?: { adjustment?: number; comments?: string; xpAdjustment?: number };
}

/**
 * Achievement view properties
 */
export interface AchievementView {
  /** Text to show when achievement is completed */
  completionText?: string;

  /** URL of the image for the view */
  coverImage?: string;

  /** Achievement description */
  description?: string;
}

export interface Sourcecast {
  /**
   * audio file
   * @format binary
   */
  audio: File;

  /** description */
  description?: string;

  /** playback data */
  playbackData: string;

  /** title */
  title: string;

  /** uid */
  uid?: string;
}

export type Submissions = Submission[];

export interface ExternalLibrary {
  /** Name of the external library */
  name: string;
  symbols?: string[];
}

export interface Submission {
  /** Grade adjustment given */
  adjustment: number;

  /** Assessment for which the submission is for */
  assessment: AssessmentInfo;

  /** Grade given */
  grade: number;

  /** Number of questions in this submission that have been graded */
  gradedCount: number;

  /** Submission id */
  id: number;

  /** One of 'not_attempted/attempting/attempted/submitted' indicating whether the assessment has been attempted by the current user */
  status: AssessmentStatus;

  /** Student who created the submission */
  student: StudentInfo;

  /**
   * Last unsubmitted at
   * @format date-time
   */
  unsubmittedAt?: string;
  unsubmittedBy?: GraderInfo;

  /** XP earned */
  xp: number;

  /** XP adjustment given */
  xpAdjustment: number;

  /** Bonus XP for a given submission */
  xpBonus: number;
}

export interface UnlockAssessmentPayload {
  /** Password */
  password: string;
}

/**
 * Basic information about the user
 */
export interface AdminUserInfo {
  /** Group the user belongs to. May be null if the user does not belong to any group */
  group?: string;

  /** Full name of the user */
  name?: string;

  /** Role of the user. Can be 'student', 'staff', or 'admin' */
  role?: string;

  /** User's ID */
  userId?: number;
}

export interface MCQChoice {
  /** The choice content */
  content: string;

  /** The hint */
  hint: string;
}

/**
 * Basic information about the user
 */
export interface UserInfo {
  /**
   * States for user's game, including users' game progress, settings and collectibles.
   *
   */
  game_states?: UserGameStates;

  /** Amount of grade. Only provided for 'Student'. Value will be 0 for non-students. */
  grade?: number;

  /** Group the user belongs to. May be null if the user does not belong to any group. */
  group: string;

  /** Total maximum grade achievable based on submitted assessments. Only provided for 'Student' */
  maxGrade?: number;

  /** Full name of the user */
  name: string;

  /** Role of the user. Can be 'Student', 'Staff', or 'Admin' */
  role: string;

  /** Story to displayed to current user.  */
  story?: UserStory;

  /** User's ID */
  userId: number;

  /** Amount of xp. Only provided for 'Student'. Value will be 0 for non-students. */
  xp?: number;
}

export interface Answer {
  /** answer of appropriate type depending on question type */
  answer: string | number;
}

export interface Library {
  chapter?: number;

  /** The external library for this question */
  external?: ExternalLibrary;
  globals?: string[];
}

/**
 * An achievement
 */
export interface Achievement {
  /** Achievement ability i.e. category */
  ability: string;

  /** URL of the achievement's background image */
  cardBackground?: string;

  /** Close date, in ISO 8601 format */
  deadline?: string;

  /** Goal UUIDs */
  goalUuids?: string[];

  /** Whether the achievement is a task */
  isTask: boolean;

  /** Position of the achievement in the list */
  position: number;

  /** Prerequisite achievement UUIDs */
  prerequisiteUuids?: string[];

  /** Open date, in ISO 8601 format */
  release?: string;

  /** Achievement title */
  title: string;

  /**
   * Achievement UUID
   * @format uuid
   */
  uuid?: string;

  /** View properties */
  view: AchievementView;
}

/**
 * Summary of grading items for current user as the grader
 */
export interface GradingSummary {
  /** Name of group this grader is in */
  groupName: string;

  /** Name of group leader */
  leaderName: string;

  /** Number of submitted missions */
  submittedMissions: number;

  /** Number of submitted sidequests */
  submittedSidequests: number;

  /** Number of ungraded missions */
  ungradedMissions: number;

  /** Number of ungraded sidequests */
  ungradedSidequests: number;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (
    securityData: SecurityDataType | null
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded'
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = '/v2';
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  private addQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`;
  }

  private addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return `${value.map(this.addQueryParam).join('&')}`;
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(key => 'undefined' !== typeof query[key]);
    return keys
      .map(key =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key)
      )
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string')
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((data, key) => {
        data.append(key, input[key]);
        return data;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input)
  };

  private mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {})
      }
    };
  }

  private createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`,
      {
        ...requestParams,
        headers: {
          ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
          ...(requestParams.headers || {})
        },
        signal: cancelToken ? this.createAbortSignal(cancelToken) : void 0,
        body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body)
      }
    ).then(async response => {
      const r = response as HttpResponse<T, E>;
      r.data = (null as unknown) as T;
      r.error = (null as unknown) as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then(data => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch(e => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title cadet
 * @version 2.0
 * @baseUrl /v2
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  incentives = {
    /**
     * No description
     *
     * @tags Incentives
     * @name IndexGoals
     * @summary Gets goals, including user's progress
     * @request GET:/self/goals
     * @secure
     */
    indexGoals: (params: RequestParams = {}) =>
      this.request<GoalWithProgress[], void>({
        path: `/self/goals`,
        method: 'GET',
        secure: true,
        ...params
      }),

    /**
     * No description
     *
     * @tags Incentives
     * @name IndexAchievements
     * @summary Gets achievements
     * @request GET:/achievements
     * @secure
     */
    indexAchievements: (params: RequestParams = {}) =>
      this.request<Achievement[], void>({
        path: `/achievements`,
        method: 'GET',
        secure: true,
        ...params
      })
  };
  assessments = {
    /**
     * No description
     *
     * @tags Assessments
     * @name Show
     * @summary Get information about one particular assessment
     * @request GET:/assessments/{assessmentId}
     * @secure
     */
    show: (assessmentId: number, params: RequestParams = {}) =>
      this.request<Assessment, void>({
        path: `/assessments/${assessmentId}`,
        method: 'GET',
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Assessments
     * @name Unlock
     * @summary Unlocks a password-protected assessment and returns its information
     * @request POST:/assessments/{assessmentId}/unlock
     * @secure
     */
    unlock: (assessmentId: number, password: UnlockAssessmentPayload, params: RequestParams = {}) =>
      this.request<Assessment, void>({
        path: `/assessments/${assessmentId}/unlock`,
        method: 'POST',
        body: password,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Assessments
     * @name Index
     * @summary Get a list of all assessments
     * @request GET:/assessments
     * @secure
     */
    index: (params: RequestParams = {}) =>
      this.request<AssessmentsList, void>({
        path: `/assessments`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Assessments
     * @name Submit
     * @summary Finalise submission for an assessment
     * @request POST:/assessments/{assessmentId}/submit
     * @secure
     */
    submit: (assessmentId: number, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/assessments/${assessmentId}/submit`,
        method: 'POST',
        secure: true,
        ...params
      })
  };
  answer = {
    /**
     * @description For MCQ, answer contains choice_id. For programming question, this is a string containing the student's code.
     *
     * @tags Answer
     * @name Submit
     * @summary Submit an answer to a question
     * @request POST:/assessments/question/{questionId}/answer
     * @secure
     */
    submit: (questionId: number, answer: Answer, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/assessments/question/${questionId}/answer`,
        method: 'POST',
        body: answer,
        secure: true,
        type: ContentType.Json,
        ...params
      })
  };
  adminGrading = {
    /**
     * No description
     *
     * @tags AdminGrading
     * @name Update
     * @summary Update marks given to the answer of a particular question in a submission
     * @request POST:/admin/grading/{submissionId}/{questionId}
     * @secure
     */
    update: (
      submissionId: number,
      questionId: number,
      grading: Grading,
      params: RequestParams = {}
    ) =>
      this.request<void, void>({
        path: `/admin/grading/${submissionId}/${questionId}`,
        method: 'POST',
        body: grading,
        secure: true,
        type: ContentType.Json,
        ...params
      }),

    /**
     * No description
     *
     * @tags AdminGrading
     * @name AutogradeAnswer
     * @summary Force re-autograding of a question in a submission
     * @request POST:/admin/grading/{submissionId}/{questionId}/autograde
     * @secure
     */
    autogradeAnswer: (submissionId: number, questionId: number, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/admin/grading/${submissionId}/${questionId}/autograde`,
        method: 'POST',
        secure: true,
        ...params
      }),

    /**
     * No description
     *
     * @tags AdminGrading
     * @name Index
     * @summary Get a list of all submissions with current user as the grader
     * @request GET:/admin/grading
     * @secure
     */
    index: (query?: { group?: boolean }, params: RequestParams = {}) =>
      this.request<Submissions, void>({
        path: `/admin/grading`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags AdminGrading
     * @name Show
     * @summary Get information about a specific submission to be graded
     * @request GET:/admin/grading/{submissionId}
     * @secure
     */
    show: (submissionId: number, params: RequestParams = {}) =>
      this.request<GradingInfo, void>({
        path: `/admin/grading/${submissionId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags AdminGrading
     * @name AutogradeSubmission
     * @summary Force re-autograding of an entire submission
     * @request POST:/admin/grading/{submissionId}/autograde
     * @secure
     */
    autogradeSubmission: (submissionId: number, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/admin/grading/${submissionId}/autograde`,
        method: 'POST',
        secure: true,
        ...params
      }),

    /**
     * No description
     *
     * @tags AdminGrading
     * @name Unsubmit
     * @summary Unsubmit submission. Can only be done by the Avenger of a student
     * @request POST:/admin/grading/{submissionId}/unsubmit
     * @secure
     */
    unsubmit: (submissionId: number, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/admin/grading/${submissionId}/unsubmit`,
        method: 'POST',
        secure: true,
        ...params
      }),

    /**
     * No description
     *
     * @tags AdminGrading
     * @name GradingSummary
     * @summary Receives a summary of grading items done by this grader
     * @request GET:/admin/grading/summary
     * @secure
     */
    gradingSummary: (params: RequestParams = {}) =>
      this.request<GradingSummary[], void>({
        path: `/admin/grading/summary`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params
      })
  };
  devices = {
    /**
     * No description
     *
     * @tags Devices
     * @name GetClientId
     * @summary Returns the device's MQTT client ID
     * @request GET:/devices/{secret}/client_id
     */
    getClientId: (secret: string, params: RequestParams = {}) =>
      this.request<AssetURL, void>({
        path: `/devices/${secret}/client_id`,
        method: 'GET',
        ...params
      }),

    /**
     * No description
     *
     * @tags Devices
     * @name GetMqttEndpoint
     * @summary Returns the MQTT endpoint the device should connect to
     * @request GET:/devices/{secret}/mqtt_endpoint
     */
    getMqttEndpoint: (secret: string, params: RequestParams = {}) =>
      this.request<AssetURL, void>({
        path: `/devices/${secret}/mqtt_endpoint`,
        method: 'GET',
        ...params
      }),

    /**
     * No description
     *
     * @tags Devices
     * @name Deregister
     * @summary Unregisters the given device
     * @request DELETE:/devices/{id}
     * @secure
     */
    deregister: (id: number, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/devices/${id}`,
        method: 'DELETE',
        secure: true,
        type: ContentType.Json,
        ...params
      }),

    /**
     * No description
     *
     * @tags Devices
     * @name Edit
     * @summary Edits the given device
     * @request POST:/devices/{id}
     * @secure
     */
    edit: (id: number, device: EditDevicePayload, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/devices/${id}`,
        method: 'POST',
        body: device,
        secure: true,
        type: ContentType.Json,
        ...params
      }),

    /**
     * No description
     *
     * @tags Devices
     * @name GetKey
     * @summary Returns the device's PEM-encoded client key
     * @request GET:/devices/{secret}/key
     */
    getKey: (secret: string, params: RequestParams = {}) =>
      this.request<AssetURL, void>({
        path: `/devices/${secret}/key`,
        method: 'GET',
        ...params
      }),

    /**
     * No description
     *
     * @tags Devices
     * @name GetWsEndpoint
     * @summary Generates a WebSocket endpoint URL for the given device
     * @request GET:/devices/{id}/ws_endpoint
     * @secure
     */
    getWsEndpoint: (id: number, params: RequestParams = {}) =>
      this.request<WebSocketEndpoint, void>({
        path: `/devices/${id}/ws_endpoint`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Devices
     * @name GetCert
     * @summary Returns the device's PEM-encoded client certificate
     * @request GET:/devices/{secret}/cert
     */
    getCert: (secret: string, params: RequestParams = {}) =>
      this.request<AssetURL, void>({
        path: `/devices/${secret}/cert`,
        method: 'GET',
        ...params
      }),

    /**
     * No description
     *
     * @tags Devices
     * @name Index
     * @summary Returns the devices registered by the user
     * @request GET:/devices
     * @secure
     */
    index: (params: RequestParams = {}) =>
      this.request<Device[], void>({
        path: `/devices`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Devices
     * @name Register
     * @summary Registers a new device
     * @request POST:/devices
     * @secure
     */
    register: (device: RegisterDevicePayload, params: RequestParams = {}) =>
      this.request<Device, void>({
        path: `/devices`,
        method: 'POST',
        body: device,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params
      })
  };
  settings = {
    /**
     * No description
     *
     * @tags Settings
     * @name Index
     * @summary Retrieves the default Source sublanguage of the Playground
     * @request GET:/settings/sublanguage
     */
    index: (params: RequestParams = {}) =>
      this.request<Sublanguage, any>({
        path: `/settings/sublanguage`,
        method: 'GET',
        format: 'json',
        ...params
      })
  };
  auth = {
    /**
     * @description Get a set of access and refresh tokens, using the authentication code from the OAuth2 provider. When accessing resources, pass the access token in the Authorization HTTP header using the Bearer schema: `Authorization: Bearer <token>`.
     *
     * @tags Auth
     * @name Create
     * @summary Obtain access and refresh tokens to authenticate user
     * @request POST:/auth/login
     */
    create: (
      query: { code: string; provider: string; client_id?: string; redirect_uri?: string },
      params: RequestParams = {}
    ) =>
      this.request<Tokens, void>({
        path: `/auth/login`,
        method: 'POST',
        query: query,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name Refresh
     * @summary Obtain a new access token using a refresh token
     * @request POST:/auth/refresh
     */
    refresh: (refresh_token: RefreshToken, params: RequestParams = {}) =>
      this.request<Tokens, void>({
        path: `/auth/refresh`,
        method: 'POST',
        body: refresh_token,
        type: ContentType.Json,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name Logout
     * @summary Logout and invalidate the tokens
     * @request POST:/auth/logout
     */
    logout: (tokens: RefreshToken, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/auth/logout`,
        method: 'POST',
        body: tokens,
        type: ContentType.Json,
        ...params
      })
  };
  user = {
    /**
     * No description
     *
     * @tags User
     * @name Index
     * @summary Get the name, role and group of a user
     * @request GET:/user
     * @secure
     */
    index: (params: RequestParams = {}) =>
      this.request<UserInfo, void>({
        path: `/user`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags User
     * @name UpdateGameStates
     * @summary Update user's game states
     * @request PUT:/user/game_states
     * @secure
     */
    updateGameStates: (gameStates: UserGameStates, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/user/game_states`,
        method: 'PUT',
        body: gameStates,
        secure: true,
        type: ContentType.Json,
        ...params
      })
  };
  stories = {
    /**
     * No description
     *
     * @tags Stories
     * @name Index
     * @summary Get a list of all stories
     * @request GET:/stories
     * @secure
     */
    index: (params: RequestParams = {}) =>
      this.request<Story[], void>({
        path: `/stories`,
        method: 'GET',
        secure: true,
        ...params
      }),

    /**
     * No description
     *
     * @tags Stories
     * @name Create
     * @summary Creates a new story
     * @request POST:/stories
     * @secure
     */
    create: (params: RequestParams = {}) =>
      this.request<Story, void>({
        path: `/stories`,
        method: 'POST',
        secure: true,
        ...params
      }),

    /**
     * No description
     *
     * @tags Stories
     * @name Delete
     * @summary Delete a story from database by id
     * @request DELETE:/stories/{storyid}
     * @secure
     */
    delete: (storyid: number, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/stories/${storyid}`,
        method: 'DELETE',
        secure: true,
        ...params
      }),

    /**
     * No description
     *
     * @tags Stories
     * @name Update
     * @summary Update details regarding a story
     * @request POST:/stories/{storyid}
     * @secure
     */
    update: (storyid: number, params: RequestParams = {}) =>
      this.request<Story, void>({
        path: `/stories/${storyid}`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params
      })
  };
  adminGoals = {
    /**
     * No description
     *
     * @tags AdminGoals
     * @name Delete
     * @summary Deletes a goal
     * @request DELETE:/admin/goals/{uuid}
     * @secure
     */
    delete: (uuid: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/admin/goals/${uuid}`,
        method: 'DELETE',
        secure: true,
        ...params
      }),

    /**
     * No description
     *
     * @tags AdminGoals
     * @name Update
     * @summary Inserts or updates a goal
     * @request PUT:/admin/goals/{uuid}
     * @secure
     */
    update: (uuid: string, goal: Goal, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/admin/goals/${uuid}`,
        method: 'PUT',
        body: goal,
        secure: true,
        type: ContentType.Json,
        ...params
      }),

    /**
     * No description
     *
     * @tags AdminGoals
     * @name Index
     * @summary Gets goals
     * @request GET:/admin/goals
     * @secure
     */
    index: (params: RequestParams = {}) =>
      this.request<Goal[], void>({
        path: `/admin/goals`,
        method: 'GET',
        secure: true,
        ...params
      }),

    /**
     * No description
     *
     * @tags AdminGoals
     * @name BulkUpdate
     * @summary Inserts or updates goals
     * @request PUT:/admin/goals
     * @secure
     */
    bulkUpdate: (goals: Goal[], params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/admin/goals`,
        method: 'PUT',
        body: goals,
        secure: true,
        type: ContentType.Json,
        ...params
      })
  };
  notifications = {
    /**
     * No description
     *
     * @tags Notifications
     * @name Index
     * @summary Get the unread notifications belonging to a user
     * @request GET:/notifications
     * @secure
     */
    index: (params: RequestParams = {}) =>
      this.request<Notification[], void>({
        path: `/notifications`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags Notifications
     * @name Acknowledge
     * @summary Acknowledge notification(s)
     * @request POST:/notifications/acknowledge
     * @secure
     */
    acknowledge: (notificationIds: NotificationIds, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/notifications/acknowledge`,
        method: 'POST',
        body: notificationIds,
        secure: true,
        type: ContentType.Json,
        ...params
      })
  };
  adminAssessments = {
    /**
     * No description
     *
     * @tags AdminAssessments
     * @name Delete
     * @summary Deletes an assessment
     * @request DELETE:/admin/assessments/{assessmentId}
     * @secure
     */
    delete: (assessmentId: number, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/admin/assessments/${assessmentId}`,
        method: 'DELETE',
        secure: true,
        ...params
      }),

    /**
     * No description
     *
     * @tags AdminAssessments
     * @name Update
     * @summary Updates an assessment
     * @request POST:/admin/assessments/{assessmentId}
     * @secure
     */
    update: (
      assessmentId: number,
      assessment: AdminUpdateAssessmentPayload,
      params: RequestParams = {}
    ) =>
      this.request<void, void>({
        path: `/admin/assessments/${assessmentId}`,
        method: 'POST',
        body: assessment,
        secure: true,
        type: ContentType.Json,
        ...params
      }),

    /**
     * No description
     *
     * @tags AdminAssessments
     * @name Create
     * @summary Creates a new assessment or updates an existing assessment
     * @request POST:/admin/assessments
     * @secure
     */
    create: (data: { assessment: File; forceUpdate: boolean }, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/admin/assessments`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.FormData,
        ...params
      })
  };
  adminSettings = {
    /**
     * No description
     *
     * @tags AdminSettings
     * @name Update
     * @summary Updates the default Source sublanguage of the Playground
     * @request PUT:/admin/settings/sublanguage
     * @secure
     */
    update: (sublanguage: AdminSublanguage, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/admin/settings/sublanguage`,
        method: 'PUT',
        body: sublanguage,
        secure: true,
        type: ContentType.Json,
        ...params
      })
  };
  adminAchievements = {
    /**
     * No description
     *
     * @tags AdminAchievements
     * @name Delete
     * @summary Deletes an achievement
     * @request DELETE:/admin/achievements/{uuid}
     * @secure
     */
    delete: (uuid: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/admin/achievements/${uuid}`,
        method: 'DELETE',
        secure: true,
        ...params
      }),

    /**
     * No description
     *
     * @tags AdminAchievements
     * @name Update
     * @summary Inserts or updates an achievement
     * @request PUT:/admin/achievements/{uuid}
     * @secure
     */
    update: (uuid: string, achievement: Achievement, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/admin/achievements/${uuid}`,
        method: 'PUT',
        body: achievement,
        secure: true,
        type: ContentType.Json,
        ...params
      }),

    /**
     * No description
     *
     * @tags AdminAchievements
     * @name BulkUpdate
     * @summary Inserts or updates achievements
     * @request PUT:/admin/achievements
     * @secure
     */
    bulkUpdate: (achievement: Achievement[], params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/admin/achievements`,
        method: 'PUT',
        body: achievement,
        secure: true,
        type: ContentType.Json,
        ...params
      })
  };
  adminUser = {
    /**
     * No description
     *
     * @tags AdminUser
     * @name Index
     * @summary Returns a list of users
     * @request GET:/admin/users
     * @secure
     */
    index: (params: RequestParams = {}) =>
      this.request<AdminUserInfo, void>({
        path: `/admin/users`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params
      })
  };
  sourcecast = {
    /**
     * @description Deletes sourcecast by id
     *
     * @tags Sourcecast
     * @name Delete
     * @summary Delete sourcecast
     * @request DELETE:/sourcecast/{id}
     * @secure
     */
    delete: (id: number, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/sourcecast/${id}`,
        method: 'DELETE',
        secure: true,
        ...params
      }),

    /**
     * @description Lists all sourcecasts
     *
     * @tags Sourcecast
     * @name Index
     * @summary Show all sourcecasts
     * @request GET:/sourcecast
     * @secure
     */
    index: (params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/sourcecast`,
        method: 'GET',
        secure: true,
        ...params
      }),

    /**
     * @description Uploads sourcecast
     *
     * @tags Sourcecast
     * @name Create
     * @summary Upload sourcecast
     * @request POST:/sourcecast
     * @secure
     */
    create: (sourcecast: Sourcecast, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/sourcecast`,
        method: 'POST',
        body: sourcecast,
        secure: true,
        type: ContentType.FormData,
        ...params
      })
  };
  adminAssets = {
    /**
     * No description
     *
     * @tags AdminAssets
     * @name Index
     * @summary Get a list of all assets in a folder
     * @request GET:/admin/assets/{foldername}
     * @secure
     */
    index: (foldername: string, params: RequestParams = {}) =>
      this.request<Assets, void>({
        path: `/admin/assets/${foldername}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params
      }),

    /**
     * No description
     *
     * @tags AdminAssets
     * @name Delete
     * @summary Delete a file from an asset folder
     * @request DELETE:/admin/assets/{foldername}/{filename}
     * @secure
     */
    delete: (foldername: string, filename: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/admin/assets/${foldername}/${filename}`,
        method: 'DELETE',
        secure: true,
        ...params
      }),

    /**
     * No description
     *
     * @tags AdminAssets
     * @name Upload
     * @summary Upload a file to an asset folder
     * @request POST:/admin/assets/{foldername}/{filename}
     * @secure
     */
    upload: (foldername: string, filename: string, params: RequestParams = {}) =>
      this.request<AssetURL, void>({
        path: `/admin/assets/${foldername}/${filename}`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params
      })
  };
}
