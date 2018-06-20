import { Reducer } from 'redux'

import { IAction, SAVE_CANVAS } from '../actions/actionTypes'
import { defaultAcademy, IAcademyState } from './states'

export const reducer: Reducer<IAcademyState> = (state = defaultAcademy, action: IAction) => {
  switch (action.type) {
    case SAVE_CANVAS:
      return {
        ...state,
        gameCanvas: action.payload
      }
    default:
      return state
  }
}
