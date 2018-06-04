import { Reducer } from 'redux'

import { IAction, SAVE_CANVAS } from '../actions/actionTypes'
import { defaultGame, IGameState } from './states'

export const reducer: Reducer<IGameState> = (state = defaultGame, action: IAction) => {
  switch (action.type) {
    case SAVE_CANVAS:
      return {
        ...state,
        canvas: action.payload
      }
    default:
      return state
  }
}
