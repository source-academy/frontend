import { Chapter, Context, SourceError, Value, Variant } from 'js-slang/dist/types';
import { StoriesRole } from 'src/commons/application/ApplicationTypes';
import { createActions } from 'src/commons/redux/utils';

import { AdminPanelStoriesUser, StoryData, StoryListView, StoryParams } from './StoriesTypes';

const StoriesActions = createActions('stories', {
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
  toggleStoriesUsingSubst: (usingSubst: boolean, env: string) => ({ usingSubst, env }),

  // New action creators post-refactor
  getStoriesList: () => ({}),
  updateStoriesList: (storyList: StoryListView[]) => storyList,
  setCurrentStory: (story: StoryData | null) => story,
  setCurrentStoryId: (id: number | null) => id,
  createStory: (story: StoryParams) => story,
  saveStory: (story: StoryParams, id: number) => ({ story, id }),
  deleteStory: (id: number) => id,

  // Auth-related actions
  getStoriesUser: () => ({}),
  setCurrentStoriesUser: (id?: number, name?: string) => ({ id, name }),
  setCurrentStoriesGroup: (id?: number, name?: string, role?: StoriesRole) => ({ id, name, role }),

  // Helper/wrapper actions
  clearStoriesUserAndGroup: () => ({}),
  fetchAdminPanelStoriesUsers: () => ({}),
  setAdminPanelStoriesUsers: (users: AdminPanelStoriesUser[]) => ({ users })
});

// For compatibility with existing code (actions helper)
export default StoriesActions;
