import { createReducer } from '@reduxjs/toolkit';
import { stringify } from 'js-slang/dist/utils/stringify';
import { Reducer } from 'redux';
import { LOG_OUT } from 'src/commons/application/types/CommonsTypes';

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
  clearStoryEnv,
  evalStory,
  evalStoryError,
  evalStorySuccess,
  handleStoriesConsoleLog,
  notifyStoriesEvaluated,
  toggleStoriesUsingSubst
} from './StoriesActions';
import { DEFAULT_ENV } from './storiesComponents/UserBlogContent';
import {
  CLEAR_STORIES_USER_AND_GROUP,
  SET_CURRENT_STORIES_GROUP,
  SET_CURRENT_STORIES_USER,
  SET_CURRENT_STORY,
  SET_CURRENT_STORY_ID,
  StoriesState,
  UPDATE_STORIES_LIST
} from './StoriesTypes';

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
    });
});

const oldStoriesReducer: Reducer<StoriesState, SourceActionType> = (
  state = defaultStories,
  action
) => {
  switch (action.type) {
    // New cases post-refactor
    case UPDATE_STORIES_LIST:
      return {
        ...state,
        storyList: action.payload
      };
    case SET_CURRENT_STORY_ID:
      return {
        ...state,
        currentStoryId: action.payload
      };
    case SET_CURRENT_STORY:
      return {
        ...state,
        currentStory: action.payload
      };
    case CLEAR_STORIES_USER_AND_GROUP:
      return {
        ...state,
        userId: undefined,
        userName: undefined,
        groupId: undefined,
        groupName: undefined,
        role: undefined
      };
    case SET_CURRENT_STORIES_USER:
      return {
        ...state,
        userName: action.payload.name,
        userId: action.payload.id
      };
    case SET_CURRENT_STORIES_GROUP:
      return {
        ...state,
        groupId: action.payload.id,
        groupName: action.payload.name,
        role: action.payload.role
      };
    case LOG_OUT:
      return defaultStories;
    default:
      return state;
  }
};
