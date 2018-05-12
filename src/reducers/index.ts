import { IApplicationState, reducer as application } from './application'

export interface IState {
  readonly application: IApplicationState
}

export default {
  application
}
