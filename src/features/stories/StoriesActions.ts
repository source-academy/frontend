import { Chapter, Context, SourceError, Value, Variant } from 'js-slang/dist/types';
import { action } from 'typesafe-actions';

import {
  ADD_STORY_ENV,
  CLEAR_STORY_ENV,
  CREATE_STORY,
  DELETE_STORY,
  EVAL_STORY,
  EVAL_STORY_ERROR,
  EVAL_STORY_SUCCESS,
  FETCH_STORY,
  GET_STORIES_LIST,
  HANDLE_STORIES_CONSOLE_LOG,
  NOTIFY_STORIES_EVALUATED,
  SAVE_STORY,
  SET_CURRENT_STORY,
  SET_CURRENT_STORY_ID,
  StoryListView,
  StoryView,
  TOGGLE_STORIES_USING_SUBST,
  UPDATE_STORIES_LIST
} from './StoriesTypes';

export const addStoryEnv = (env: string, chapter: Chapter, variant: Variant) =>
  action(ADD_STORY_ENV, { env, chapter, variant });

export const clearStoryEnv = (env?: string) => action(CLEAR_STORY_ENV, { env });

export const evalStory = (env: string, code: string) => action(EVAL_STORY, { env, code });

export const evalStoryError = (errors: SourceError[], env: string) =>
  action(EVAL_STORY_ERROR, { type: 'errors', errors, env });

export const evalStorySuccess = (value: Value, env: string) =>
  action(EVAL_STORY_SUCCESS, { type: 'result', value, env });

export const handleStoriesConsoleLog = (env: String, ...logString: string[]) =>
  action(HANDLE_STORIES_CONSOLE_LOG, { logString, env });

export const notifyStoriesEvaluated = (
  result: any,
  lastDebuggerResult: any,
  code: string,
  context: Context,
  env: string
) =>
  action(NOTIFY_STORIES_EVALUATED, {
    result,
    lastDebuggerResult,
    code,
    context,
    env
  });

export const toggleStoriesUsingSubst = (usingSubst: boolean, env: String) =>
  action(TOGGLE_STORIES_USING_SUBST, { usingSubst, env });

// New action creators post-refactor
export const getStoriesList = () => action(GET_STORIES_LIST);
export const updateStoriesList = (storyList: StoryListView[]) =>
  action(UPDATE_STORIES_LIST, storyList);
export const fetchStory = (id: number) => action(FETCH_STORY, id);
export const setCurrentStory = (story: StoryView | null) => action(SET_CURRENT_STORY, story);
export const setCurrentStoryId = (id: number | null) => action(SET_CURRENT_STORY_ID, id);
export const createStory = (story: StoryView) => action(CREATE_STORY, story); // TODO: Unused as of now
export const saveStory = (story: StoryView) => action(SAVE_STORY, story); // TODO: Unused as of now
export const deleteStory = (id: number) => action(DELETE_STORY, id);
