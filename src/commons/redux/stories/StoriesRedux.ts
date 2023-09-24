import { createSlice,PayloadAction } from "@reduxjs/toolkit";
import { Chapter, Variant } from "js-slang/dist/types";
import { StoriesRole, StoryData, StoryListView, StoryParams } from "src/features/stories/StoriesTypes";
import { NameUsernameRole } from "src/pages/academy/adminPanel/subcomponents/AddStoriesUserPanel";

import { defaultStories, getDefaultStoriesEnv } from "../workspace/WorkspaceReduxTypes";
import { createActions } from "../utils";

const { actions: reducerActions, reducer: storiesReducer } = createSlice({
  name: 'stories',
  initialState: defaultStories,
  reducers: {
    addStoryEnv: {
      prepare: (env: string, chapter: Chapter, variant: Variant) => ({ payload: { env, chapter, variant }}),
      reducer(state, { payload }: PayloadAction<{ env: string, chapter: Chapter, variant: Variant }>) {
        state.envs[payload.env] = getDefaultStoriesEnv(payload.env, payload.chapter, payload.variant)
      }
    },
    clearStoryEnv(state, { payload: env }: PayloadAction<string | undefined>) {
      if (env === undefined) {
        state.envs = {}
      } else {
        const { chapter, variant } = state.envs[env].context
        state.envs[env] = getDefaultStoriesEnv(env, chapter, variant)
      }
    },
    // TODO: Handle logout
    setCurrentStory(state, { payload }: PayloadAction<StoryData | null>) {
      state.currentStory = payload
    },
    setCurrentStoryId(state, { payload }: PayloadAction<number | null>) {
      state.currentStoryId = payload
    },
    setCurrentStoriesGroup: {
      prepare: (id?: number, name?: string, role?: StoriesRole) => ({ payload: { id, name, role }}),
      reducer(state, { payload }: PayloadAction<{ id?: number, name?: string, role?: StoriesRole }>) {
        state.groupId = payload.id
        state.groupName = payload.name
        state.role = payload.role
      }
    },  
    setCurrentStoriesUser: {
      prepare: (id?: number, name?: string) => ({ payload: { id, name }}),
      reducer(state, { payload }: PayloadAction<{ id?: number, name?: string }>) {
        state.userId = payload.id
        state.userName = payload.name
      }
    },
    updateStoriesList(state, { payload }: PayloadAction<StoryListView[]>) {
      state.storyList = payload
    }
  }
})

export const sagaActions = createActions('stories', {
  addNewStoriesUsersToCourse: (users: NameUsernameRole[], provider: string) => ({ users, provider }),
  createStory: (storyParams: StoryParams) => storyParams,
  deleteStory: (storyId: number) => storyId,
  evalStory: (env: string, code: string) => ({ env, code }),
  getStoriesList: (storyId: number | null = null) => storyId,
  getStoriesUser: 0,
  saveStory: (story: StoryData, id: number) => ({ story, id}),
})

export const storiesActions = {
  ...sagaActions,
  ...reducerActions,
}

export { storiesReducer, reducerActions }

