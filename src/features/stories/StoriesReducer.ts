import { createReducer } from '@reduxjs/toolkit';
import { stringify } from 'js-slang/dist/utils/stringify';
import { Reducer } from 'redux';
import { logOut } from 'src/commons/application/actions/CommonsActions';

import {
  createDefaultStoriesEnv,
  defaultStories,
  ErrorOutput,
  InterpreterOutput,
  ResultOutput
} from '../../commons/application/ApplicationTypes';
import { SourceActionType } from '../../commons/utils/ActionsHelper';
import {
  addStoryEnv,
  clearStoriesUserAndGroup,
  clearStoryEnv,
  evalStory,
  evalStoryError,
  evalStorySuccess,
  handleStoriesConsoleLog,
  notifyStoriesEvaluated,
  setCurrentStoriesGroup,
  setCurrentStoriesUser,
  setCurrentStory,
  setCurrentStoryId,
  toggleStoriesUsingSubst,
  updateStoriesList
} from './StoriesActions';
import { DEFAULT_ENV } from './storiesComponents/UserBlogContent';
import { SET_ADMIN_PANEL_STORIES_USERS, StoriesState } from './StoriesTypes';

export const StoriesReducer: Reducer<StoriesState, SourceActionType> = (
  state = defaultStories,
  action
) => {
  state = newStoriesReducer(state, action);
  state = oldStoriesReducer(state, action);
  return state;
};

const getStoriesEnv = (action: any) => action.payload?.env ?? DEFAULT_ENV;

const newStoriesReducer = createReducer(defaultStories, builder => {
  builder
    .addCase(addStoryEnv, (state, action) => {
      const env = getStoriesEnv(action);
      state.envs[env] = createDefaultStoriesEnv(
        action.payload.env,
        action.payload.chapter,
        action.payload.variant
      );
    })
    .addCase(clearStoryEnv, (state, action) => {
      if (!action.payload.env) {
        state.envs = {};
      } else {
        const { chapter, variant } = state.envs[action.payload.env].context;
        state.envs[action.payload.env] = createDefaultStoriesEnv(
          action.payload.env,
          chapter,
          variant
        );
      }
    })
    .addCase(evalStory, (state, action) => {
      const env = getStoriesEnv(action);
      state.envs[env].isRunning = true;
    })
    .addCase(evalStoryError, (state, action) => {
      const env = getStoriesEnv(action);
      const lastOutput: InterpreterOutput = state.envs[env].output.slice(-1)[0];
      let newOutput: InterpreterOutput[];
      if (lastOutput !== undefined && lastOutput.type === 'running') {
        newOutput = state.envs[env].output.slice(0, -1).concat({
          type: action.payload.type,
          errors: action.payload.errors,
          consoleLogs: lastOutput.consoleLogs
        } as ErrorOutput);
      } else {
        newOutput = state.envs[env].output.concat({
          type: action.payload.type,
          errors: action.payload.errors,
          consoleLogs: []
        } as ErrorOutput);
      }
      state.envs[env].output = newOutput;
      state.envs[env].isRunning = false;
    })
    .addCase(evalStorySuccess, (state, action) => {
      const env = getStoriesEnv(action);
      const execType = state.envs[env].context.executionMethod;
      const newOutputEntry: Partial<ResultOutput> = {
        type: action.payload.type as 'result' | undefined,
        value: execType === 'interpreter' ? action.payload.value : stringify(action.payload.value)
      };

      const lastOutput: InterpreterOutput = state.envs[env].output.slice(-1)[0];
      let newOutput: InterpreterOutput[];

      if (lastOutput !== undefined && lastOutput.type === 'running') {
        newOutput = state.envs[env].output.slice(0, -1).concat({
          consoleLogs: lastOutput.consoleLogs,
          ...newOutputEntry
        } as ResultOutput);
      } else {
        newOutput = state.envs[env].output.concat({
          consoleLogs: [],
          ...newOutputEntry
        } as ResultOutput);
      }

      state.envs[env].output = newOutput;
      state.envs[env].isRunning = false;
    })
    .addCase(handleStoriesConsoleLog, (state, action) => {
      const env = getStoriesEnv(action);
      /* Possible cases:
       * (1) state.envs[env].output === [], i.e. state.envs[env].output[-1] === undefined
       * (2) state.envs[env].output[-1] is not RunningOutput
       * (3) state.envs[env].output[-1] is RunningOutput */
      const lastOutput: InterpreterOutput = state.envs[env].output.slice(-1)[0];
      let newOutput: InterpreterOutput[];

      if (lastOutput === undefined || lastOutput.type !== 'running') {
        // New block of output.
        newOutput = state.envs[env].output.concat({
          type: 'running',
          consoleLogs: [...action.payload.logString]
        });
      } else {
        const updatedLastOutput = {
          type: lastOutput.type,
          consoleLogs: lastOutput.consoleLogs.concat(action.payload.logString)
        };
        newOutput = state.envs[env].output.slice(0, -1);
        newOutput.push(updatedLastOutput);
      }
      state.envs[env].output = newOutput;
    })
    .addCase(notifyStoriesEvaluated, (state, action) => {
      const env = getStoriesEnv(action);
      const debuggerContext = state.envs[env].debuggerContext;
      debuggerContext.result = action.payload.result;
      debuggerContext.lastDebuggerResult = action.payload.lastDebuggerResult;
      debuggerContext.code = action.payload.code;
      debuggerContext.context = action.payload.context;
      debuggerContext.workspaceLocation = 'stories';
    })
    .addCase(toggleStoriesUsingSubst, (state, action) => {
      const env = getStoriesEnv(action);
      state.envs[env].usingSubst = action.payload.usingSubst;
    })
    // New cases post-refactor
    .addCase(updateStoriesList, (state, action) => {
      state.storyList = action.payload;
    })
    .addCase(setCurrentStoryId, (state, action) => {
      state.currentStoryId = action.payload;
    })
    .addCase(setCurrentStory, (state, action) => {
      state.currentStory = action.payload;
    })
    .addCase(clearStoriesUserAndGroup, state => {
      state.userId = undefined;
      state.userName = undefined;
      state.groupId = undefined;
      state.groupName = undefined;
      state.role = undefined;
    })
    .addCase(setCurrentStoriesUser, (state, action) => {
      state.userName = action.payload.name;
      state.userId = action.payload.id;
    })
    .addCase(setCurrentStoriesGroup, (state, action) => {
      state.groupId = action.payload.id;
      state.groupName = action.payload.name;
      state.role = action.payload.role;
    })
    .addCase(logOut, () => {
      return defaultStories;
    });
});

const oldStoriesReducer: Reducer<StoriesState, SourceActionType> = (
  state = defaultStories,
  action
) => {
  switch (action.type) {
    case SET_ADMIN_PANEL_STORIES_USERS:
      return {
        ...state,
        storiesUsers: action.payload.users
      };
    default:
      return state;
  }
};
