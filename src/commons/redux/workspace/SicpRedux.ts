import { createPlaygroundSlice } from './playground/PlaygroundBase';
import { defaultSicp } from './WorkspaceReduxTypes';

export const { reducer: sicpReducer } = createPlaygroundSlice('sicp', defaultSicp, {});
