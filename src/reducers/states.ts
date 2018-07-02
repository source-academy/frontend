import { WorkspaceLocation, WorkspaceLocations } from '../actions/workspaces'
import { Announcement } from '../components/Announcements'
import {
  AssessmentCategory,
  IAssessment,
  IAssessmentOverview
} from '../components/assessment/assessmentShape'
import { Context, createContext } from '../slang'
import { SourceError } from '../slang/types'
import { HistoryHelper } from '../utils/history'

export interface IState {
  readonly academy: IAcademyState
  readonly application: IApplicationState
  readonly playground: IPlaygroundState
  readonly session: ISessionState
  readonly workspaces: IWorkspaceManagerState
}

export interface IAcademyState {
  readonly gameCanvas?: HTMLCanvasElement
}

export interface IApplicationState {
  readonly title: string
  readonly environment: ApplicationEnvironment
}

export interface IPlaygroundState {
  readonly queryString?: string
}

export interface IWorkspaceManagerState {
  readonly assessment: IWorkspaceState
  readonly currentAssessment?: number
  readonly playground: IWorkspaceState
  readonly currentQuestion?: number
}

interface IWorkspaceState {
  readonly context: Context
  readonly editorValue?: string
  readonly editorWidth: string
  readonly isRunning: boolean
  readonly output: InterpreterOutput[]
  readonly replValue: string
  readonly sourceChapter: number
  readonly sideContentActiveTab: number
  readonly sideContentHeight?: number
}

export interface ISessionState {
  readonly accessToken?: string
  readonly assessmentOverviews?: IAssessmentOverview[]
  readonly assessments: Map<number, IAssessment>
  readonly announcements?: Announcement[]
  readonly gradingOverviews?: GradingOverview[]
  readonly historyHelper: HistoryHelper
  readonly refreshToken?: string
  readonly username?: string
}

/**
 * Information on a Grading, for a particular student submission
 * for a particular assessment.
 */
export type GradingOverview = {
  assessmentId: number
  assessmentName: string
  assessmentCategory: AssessmentCategory
  currentXP: number
  graded: boolean
  maximumXP: number
  studentId: number
  studentName: string
  submissionId: number
}

/**
 * An output while the program is still being run in the interpreter. As a
 * result, there are no return values or SourceErrors yet. However, there could
 * have been calls to display (console.log) that need to be printed out.
 */
export type RunningOutput = {
  type: 'running'
  consoleLogs: string[]
}

/**
 * An output which reflects the program which the user had entered. Not a true
 * Output from the interpreter, but simply there to let he user know what had
 * been entered.
 */
export type CodeOutput = {
  type: 'code'
  value: string
}

/**
 * An output which represents a program being run successfully, i.e. with a
 * return value at the end. A program can have either a return value, or errors,
 * but not both.
 */
export type ResultOutput = {
  type: 'result'
  value: any
  consoleLogs: string[]
  runtime?: number
  isProgram?: boolean
}

/**
 * An output which represents a program being run unsuccessfully, i.e. with
 * errors at the end. A program can have either a return value, or errors, but
 * not both.
 */
export type ErrorOutput = {
  type: 'errors'
  errors: SourceError[]
  consoleLogs: string[]
}

export type InterpreterOutput = RunningOutput | CodeOutput | ResultOutput | ErrorOutput

export enum ApplicationEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test'
}

export const sourceChapters = [1, 2]
const latestSourceChapter = sourceChapters.slice(-1)[0]

const currentEnvironment = (): ApplicationEnvironment => {
  switch (process.env.NODE_ENV) {
    case 'development':
      return ApplicationEnvironment.Development
    case 'production':
      return ApplicationEnvironment.Production
    default:
      return ApplicationEnvironment.Test
  }
}

export const defaultAcademy: IAcademyState = {
  gameCanvas: undefined
}

export const defaultApplication: IApplicationState = {
  title: 'Cadet',
  environment: currentEnvironment()
}

export const defaultPlayground: IPlaygroundState = {}

export const createDefaultWorkspace = (location: WorkspaceLocation): IWorkspaceState => ({
  context: createContext<WorkspaceLocation>(latestSourceChapter, undefined, location),
  editorValue: undefined,
  editorWidth: '50%',
  isRunning: false,
  output: [],
  replValue: '',
  sideContentActiveTab: 0,
  sourceChapter: latestSourceChapter
})

export const defaultWorkspaceManager: IWorkspaceManagerState = {
  currentAssessment: undefined,
  currentQuestion: undefined,
  assessment: { ...createDefaultWorkspace(WorkspaceLocations.assessment) },
  playground: { ...createDefaultWorkspace(WorkspaceLocations.playground) }
}

export const defaultSession: ISessionState = {
  announcements: [
    {
      author: 'Aministrator',
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam non tellus non ligula consectetur feugiat a at mauris. Ut sagittis, urna id suscipit dictum, ipsum diam sollicitudin enim, sed ultricies diam turpis vel libero. Maecenas finibus nisl ac lobortis ultricies. Integer molestie urna vitae nisi pharetra porttitor. Vestibulum massa diam, tristique quis ante a, posuere placerat magna. Pellentesque at lobortis purus, vitae imperdiet diam. Nulla eu rutrum neque. Aliquam efficitur consectetur ullamcorper. Pellentesque ultricies, diam ut vestibulum pellentesque, metus arcu laoreet ex, at mattis quam est non neque. Nam velit ipsum, posuere non porttitor commodo, lobortis in urna. Nulla facilisi. Donec mollis id nibh a luctus. Mauris vitae orci id velit pulvinar pellentesque non ut sapien. Curabitur eu consequat lorem. Proin pretium blandit scelerisque. Morbi ultricies, tellus non posuere pretium, felis sem convallis magna, ut sagittis elit felis et sem. Aliquam auctor suscipit condimentum. Nam posuere nulla dolor, in maximus risus feugiat vel. Phasellus vestibulum odio nec leo vehicula condimentum. Ut et semper libero. Cras fermentum mauris quis ex sodales, sit amet hendrerit augue lobortis. Maecenas eu dapibus enim, nec auctor est. Quisque quis erat erat. Curabitur sed rutrum felis, non venenatis diam. Fusce maximus rhoncus neque, in maximus velit semper eu. Fusce tempus lorem ut sodales pulvinar.',
      pinned: true
    }
  ],
  assessmentOverviews: undefined,
  assessments: new Map<number, IAssessment>(),
  historyHelper: {
    lastAcademyLocations: [null, null],
    lastGeneralLocations: [null, null]
  },
  accessToken: undefined,
  refreshToken: undefined,
  username: undefined
}

export const defaultState: IState = {
  academy: defaultAcademy,
  application: defaultApplication,
  playground: defaultPlayground,
  session: defaultSession,
  workspaces: defaultWorkspaceManager
}
