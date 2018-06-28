import { IState } from './reducers/states'

export const loadStoredState = (): IState | undefined => {
  try {
    const serializedState = localStorage.getItem('state')
    if (serializedState === null) {
      return undefined
    } else {
      return JSON.parse(serializedState) as IState
    }
  } catch (err) {
    return undefined
  }
}

export const saveState = (state: IState) => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem('state', serializedState)
  } catch (err) {
    // TODO catch possible errors
  }
}
