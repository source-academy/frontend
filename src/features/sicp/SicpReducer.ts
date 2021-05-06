import { Action, Reducer } from 'redux';
import { defaultSicp } from 'src/commons/application/ApplicationTypes';

import { SicpState } from './SicpTypes';

export const SicpReducer: Reducer<SicpState> = (
    state = defaultSicp,
    action: Action
) => {
    return state;
};