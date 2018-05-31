import { Announcement } from '../components/device/Announcements'
import { Context, createContext } from '../slang'
import { SourceError } from '../slang/types'

export interface IState {
  readonly application: IApplicationState
  readonly playground: IPlaygroundState
  readonly session: ISessionState
}

export interface IApplicationState {
  readonly title: string
  readonly environment: ApplicationEnvironment
}

export const sourceChapters = [1, 2]
const latestSourceChapter = sourceChapters.slice(-1)[0]

export interface IPlaygroundState {
  readonly context: Context
  readonly editorValue: string
  readonly editorWidth: string
  readonly isRunning: boolean
  readonly output: InterpreterOutput[]
  readonly replValue: string
  readonly sourceChapter: number
}

export interface ISessionState {
  readonly token?: string
  readonly announcements?: Announcement[]
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

export const defaultPlayground: IPlaygroundState = {
  context: createContext(latestSourceChapter),
  editorValue: '',
  editorWidth: '50%',
  isRunning: false,
  output: [],
  replValue: '',
  sourceChapter: latestSourceChapter
}

export const defaultSession: ISessionState = {
  token: undefined,
  announcements: [
    {
      author: 'Bob the builder',
      title: 'Can We Fix It? A curious study -',
      content: 'Turns out, we can!',
      pinned: true
    }
  ]
}
