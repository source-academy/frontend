import { createReducer, Reducer } from '@reduxjs/toolkit';

import { SourceActionType } from '../../utils/ActionsHelper';
import VscodeActions from '../actions/VscodeActions';
import { defaultVscode } from '../ApplicationTypes';
import { VscodeState } from '../types/VscodeTypes';

export const VscodeReducer: Reducer<VscodeState, SourceActionType> = (
  state = defaultVscode,
  action
) => {
  state = newVscodeReducer(state, action);
  return state;
};

const newVscodeReducer = createReducer(defaultVscode, builder => {
  builder.addCase(VscodeActions.setVscode, state => {
    return { ...state, ...{ isVscode: true } };
  });
});
