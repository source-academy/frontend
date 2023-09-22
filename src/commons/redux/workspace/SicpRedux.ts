import { defaultEditorValue, getDefaultFilePath } from "../../application/ApplicationTypes";
import { createPlaygroundSlice, getDefaultPlaygroundState,PlaygroundWorkspaceState } from "./playground/PlaygroundBase";

export type SicpWorkspaceState = PlaygroundWorkspaceState
export const defaultSicp: SicpWorkspaceState = getDefaultPlaygroundState([{
  filePath: getDefaultFilePath('sicp'),
  value: defaultEditorValue,
  highlightedLines: [],
  breakpoints: []
}])

export const { reducer: sicpReducer } = createPlaygroundSlice('sicp', defaultSicp, {})
