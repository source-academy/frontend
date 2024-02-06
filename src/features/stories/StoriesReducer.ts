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
import { DEFAULT_ENV } from './storiesComponents/UserBlogContent';
import {
  ADD_STORY_ENV,
  CLEAR_STORIES_USER_AND_GROUP,
  CLEAR_STORY_ENV,
  EVAL_STORY,
  EVAL_STORY_ERROR,
  EVAL_STORY_SUCCESS,
  HANDLE_STORIES_CONSOLE_LOG,
  NOTIFY_STORIES_EVALUATED,
  SET_CURRENT_STORIES_GROUP,
  SET_CURRENT_STORIES_USER,
  SET_CURRENT_STORY,
  SET_CURRENT_STORY_ID,
  StoriesState,
  TOGGLE_STORIES_USING_SUBST,
  UPDATE_STORIES_LIST
} from './StoriesTypes';

export const StoriesReducer: Reducer<StoriesState> = (
  state = defaultStories,
  action: SourceActionType
) => {
  const env: string = (action as any).payload?.env ?? DEFAULT_ENV;
  let newOutput: InterpreterOutput[];
  let lastOutput: InterpreterOutput;
  switch (action.type) {
    case ADD_STORY_ENV:
      return {
        ...state,
        envs: {
          ...state.envs,
          [env]: {
            ...createDefaultStoriesEnv(
              action.payload.env,
              action.payload.chapter,
              action.payload.variant
            )
          }
        }
      };
    case CLEAR_STORY_ENV:
      if (!action.payload.env) {
        return {
          ...state,
          envs: {}
        };
      } else {
        const chapter = state.envs[action.payload.env].context.chapter;
        const variant = state.envs[action.payload.env].context.variant;
        return {
          ...state,
          envs: {
            ...state.envs,
            [action.payload.env]: {
              ...createDefaultStoriesEnv(action.payload.env, chapter, variant)
            }
          }
        };
      }

    case EVAL_STORY:
      return {
        ...state,
        envs: {
          ...state.envs,
          [env]: {
            ...state.envs[env],
            isRunning: true
          }
        }
      };
    case EVAL_STORY_ERROR:
      lastOutput = state.envs[env].output.slice(-1)[0];
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
      return {
        ...state,
        envs: {
          ...state.envs,
          [env]: {
            ...state.envs[env],
            output: newOutput,
            isRunning: false
          }
        }
      };
    case EVAL_STORY_SUCCESS:
      const execType = state.envs[env].context.executionMethod;
      const newOutputEntry: Partial<ResultOutput> = {
        type: action.payload.type as 'result' | undefined,
        value: execType === 'interpreter' ? action.payload.value : stringify(action.payload.value)
      };
      lastOutput = state.envs[env].output.slice(-1)[0];
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

      return {
        ...state,
        envs: {
          ...state.envs,
          [env]: {
            ...state.envs[env],
            output: newOutput,
            isRunning: false
          }
        }
      };
    case HANDLE_STORIES_CONSOLE_LOG:
      /* Possible cases:
       * (1) state.envs[env].output === [], i.e. state.envs[env].output[-1] === undefined
       * (2) state.envs[env].output[-1] is not RunningOutput
       * (3) state.envs[env].output[-1] is RunningOutput */
      lastOutput = state.envs[env].output.slice(-1)[0];
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
      return {
        ...state,
        envs: {
          ...state.envs,
          [env]: {
            ...state.envs[env],
            output: newOutput
          }
        }
      };
    case NOTIFY_STORIES_EVALUATED:
      return {
        ...state,
        envs: {
          ...state.envs,
          [env]: {
            ...state.envs[env],
            debuggerContext: {
              ...state.envs[env].debuggerContext,
              result: action.payload.result,
              lastDebuggerResult: action.payload.lastDebuggerResult,
              code: action.payload.code,
              context: action.payload.context,
              workspaceLocation: 'stories'
            }
          }
        }
      };
    case TOGGLE_STORIES_USING_SUBST:
      return {
        ...state,
        envs: {
          ...state.envs,
          [env]: {
            ...state.envs[env],
            usingSubst: action.payload.usingSubst
          }
        }
      };
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
