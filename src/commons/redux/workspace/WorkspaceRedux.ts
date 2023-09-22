import { ActionReducerMapBuilder, combineReducers, createSlice, SliceCaseReducers,ValidateSliceCaseReducers } from "@reduxjs/toolkit";
import { Chapter, Context, Variant } from "js-slang/dist/types";
import { InterpreterOutput } from "src/commons/application/ApplicationTypes";
import { Position } from "src/commons/editor/EditorTypes";
import Constants from "src/commons/utils/Constants";
import { createContext } from "src/commons/utils/JsSlangHelper";
import { DebuggerContext, EditorTabState } from "src/commons/workspace/WorkspaceTypes";

import { createActions } from "../utils";
import { WorkspaceManagerState } from "./AllWorkspacesRedux";
import { StoriesEnvState } from "./StoriesRedux";
import { EditorState, getDefaultEditorState, getEditorReducer } from "./subReducers/EditorRedux";
import { defaultRepl,replActions,replReducer,ReplState } from "./subReducers/ReplRedux";
import { defaultSideContent, NonStoryWorkspaceLocation, sideContentActions, SideContentLocation, sideContentReducer, SideContentState, StoryWorkspaceLocation } from "./subReducers/SideContentRedux";

export type WorkspaceState = {
  readonly context: Context;
  readonly debuggerContext: DebuggerContext;

  readonly editorState: EditorState
  readonly enableDebugging: boolean;
  readonly execTime: number;

  readonly globals: Array<[string, any]>;

  readonly hasUnsavedChanges: boolean

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
  hasUnsavedChanges: false,
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

export const isNonStoryWorkspaceLocation = (location: SideContentLocation): location is NonStoryWorkspaceLocation => !location.startsWith('stories')

export function getWorkspaceSelector(location: StoryWorkspaceLocation): (state: WorkspaceManagerState) => StoriesEnvState
export function getWorkspaceSelector<T extends NonStoryWorkspaceLocation>(location: T): (state: WorkspaceManagerState) => WorkspaceManagerState[T]
export function getWorkspaceSelector<T extends SideContentLocation>(location :T) {
  if (isNonStoryWorkspaceLocation(location)) {
    return (state: WorkspaceManagerState) => state[location]
  } else {
    const [, storyEnv] = location.split('.')
    return (state: WorkspaceManagerState) => state.stories.envs[storyEnv]
  }
}

export const workspaceActions = createActions('workspace', {
  beginClearContext: (
    chapter: Chapter,
    variant: Variant,
    globals: Array<[string, any]>, 
    symbols: string[]
  ) => ({ chapter, variant, globals, symbols }),
  beginDebugPause: 0,
  beginInterruptExecution: 0,
  chapterSelect: (chapter: Chapter, variant: Variant) => ({ chapter, variant }),
  debugReset: 0,
  debugResume: 0,
  endClearContext: (chapter: Chapter, variant: Variant, globals: Array<[string, any]>, symbols: string[]) => ({
    chapter, variant, globals, symbols
  }),
  endDebugPause: 0,
  endInterruptExecution: 0,
  evalEditor: 0,
  evalRepl: 0,
  navDeclaration: (position: Position) => position,
  promptAutocomplete: (row: number, column: number, callback: any) => ({ row, column, callback }),
  resetWorkspace: (options: Partial<WorkspaceState>) => options,
  setFolderMode: (value: boolean) => value,
  toggleEditorAutorun: 0,
  toggleFolderMode: 0,
  updateHasUnsavedChanges: (value: boolean) => value,
  updateWorkspace: (options: Partial<WorkspaceState>) =>  options
})

export const createWorkspaceSlice = <
  TState extends WorkspaceState,
  TReducers extends SliceCaseReducers<TState>,
  TName extends string = string
>(
  name: TName,
  initialState: TState,
  reducers: ValidateSliceCaseReducers<TState, TReducers>,
  extraReducers?: (builder: ActionReducerMapBuilder<TState>) => void
) => {
  const editorReducer = getEditorReducer(initialState.editorState.editorTabs)

  const subReducer = combineReducers({
    editorState: editorReducer,
    sideContent: sideContentReducer,
    repl: replReducer
  })

  return createSlice<TState, TReducers, TName>({
    name,
    initialState,
    reducers,
    extraReducers: builder => {
      builder.addCase(workspaceActions.debugReset, (state) => {
        state.isDebugging = false;
        state.isRunning = false;
      })
      builder.addCase(workspaceActions.debugResume, (state) => {
        state.isDebugging = false;
        state.isRunning = true;
      })

      builder.addCase(workspaceActions.endClearContext, (state, { payload }) => {
        state.context = createContext(
          payload.chapter,
          payload.symbols,
          '',
          payload.variant
        )

        state.globals = payload.globals
      })

      builder.addCase(workspaceActions.endDebugPause, (state) => {
        state.isDebugging = true;
        state.isRunning = false;
      })

      builder.addCase(workspaceActions.endInterruptExecution, (state) => {
        // same as debug reset
        state.isDebugging = false;
        state.isRunning = false;
      })  

      builder.addCase(workspaceActions.evalEditor, (state) => {
        state.isDebugging = false;
        state.isRunning = true;
      })
      
      builder.addCase(workspaceActions.evalRepl, (state) => {
        state.isRunning = true;
      })

      builder.addCase(workspaceActions.resetWorkspace, (_, { payload }) => ({
        ...initialState,
        ...payload
      }))
      
      builder.addCase(workspaceActions.setFolderMode, (state, { payload }) => {
        state.isFolderModeEnabled = payload;
      })

      builder.addCase(workspaceActions.toggleEditorAutorun, state => {
        state.isEditorAutorun = !state.isEditorAutorun
      })

      builder.addCase(workspaceActions.updateWorkspace, (state, { payload }) => ({
        ...state,
        ...payload
      }))

      builder.addCase(workspaceActions.updateHasUnsavedChanges, (state, { payload }) => {
        state.hasUnsavedChanges = payload
      })

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

      if (extraReducers) extraReducers(builder)

      builder.addDefaultCase((state, action) => {
        subReducer(state, action)
      })
    }
  });
}
