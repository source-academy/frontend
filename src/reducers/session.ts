import { Reducer } from 'redux'

import { defaultSession, ISessionState } from './states'

export const reducer: Reducer<ISessionState> = (state = defaultSession, {}) => {
  return state
}
