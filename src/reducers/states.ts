import { MissionInfo } from '../components/academy/Missions'
import { Announcement } from '../components/Announcements'
import { AssessmentInfo } from '../components/Assessment'
import { Context, createContext } from '../slang'
import { SourceError } from '../slang/types'

export interface IState {
  readonly application: IApplicationState
  readonly game: IGameState
  readonly playground: IPlaygroundState
  readonly session: ISessionState
}

export interface IApplicationState {
  readonly title: string
  readonly environment: ApplicationEnvironment
}

export const sourceChapters = [1, 2]
const latestSourceChapter = sourceChapters.slice(-1)[0]

export interface IGameState {
  readonly canvas?: HTMLCanvasElement
}

export interface IPlaygroundState {
  readonly context: Context
  readonly editorValue: string
  readonly editorWidth: string
  readonly isRunning: boolean
  readonly queryString?: string
  readonly output: InterpreterOutput[]
  readonly replValue: string
  readonly sourceChapter: number
  readonly sideContentActiveTab: number
  readonly sideContentHeight?: number
}

export interface ISessionState {
  readonly token?: string
  readonly announcements?: Announcement[]
  readonly missionsInfo?: MissionInfo[]
  readonly username?: string
  readonly assessmentInfos: AssessmentInfo[]
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

export const defaultApplication: IApplicationState = {
  title: 'Cadet',
  environment: currentEnvironment()
}

export const defaultGame: IGameState = {
  canvas: undefined
}

export const defaultPlayground: IPlaygroundState = {
  context: createContext(latestSourceChapter),
  editorValue: '',
  editorWidth: '50%',
  isRunning: false,
  output: [],
  replValue: '',
  sideContentActiveTab: 0,
  sideContentHeight: undefined,
  sourceChapter: latestSourceChapter
}

export const defaultSession: ISessionState = {
  token: undefined,
  announcements: [
    {
      author: 'Aministrator',
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam non tellus non ligula consectetur feugiat a at mauris. Ut sagittis, urna id suscipit dictum, ipsum diam sollicitudin enim, sed ultricies diam turpis vel libero. Maecenas finibus nisl ac lobortis ultricies. Integer molestie urna vitae nisi pharetra porttitor. Vestibulum massa diam, tristique quis ante a, posuere placerat magna. Pellentesque at lobortis purus, vitae imperdiet diam. Nulla eu rutrum neque. Aliquam efficitur consectetur ullamcorper. Pellentesque ultricies, diam ut vestibulum pellentesque, metus arcu laoreet ex, at mattis quam est non neque. Nam velit ipsum, posuere non porttitor commodo, lobortis in urna. Nulla facilisi. Donec mollis id nibh a luctus. Mauris vitae orci id velit pulvinar pellentesque non ut sapien. Curabitur eu consequat lorem. Proin pretium blandit scelerisque. Morbi ultricies, tellus non posuere pretium, felis sem convallis magna, ut sagittis elit felis et sem. Aliquam auctor suscipit condimentum. Nam posuere nulla dolor, in maximus risus feugiat vel. Phasellus vestibulum odio nec leo vehicula condimentum. Ut et semper libero. Cras fermentum mauris quis ex sodales, sit amet hendrerit augue lobortis. Maecenas eu dapibus enim, nec auctor est. Quisque quis erat erat. Curabitur sed rutrum felis, non venenatis diam. Fusce maximus rhoncus neque, in maximus velit semper eu. Fusce tempus lorem ut sodales pulvinar.',
      pinned: true
    }
  ],
  missionsInfo: [
    {
      id: 0,
      title: 'An Odessey to Runes',
      description:
        'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum in'
    }
  ],
  username: undefined,
  assessmentInfos: [
    {
      longSummary: 'This is a dummy summary, to be displayed as part of the briefing.',
      dueDate: '12/12/12',
      studentBriefed: false
    }
  ]
}
