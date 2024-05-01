import { createAction } from '@reduxjs/toolkit';
import { Chapter, Context, SourceError, Value, Variant } from 'js-slang/dist/types';
import { StoriesRole } from 'src/commons/application/ApplicationTypes';
import { createActions } from 'src/commons/redux/utils';

import {
  CLEAR_STORIES_USER_AND_GROUP,
  GET_STORIES_USER,
  SET_CURRENT_STORIES_GROUP,
  SET_CURRENT_STORIES_USER,
  StoryData,
  StoryListView,
  StoryParams
} from './StoriesTypes';

export const newActions = createActions('stories', {
  addStoryEnv: (env: string, chapter: Chapter, variant: Variant) => ({ env, chapter, variant }),
  clearStoryEnv: (env?: string) => ({ env }),
  evalStory: (env: string, code: string) => ({ env, code }),
  evalStoryError: (errors: SourceError[], env: string) => ({ type: 'errors', errors, env }),
  evalStorySuccess: (value: Value, env: string) => ({ type: 'result', value, env }),
  handleStoriesConsoleLog: (env: string, ...logString: string[]) => ({ logString, env }),
  notifyStoriesEvaluated: (
    result: any,
    lastDebuggerResult: any,
    code: string,
    context: Context,
    env: string
  ) => ({ result, lastDebuggerResult, code, context, env }),
  toggleStoriesUsingSubst: (usingSubst: boolean, env: String) => ({ usingSubst, env }),

  // New action creators post-refactor
  getStoriesList: () => ({}),
  updateStoriesList: (storyList: StoryListView[]) => storyList,
  setCurrentStory: (story: StoryData | null) => story,
  setCurrentStoryId: (id: number | null) => id,
  createStory: (story: StoryParams) => story,
  saveStory: (story: StoryParams, id: number) => ({ story, id }),
  deleteStory: (id: number) => id
});

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
