import { Context } from 'js-slang'
import { SourceError } from 'js-slang/dist/types'

import { WorkspaceLocation, WorkspaceLocations } from '../actions/workspaces'
import { Grading, GradingOverview } from '../components/academy/grading/gradingShape'
import { Announcement } from '../components/Announcements'
import { IAssessment, IAssessmentOverview } from '../components/assessment/assessmentShape'
import { HistoryHelper } from '../utils/history'
import { createContext } from '../utils/slangHelper'

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
  readonly currentSubmission?: number
  readonly currentQuestion?: number
  readonly gradingCommentsValue: string
  readonly gradingXP: number | undefined
  readonly playground: IWorkspaceState
  /** Defines the external library name to be used. */
  readonly playgroundLibrary: string
}

interface IWorkspaceState {
  readonly context: Context
  readonly editorValue: string
  readonly editorWidth: string
  readonly output: InterpreterOutput[]
  readonly replValue: string
  readonly sideContentActiveTab: number
  readonly sideContentHeight?: number
}

export interface ISessionState {
  readonly accessToken?: string
  readonly assessmentOverviews?: IAssessmentOverview[]
  readonly assessments: Map<number, IAssessment>
  readonly announcements?: Announcement[]
  readonly gradingOverviews?: GradingOverview[]
  readonly gradings: Map<number, Grading>
  readonly historyHelper: HistoryHelper
  readonly refreshToken?: string
  readonly role?: Role
  readonly storyAct: string
  readonly username?: string
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

export enum Role {
  Student = 'student',
  Staff = 'staff',
  Admin = 'admin'
}

/** Defines what chapters are available for usage. */
export const sourceChapters = [1, 2]
const latestSourceChapter = sourceChapters.slice(-1)[0]

/**
 * Defines which external libraries are available for usage.
 * TODO use constants
 * TODO move this to a file closer to the libraries
 */
const libEntries: Array<[string, string[]]> = [
  ['none', []],
  [
    'sound',
    [
      'make_sourcesound',
      'get_wave',
      'get_duration',
      'is_sound',
      'play',
      'stop',
      'cut_sourcesound',
      'cut',
      'sourcesound_to_sound',
      'autocut_sourcesound',
      'consecutively',
      'simultaneously'
    ]
  ]
]
export const externalLibraries: Map<string, string[]> = new Map(libEntries)

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

export const defaultEditorValue = '// Type your program in here!'

/**
 * Create a default IWorkspaceState for 'resetting' a workspace.
 * Takes in parameters to set the js-slang library and chapter.
 *
 * @param location the location of the workspace, used for context
 * @param chapter the chapter number for the js-slang interpreter
 * @param externals any external library exposed symbols
 */
export const createDefaultWorkspace = (
  location: WorkspaceLocation,
  chapter: number = latestSourceChapter,
  externals?: string[]
): IWorkspaceState => ({
  context: createContext<WorkspaceLocation>(chapter, externals, location),
  editorValue: defaultEditorValue,
  editorWidth: '50%',
  output: [],
  replValue: '',
  sideContentActiveTab: 0
})

export const defaultComments = 'Comments **here**. Use `markdown` if you ~~are cool~~ want!'

export const defaultWorkspaceManager: IWorkspaceManagerState = {
  assessment: { ...createDefaultWorkspace(WorkspaceLocations.assessment) },
  currentAssessment: undefined,
  currentQuestion: undefined,
  gradingCommentsValue: defaultComments,
  gradingXP: undefined,
  playground: { ...createDefaultWorkspace(WorkspaceLocations.playground) },
  playgroundLibrary: 'none'
}

export const defaultSession: ISessionState = {
  accessToken: undefined,
  announcements: [
    {
      author: 'Aministrator',
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam non tellus non ligula consectetur feugiat a at mauris. Ut sagittis, urna id suscipit dictum, ipsum diam sollicitudin enim, sed ultricies diam turpis vel libero. Maecenas finibus nisl ac lobortis ultricies. Integer molestie urna vitae nisi pharetra porttitor. Vestibulum massa diam, tristique quis ante a, posuere placerat magna. Pellentesque at lobortis purus, vitae imperdiet diam. Nulla eu rutrum neque. Aliquam efficitur consectetur ullamcorper. Pellentesque ultricies, diam ut vestibulum pellentesque, metus arcu laoreet ex, at mattis quam est non neque. Nam velit ipsum, posuere non porttitor commodo, lobortis in urna. Nulla facilisi. Donec mollis id nibh a luctus. Mauris vitae orci id velit pulvinar pellentesque non ut sapien. Curabitur eu consequat lorem. Proin pretium blandit scelerisque. Morbi ultricies, tellus non posuere pretium, felis sem convallis magna, ut sagittis elit felis et sem. Aliquam auctor suscipit condimentum. Nam posuere nulla dolor, in maximus risus feugiat vel. Phasellus vestibulum odio nec leo vehicula condimentum. Ut et semper libero. Cras fermentum mauris quis ex sodales, sit amet hendrerit augue lobortis. Maecenas eu dapibus enim, nec auctor est. Quisque quis erat erat. Curabitur sed rutrum felis, non venenatis diam. Fusce maximus rhoncus neque, in maximus velit semper eu. Fusce tempus lorem ut sodales pulvinar.',
      pinned: true
    }
  ],
  assessments: new Map<number, IAssessment>(),
  assessmentOverviews: undefined,
  gradingOverviews: undefined,
  gradings: new Map<number, Grading>(),
  historyHelper: {
    lastAcademyLocations: [null, null],
    lastGeneralLocations: [null, null]
  },
  refreshToken: undefined,
  storyAct: 'mission-1',
  username: undefined
}

export const defaultState: IState = {
  academy: defaultAcademy,
  application: defaultApplication,
  playground: defaultPlayground,
  session: defaultSession,
  workspaces: defaultWorkspaceManager
}
