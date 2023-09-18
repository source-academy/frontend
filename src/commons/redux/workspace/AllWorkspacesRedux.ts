import { ActionCreatorWithPreparedPayload, PayloadAction, PayloadActionCreator } from "@reduxjs/toolkit";
import { SourceActionType } from "src/commons/utils/ActionsHelper";
import { StoriesState } from "src/features/stories/StoriesTypes";

import { SideContentLocation } from "../SideContentRedux";
import { getDefaultStoriesEnv } from "../StoriesRedux";
import { basePlaygroundReducer } from "./playground/PlaygroundBase";
import { playgroundReducer,PlaygroundState } from "./playground/PlaygroundRedux";
import { createWorkspaceSlice, getDefaultWorkspaceState } from "./WorkspaceRedux";

const { actions } = createWorkspaceSlice('sicp', getDefaultWorkspaceState([]), {
  testAction(state) {}
})

type WorkspaceManagerState = {
  playground: PlaygroundState
  stories: StoriesState
}

type AllWorkspaceActions = {
  [K in keyof typeof actions]: ActionCreatorWithPreparedPayload<
    [location: SideContentLocation, ...Parameters<typeof actions[K]>],
    { payload: ReturnType<typeof actions[K]>['payload'], location: SideContentLocation },
    (typeof actions)[K]['type']
  >
}

export const allWorkspaceActions = Object.entries(actions).reduce((res, [name, creator]) => ({
  ...res,
  [name]: (location: SideContentLocation, ...args: any) => {
    // @ts-ignore
    const action = (creator as PayloadActionCreator<PayloadAction<any>>)(...args)
    return {
      ...action,
      payload: {
        payload: action.payload,
        location
      }
    }
  }
}), {} as AllWorkspaceActions)

const allWorkspaceReducers = {
  playground: playgroundReducer,
}

export function allWorkspacesReducer(state: WorkspaceManagerState, action: SourceActionType) {
  let workspaceLocation: SideContentLocation
  if ((action as any).location) {
    workspaceLocation = (action as any).location
  } else {
    workspaceLocation = 'assessment'
  }

  switch(action.type) {
    default: {
      const newAction = {
        ...action,
        payload: (action as any).payload
      }

      if (workspaceLocation.startsWith('stories')) {
        const [, storyEnv] = workspaceLocation.split('.')
        const storyReducer = basePlaygroundReducer(getDefaultStoriesEnv(storyEnv))

        return {
          ...state,
          stories: {
            ...state.stories,
            envs: {
              ...state.stories.envs,
              [storyEnv]: storyReducer(state.stories[storyEnv], action)
            }
          }
        } 
      }

      return {
        ...state,
        [workspaceLocation]: allWorkspaceReducers[workspaceLocation](state[workspaceLocation], newAction)
      }
    }
  }
}
