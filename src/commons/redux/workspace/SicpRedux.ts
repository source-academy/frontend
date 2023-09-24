import { defaultSicp } from "./WorkspaceReduxTypes";
import { createPlaygroundSlice } from "./playground/PlaygroundBase";

export const { reducer: sicpReducer } = createPlaygroundSlice('sicp', defaultSicp, {})
