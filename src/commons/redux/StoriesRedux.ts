import { createSlice,PayloadAction } from "@reduxjs/toolkit";
import { Chapter, Variant } from "js-slang/dist/types";
import { StoryData, StoryListView } from "src/features/stories/StoriesTypes";

import { StoriesRole } from "../application/ApplicationTypes";
import Constants from "../utils/Constants";
import { createContext } from "../utils/JsSlangHelper";
import { getDefaultPlaygroundState,PlaygroundWorkspaceState } from "./workspace/playground/PlaygroundBase";

export type StoriesAuthState = {
  readonly userId?: number;
  readonly userName?: string;
  readonly groupId?: number;
  readonly groupName?: string;
  readonly role?: StoriesRole;
};

export type StoriesEnvState = PlaygroundWorkspaceState

export type StoriesState = {
  readonly storyList: StoryListView[];
  readonly currentStoryId: number | null;
  readonly currentStory: StoryData | null;
  readonly envs: { [key: string]: StoriesEnvState };
} & StoriesAuthState;

export const defaultStories: StoriesState = {
  storyList: [],
  currentStory: null,
  currentStoryId: null,
  envs: {}
}

export const getDefaultStoriesEnv = (
  env: string,
  chapter: Chapter = Constants.defaultSourceChapter,
  variant: Variant = Constants.defaultSourceVariant
): StoriesEnvState => ({
  ...getDefaultPlaygroundState(),
  context: createContext(
    chapter,
    [],
    env,
    variant
  )
})

export const { actions: storiesActions, reducer: storiesReducer } = createSlice({
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
