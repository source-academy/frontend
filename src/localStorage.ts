import { IPlaygroundWorkspace, ISessionState, IState } from './reducers/states'

export type ISavedState = {
  session: Partial<ISessionState>
  playgroundWorkspace: IPlaygroundWorkspace
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
      session: {
        accessToken: state.session.accessToken,
        historyHelper: state.session.historyHelper,
        refreshToken: state.session.refreshToken,
        role: state.session.role,
        username: state.session.username
      },
      playgroundWorkspace: state.workspaces.playground
    }
    const serialized = JSON.stringify(stateToBeSaved)
    localStorage.setItem('storedState', serialized)
  } catch (err) {
    // Issue #143
  }
}
