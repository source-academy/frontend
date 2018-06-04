import { Reducer } from 'redux'

import { IAction } from '../actions/actionTypes'
import { defaultGame, IGameState } from './states'

export const reducer: Reducer<IGameState> = (state = defaultGame, action: IAction) => {
  return state
}
