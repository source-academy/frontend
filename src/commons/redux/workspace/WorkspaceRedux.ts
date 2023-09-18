import { combineReducers, createSlice, Draft, PayloadAction, SliceCaseReducers } from "@reduxjs/toolkit";
import { Context } from "js-slang/dist/types";
import { InterpreterOutput } from "src/commons/application/ApplicationTypes";
import Constants from "src/commons/utils/Constants";
import { createContext } from "src/commons/utils/JsSlangHelper";
import { DebuggerContext, EditorTabState } from "src/commons/workspace/WorkspaceTypes";

import { defaultRepl,replActions,replReducer,ReplState } from "../ReplRedux";
import { defaultSideContent, sideContentActions, sideContentReducer, SideContentState } from "../SideContentRedux";
import { EditorState, getDefaultEditorState, getEditorSlice } from "./EditorRedux";

export type WorkspaceState = {
  readonly context: Context;
  readonly debuggerContext: DebuggerContext;

  readonly editorState: EditorState
  readonly enableDebugging: boolean;
  readonly execTime: number;

  readonly globals: Array<[string, any]>;

  readonly isDebugging: boolean;
  readonly isEditorAutorun: boolean;
  readonly isEditorReadonly: boolean;
  readonly isFolderModeEnabled: boolean;
  readonly isRunning: boolean;

  readonly output: InterpreterOutput[];

  readonly programPrependValue: string;
  readonly programPostpendValue: string;
  readonly repl: ReplState;
  readonly sideContent: SideContentState
  // readonly sharedbConnected: boolean;
}

export const getDefaultWorkspaceState = (initialTabs: EditorTabState[] = []): WorkspaceState => ({
  context: createContext(
    Constants.defaultSourceChapter,
    [],
    {},
    Constants.defaultSourceVariant
  ),
  debuggerContext: {} as DebuggerContext,
  editorState: getDefaultEditorState(initialTabs),
  enableDebugging: true,
  execTime: 1000,
  isDebugging: false,
  isEditorAutorun: false,
  isEditorReadonly: false,
  isFolderModeEnabled: false,
  isRunning: false,
  globals: [],
  output: [],
  repl: defaultRepl,
  programPostpendValue: '',
  programPrependValue: '',
  sideContent: defaultSideContent,
})

const workspaceReducers = {
  debugReset(state: Draft<WorkspaceState>) {
    state.isDebugging = false;
    state.isRunning = false;
  },
  debugResume(state: Draft<WorkspaceState>) {
    state.isDebugging = false;
    state.isRunning = true;
  },
  endClearContext(state: Draft<WorkspaceState>) {
    // TODO Investigate
  },
  endDebugPause(state: Draft<WorkspaceState>) {
    state.isDebugging = true;
    state.isRunning = false;
  },
  endInterruptExecution(state: Draft<WorkspaceState>) {
    // same as debug reset
    state.isDebugging = false;
    state.isRunning = false;
  },
  evalEditor(state: Draft<WorkspaceState>) {
    state.isDebugging = false;
    state.isRunning = true;
  },
  evalRepl(state: Draft<WorkspaceState>) {
    state.isRunning = true;
  },
  setFolderMode(state: Draft<WorkspaceState>, { payload }: PayloadAction<boolean>) {
    state.isFolderModeEnabled = payload;
  },
} as const

type BaseWorkspaceReducers = typeof workspaceReducers

export const createWorkspaceSlice = <
  TState extends WorkspaceState,
  TReducers extends SliceCaseReducers<TState>,
  TName extends string = string
>(
  name: TName,
  initialState: TState,
  reducers: TReducers,
) => {
  const { actions: editorActions, reducer: editorReducer } = getEditorSlice(initialState.editorState.editorTabs)

  const subReducer = combineReducers({
    editorState: editorReducer,
    sideContent: sideContentReducer,
    repl: replReducer
  })

  const { actions, reducer } = createSlice<TState, TReducers & BaseWorkspaceReducers, TName>({
    name,
    initialState: initialState,
    reducers: {
      ...workspaceReducers,
      ...reducers,
    } as any,
    extraReducers: builder => {
      builder.addCase(replActions.evalInterpreterError, state => {
        state.isDebugging = false;
        state.isRunning = false;
      });

      builder.addCase(replActions.evalInterpreterSuccess, state => {
        state.isRunning = false;
      });

      builder.addCase(sideContentActions.notifyProgramEvaluated, (state, { payload }) => {
        state.debuggerContext = payload;
      });

      builder.addDefaultCase((state, action) => {
        subReducer(state, action)
      })
    }
  });

  return { reducer, actions: {
    ...editorActions,
    ...sideContentActions,
    ...replActions,
    ...actions,
  }}
}
