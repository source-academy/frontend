import { Context, createContext } from '../slang'
import { SourceError } from '../slang/types'

export interface IState {
  readonly application: IApplicationState
  readonly playground: IPlaygroundState
}

export interface IApplicationState {
  readonly title: string
  readonly environment: ApplicationEnvironment
}

export interface IPlaygroundState {
  readonly editorValue: string
  readonly replValue: string
  readonly context: Context
  readonly output: InterpreterOutput[]
}

export type CodeOutput = {
  type: 'code'
  value: string
}

export type ResultOutput = {
  type: 'result'
  value: any
  runtime?: number
  isProgram?: boolean
}

export type ErrorOutput = {
  type: 'errors'
  errors: SourceError[]
}

export type LogOutput = {
  type: 'log'
  value: string
}

export type InterpreterOutput = CodeOutput | ResultOutput | ErrorOutput | LogOutput

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
  editorValue: '',
  replValue: '',
  context: createContext(),
  output: []
}
