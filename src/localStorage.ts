import { IState } from './reducers/states'
import { HistoryHelper } from './utils/history'

export interface ISavedState {
  historyHelper: HistoryHelper,
  token?: string,
  username?: string
}

export const loadStoredState = (): ISavedState | undefined => {
  try {
    const serializedState = localStorage.getItem('storedState')
    if (serializedState === null) {
      return undefined
    } else {
      // tslint:disable-next-line
      console.log("Loading State: \n" + serializedState)
      return JSON.parse(serializedState) as ISavedState
    }
  } catch (err) {
    return undefined
  }
}

export const saveState = (state: IState) => {
  try {
    const stateToBeSaved: ISavedState = {
      token: state.session.token,
      username: state.session.username,
      historyHelper: state.session.historyHelper
    }
    // tslint:disable-next-line
    console.log("Saving State: \n" + JSON.stringify(stateToBeSaved))
    const serialized = JSON.stringify(stateToBeSaved)
    localStorage.setItem('storedState', serialized)
  } catch (err) {
    // TODO catch possible errors
  }
}
