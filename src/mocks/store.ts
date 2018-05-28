import { Store } from 'redux'
import * as mockStore from 'redux-mock-store'

import { defaultApplication, defaultPlayground, defaultSession, IState } from '../reducers/states'

export function mockInitialStore<P>(): Store<IState> {
  const createStore = (mockStore as any)()
  const state: IState = {
    application: defaultApplication,
    playground: defaultPlayground,
    session: defaultSession
  }
  return createStore(state)
}
