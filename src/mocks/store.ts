import { Store } from 'redux'
import * as mockStore from 'redux-mock-store'

import { IState } from '../reducers'
import { defaultState as defaultApplication } from '../reducers/application'
import { defaultState as defaultPlayground } from '../reducers/playground'

export function mockInitialStore<P>(): Store<IState> {
  const createStore = (mockStore as any)()
  const state: IState = {
    application: defaultApplication,
    playground: defaultPlayground
  }
  return createStore(state)
}
