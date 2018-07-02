import { IState } from './reducers/states'
import { HistoryHelper } from './utils/history'

export interface ISavedState {
  historyHelper: HistoryHelper
  accessToken?: string
  refreshToken?: string
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
    return undefined
  }
}

export const saveState = (state: IState) => {
  try {
    const stateToBeSaved: ISavedState = {
      accessToken: state.session.accessToken,
      historyHelper: state.session.historyHelper,
      refreshToken: state.session.refreshToken,
      username: state.session.username
    }
    const serialized = JSON.stringify(stateToBeSaved)
    localStorage.setItem('storedState', serialized)
  } catch (err) {
    // Issue #143
  }
}
