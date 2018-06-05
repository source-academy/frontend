import { Store } from 'redux'
import * as mockStore from 'redux-mock-store'

import {
  defaultApplication,
  defaultGame,
  defaultPlayground,
  defaultSession,
  IState
} from '../reducers/states'

export function mockInitialStore<P>(): Store<IState> {
  const createStore = (mockStore as any)()
  const state: IState = {
    application: defaultApplication,
    game: defaultGame,
    playground: defaultPlayground,
    session: defaultSession
  }
  return createStore(state)
}
