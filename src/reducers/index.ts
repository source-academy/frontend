import { IApplicationState, reducer as application } from './application'
import { IPlaygroundState, reducer as playground } from './playground'

export interface IState {
  readonly application: IApplicationState
  readonly playground: IPlaygroundState
}

export default {
  application,
  playground
}
