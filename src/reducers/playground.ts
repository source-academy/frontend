import { Reducer } from 'redux'

import { IAction } from '../actions/actionTypes'
import { defaultPlayground, IPlaygroundState } from './states'

export const reducer: Reducer<IPlaygroundState> = (state = defaultPlayground, action: IAction) => {
  switch (action.type) {
    default:
      return state
  }
}
