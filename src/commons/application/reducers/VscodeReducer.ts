import { Reducer, createReducer } from '@reduxjs/toolkit';

import { SourceActionType } from '../../utils/ActionsHelper';
import { defaultVscode } from '../ApplicationTypes';
import VscodeActions from '../actions/VscodeActions';
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
