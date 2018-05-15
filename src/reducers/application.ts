import { Action, Reducer } from 'redux'

export enum ApplicationEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test'
}

export interface IApplicationState {
  title: string
  environment: ApplicationEnvironment
  playgroundCode: string
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

const defaultState: IApplicationState = {
  title: 'Cadet',
  environment: currentEnvironment(),
  playgroundCode: 'Hello the world'
}

export const reducer: Reducer<IApplicationState> = (state = defaultState, action: Action) => {
  return state
}
