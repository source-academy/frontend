import { Action, ActionCreatorWithPreparedPayload, combineReducers, createAction, createReducer, PayloadAction, PayloadActionCreator } from "@reduxjs/toolkit";

import { replActions } from "../ReplRedux";
import { sideContentActions, SideContentLocation } from "../SideContentRedux";
import { defaultStories, getDefaultStoriesEnv, storiesReducer, StoriesState } from "../StoriesRedux";
import { editorActions } from "./EditorRedux";
import { defaultGradingState, gradingReducer, GradingWorkspaceState } from "./GradingRedux";
import { basePlaygroundReducer } from "./playground/PlaygroundBase";
import { defaultPlayground, playgroundReducer, PlaygroundState } from "./playground/PlaygroundRedux";
import { workspaceActions } from "./WorkspaceRedux";

type WorkspaceManagerState = {
  grading: GradingWorkspaceState,
  playground: PlaygroundState
  stories: StoriesState
}

const commonWorkspaceActionsInternal = {
  ...editorActions,
  ...replActions,
  ...sideContentActions,
  ...workspaceActions,
}

type CommonWorkspaceActions = {
  [K in keyof typeof commonWorkspaceActionsInternal]: ActionCreatorWithPreparedPayload<
    [location: SideContentLocation, ...Parameters<typeof commonWorkspaceActionsInternal[K]>],
    { payload: ReturnType<typeof commonWorkspaceActionsInternal[K]>['payload'], location: SideContentLocation },
    (typeof commonWorkspaceActionsInternal)[K]['type']
  >
}

type CommonWorkspaceAction<T> = PayloadAction<{ payload: T, location: SideContentLocation }>

const commonWorkspaceActions = Object.entries(commonWorkspaceActionsInternal).reduce((res, [name, creator]) => ({
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
}), {} as CommonWorkspaceActions)

const commonWorkspaceActionTypes = Object.keys(commonWorkspaceActions)

export const allWorkspaceActions = {
  ...commonWorkspaceActions,
  logOut: createAction('workspaces/logOut')
}

const allWorkspaceReducers = {
  grading: gradingReducer,
  playground: playgroundReducer,
  stories: storiesReducer,
}

const workspaceManagerReducer = combineReducers<WorkspaceManagerState>(allWorkspaceReducers)

const defaultWorkspaceManager: WorkspaceManagerState = {
  grading: defaultGradingState,
  playground: defaultPlayground,
  stories: defaultStories,
}

const isCommonWorkspaceAction = (action: Action): action is CommonWorkspaceAction<any> => commonWorkspaceActionTypes.includes[action.type]

export const allWorkspacesReducer = createReducer(defaultWorkspaceManager, builder => {
  builder.addMatcher(isCommonWorkspaceAction, (state, { payload: { payload, location }, ...action }) => {
    const newAction = {
      ...action,
      payload,
    }

    if (location.startsWith('stories')) {
      const [, storyEnv] = location.split('.')
      const storyReducer = basePlaygroundReducer(getDefaultStoriesEnv(storyEnv))
      state.stories.envs[storyEnv] = storyReducer(state.stories[storyEnv], action)
    } else {
      state[location] = allWorkspaceReducers[location](state[location], newAction)
    }
  })
  builder.addDefaultCase((state, action) => workspaceManagerReducer(state as WorkspaceManagerState, action))
})

/*
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
*/
