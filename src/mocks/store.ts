import { Store } from 'redux'
import * as mockStore from 'redux-mock-store'

import { IState } from '../reducers'
import { ApplicationEnvironment } from '../reducers/application'

export function mockInitialStore<P>(): Store<IState> {
  const createStore = (mockStore as any)()
  const state: IState = {
    application: {
      title: 'Cadet',
      environment: ApplicationEnvironment.Development
    },
    playground: {
      editorValue: ''
    }
  }
  return createStore(state)
}
