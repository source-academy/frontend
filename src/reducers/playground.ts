import { Action, Reducer } from 'redux'
import { IUpdateEditorValue, UPDATE_EDITOR_VALUE } from '../actions/playground'

export interface IPlaygroundState {
  editorValue: string
}

const defaultState: IPlaygroundState = {
  editorValue: ''
}

export const reducer: Reducer<IPlaygroundState> = (state = defaultState, action: Action) => {
  switch (action.type) {

  case UPDATE_EDITOR_VALUE:
    return {
      ...state,
      editorValue : (<IUpdateEditorValue> action).newEditorValue
    };

  default:
    return state;
  }
};
