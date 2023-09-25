import {
  type ActionReducerMapBuilder,
  type SliceCaseReducers,
  type ValidateSliceCaseReducers,
  createSlice,
  DeepPartial
} from '@reduxjs/toolkit';
import { Chapter, Context, Variant } from 'js-slang/dist/types';
import _ from 'lodash';
import type { SALanguage } from 'src/commons/application/ApplicationTypes';
import type { Position } from 'src/commons/editor/EditorTypes';
import { createContext } from 'src/commons/utils/JsSlangHelper';

import { createActions } from '../utils';
import { getEditorReducer, isEditorAction } from './subReducers/EditorRedux';
import { isReplAction, replActions, replReducer } from './subReducers/ReplRedux';
import { isSideContentAction, sideContentActions, sideContentReducer } from './subReducers/SideContentRedux';
import { WorkspaceState } from './WorkspaceStateTypes';

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
  changeExecTime: (execTime: number) => execTime,
  changeSublanguage: (sublang: SALanguage) => sublang,
  debugReset: 0,
  debugResume: 0,
  endClearContext: (
    chapter: Chapter,
    variant: Variant,
    globals: Array<[string, any]>,
    symbols: string[]
  ) => ({
    chapter,
    variant,
    globals,
    symbols
  }),
  endDebugPause: 0,
  endInterruptExecution: 0,
  evalEditor: 0,
  evalRepl: 0,
  navDeclaration: (position: Position) => position,
  promptAutocomplete: (row: number, column: number, callback: any) => ({ row, column, callback }),
  resetWorkspace: (options: DeepPartial<WorkspaceState> = {}) => options,
  updateHasUnsavedChanges: (value: boolean) => value,
  updateSharedbConnected: (newValue: boolean) => newValue,
  updateContext: (context: Context) => context,
  updateSublanguage: (sublang: SALanguage) => sublang,
  updateWorkspace: (options: DeepPartial<WorkspaceState> = {}) => options
});

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
  const editorReducer = getEditorReducer(initialState.editorState.editorTabs);

  return createSlice<TState, TReducers, TName>({
    name,
    initialState,
    reducers,
    extraReducers: builder => {
      builder.addCase(workspaceActions.changeExecTime, (state, { payload }) => {
        state.execTime = payload;
      });

      builder.addCase(workspaceActions.debugReset, state => {
        state.isDebugging = false;
        state.isRunning = false;
      });
      builder.addCase(workspaceActions.debugResume, state => {
        state.isDebugging = false;
        state.isRunning = true;
      });

      builder.addCase(workspaceActions.endClearContext, (state, { payload }) => {
        state.context = createContext(payload.chapter, payload.symbols, '', payload.variant);

        state.globals = payload.globals;
      });

      builder.addCase(workspaceActions.endDebugPause, state => {
        state.isDebugging = true;
        state.isRunning = false;
      });

      builder.addCase(workspaceActions.endInterruptExecution, state => {
        // same as debug reset
        state.isDebugging = false;
        state.isRunning = false;
      });

      builder.addCase(workspaceActions.evalEditor, state => {
        state.isDebugging = false;
        state.isRunning = true;
      });

      builder.addCase(workspaceActions.evalRepl, state => {
        state.isRunning = true;
      });

      builder.addCase(workspaceActions.resetWorkspace, (__, { payload }) =>
        _.merge({ ...initialState }, payload)
      );

      builder.addCase(workspaceActions.updateSharedbConnected, (state, { payload }) => {
        state.sharedbConnected = payload;
      });

      builder.addCase(workspaceActions.updateWorkspace, (state, { payload }) =>
        _.merge({ ...state }, payload)
      );

      builder.addCase(workspaceActions.updateHasUnsavedChanges, (state, { payload }) => {
        state.hasUnsavedChanges = payload;
      });

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

      if (extraReducers) extraReducers(builder);

      builder.addMatcher(isEditorAction, (state, action) => {
        editorReducer(state.editorState, action)
      })

      builder.addMatcher(isReplAction, (state, action) => {
        replReducer(state.repl, action)
      })

      builder.addMatcher(isSideContentAction, (state, action) => {
        sideContentReducer(state.sideContent, action)
      })
    }
  });
};
