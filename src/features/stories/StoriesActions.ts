import { createAction } from '@reduxjs/toolkit';
import { Chapter, Context, SourceError, Value, Variant } from 'js-slang/dist/types';
import { StoriesRole } from 'src/commons/application/ApplicationTypes';

import {
  ADD_STORY_ENV,
  CLEAR_STORIES_USER_AND_GROUP,
  CLEAR_STORY_ENV,
  CREATE_STORY,
  DELETE_STORY,
  EVAL_STORY,
  EVAL_STORY_ERROR,
  EVAL_STORY_SUCCESS,
  GET_STORIES_LIST,
  GET_STORIES_USER,
  HANDLE_STORIES_CONSOLE_LOG,
  NOTIFY_STORIES_EVALUATED,
  SAVE_STORY,
  SET_CURRENT_STORIES_GROUP,
  SET_CURRENT_STORIES_USER,
  SET_CURRENT_STORY,
  SET_CURRENT_STORY_ID,
  StoryData,
  StoryListView,
  StoryParams,
  TOGGLE_STORIES_USING_SUBST,
  UPDATE_STORIES_LIST
} from './StoriesTypes';

export const addStoryEnv = createAction(
  ADD_STORY_ENV,
  (env: string, chapter: Chapter, variant: Variant) => ({ payload: { env, chapter, variant } })
);

export const clearStoryEnv = createAction(CLEAR_STORY_ENV, (env?: string) => ({
  payload: { env }
}));

export const evalStory = createAction(EVAL_STORY, (env: string, code: string) => ({
  payload: { env, code }
}));

export const evalStoryError = createAction(
  EVAL_STORY_ERROR,
  (errors: SourceError[], env: string) => ({ payload: { type: 'errors', errors, env } })
);

export const evalStorySuccess = createAction(EVAL_STORY_SUCCESS, (value: Value, env: string) => ({
  payload: { type: 'result', value, env }
}));

export const handleStoriesConsoleLog = createAction(
  HANDLE_STORIES_CONSOLE_LOG,
  (env: string, ...logString: string[]) => ({ payload: { logString, env } })
);

export const notifyStoriesEvaluated = createAction(
  NOTIFY_STORIES_EVALUATED,
  (result: any, lastDebuggerResult: any, code: string, context: Context, env: string) => ({
    payload: { result, lastDebuggerResult, code, context, env }
  })
);

export const toggleStoriesUsingSubst = createAction(
  TOGGLE_STORIES_USING_SUBST,
  (usingSubst: boolean, env: String) => ({ payload: { usingSubst, env } })
);

// New action creators post-refactor
export const getStoriesList = createAction(GET_STORIES_LIST, () => ({ payload: {} }));
export const updateStoriesList = createAction(
  UPDATE_STORIES_LIST,
  (storyList: StoryListView[]) => ({ payload: storyList })
);
export const setCurrentStory = createAction(SET_CURRENT_STORY, (story: StoryData | null) => ({
  payload: story
}));
export const setCurrentStoryId = createAction(SET_CURRENT_STORY_ID, (id: number | null) => ({
  payload: id
}));
export const createStory = createAction(CREATE_STORY, (story: StoryParams) => ({ payload: story }));
export const saveStory = createAction(SAVE_STORY, (story: StoryParams, id: number) => ({
  payload: { story, id }
}));
export const deleteStory = createAction(DELETE_STORY, (id: number) => ({ payload: id }));
// Auth-related actions
export const getStoriesUser = createAction(GET_STORIES_USER, () => ({ payload: {} }));
export const setCurrentStoriesUser = createAction(
  SET_CURRENT_STORIES_USER,
  (id?: number, name?: string) => ({ payload: { id, name } })
);
export const setCurrentStoriesGroup = createAction(
  SET_CURRENT_STORIES_GROUP,
  (id?: number, name?: string, role?: StoriesRole) => ({ payload: { id, name, role } })
);
// Helper/wrapper actions
export const clearStoriesUserAndGroup = createAction(CLEAR_STORIES_USER_AND_GROUP, () => ({
  payload: {}
}));
