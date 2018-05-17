import { Context, createContext } from '../slang'

export interface IState {
  readonly application: IApplicationState
  readonly playground: IPlaygroundState
}

export interface IPlaygroundState {
  readonly editorValue: string
  readonly context: Context
  readonly output: string[]
}

export interface IApplicationState {
  readonly title: string
  readonly environment: ApplicationEnvironment
}

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
  context: createContext(),
  output: ['']
}
