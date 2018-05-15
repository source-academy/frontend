import { Reducer } from 'redux'
import { IUpdatePlaygroundCodeAction as UpdatePlaygroundCodeAction, UPDATE_PLAYGROUND_CODE } from '../actions/index'

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

type Action = UpdatePlaygroundCodeAction;


export const reducer: Reducer<IApplicationState> = (state = defaultState, action: Action) => {
  switch (action.type) {

  case UPDATE_PLAYGROUND_CODE:
    return {
      ...state,
      playgroundCode : action.playgroundCode
    };

  default:
    return state;
  }
};
