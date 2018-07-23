import { IState, Role } from './reducers/states'
import { HistoryHelper } from './utils/history'

/**
 * Note that the properties in this interface are a 
 * subset of the properties in IState.session, so an instance
 * of an object that implements this interface cannot 
 * be used as a substitute for IState. Rather, it can be used 
 * to complement defaultState.session with saved properties.
 */
export interface ISavedState {
  historyHelper: HistoryHelper
  accessToken?: string
  refreshToken?: string
  role?: Role
  username?: string
}

export const loadStoredState = (): ISavedState | undefined => {
  try {
    const serializedState = localStorage.getItem('storedState')
    if (serializedState === null) {
      return undefined
    } else {
      return JSON.parse(serializedState) as ISavedState
    }
  } catch (err) {
    // Issue #143
    return undefined
  }
}

export const saveState = (state: IState) => {
  try {
    const stateToBeSaved: ISavedState = {
      accessToken: state.session.accessToken,
      historyHelper: state.session.historyHelper,
      refreshToken: state.session.refreshToken,
      role: state.session.role,
      username: state.session.username
    }
    const serialized = JSON.stringify(stateToBeSaved)
    localStorage.setItem('storedState', serialized)
  } catch (err) {
    // Issue #143
  }
}
