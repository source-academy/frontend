import { Action, ActionCreatorWithPreparedPayload, combineReducers, createReducer, PayloadAction, PayloadActionCreator } from "@reduxjs/toolkit";
import { LOG_OUT } from "src/commons/application/types/CommonsTypes";

import { assessmentActions } from "./assessment/AssessmentBase";
import { assessmentReducer, AssessmentWorkspaceState, defaultAssessment } from "./assessment/AssessmentRedux";
import { defaultGithubAssessment, githubAssessmentReducer, GitHubAssessmentWorkspaceState } from "./assessment/GithubAssesmentRedux";
import { defaultGradingState, gradingReducer, GradingWorkspaceState } from "./assessment/GradingRedux";
import { basePlaygroundReducer, playgroundBaseActions } from "./playground/PlaygroundBase";
import { defaultPlayground, playgroundReducer, PlaygroundState } from "./playground/PlaygroundRedux";
import { defaultSicp, sicpReducer, SicpWorkspaceState } from "./SicpRedux";
import { defaultSourcecast, sourcecastReducer, SourcecastWorkspaceState } from "./SourcecastRedux";
import { defaultSourcereel, sourcereelReducer, SourcereelWorkspaceState } from "./SourcereelRedux";
import { defaultStories, getDefaultStoriesEnv, storiesReducer, StoriesState } from "./StoriesRedux";
import { editorActions } from "./subReducers/EditorRedux";
import { replActions } from "./subReducers/ReplRedux";
import { NonStoryWorkspaceLocation, sideContentActions, SideContentLocation } from "./subReducers/SideContentRedux";
import { isNonStoryWorkspaceLocation, workspaceActions } from "./WorkspaceRedux";

export type WorkspaceManagerState = {
  assessment: AssessmentWorkspaceState
  githubAssessment: GitHubAssessmentWorkspaceState
  grading: GradingWorkspaceState,
  playground: PlaygroundState
  stories: StoriesState
  sicp: SicpWorkspaceState
  sourcecast: SourcecastWorkspaceState
  sourcereel: SourcereelWorkspaceState
}

const commonWorkspaceActionsInternal = {
  ...assessmentActions,
  ...editorActions,
  ...replActions,
  ...sideContentActions,
  ...playgroundBaseActions,
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

export const allWorkspaceActions = Object.entries(commonWorkspaceActionsInternal).reduce((res, [name, creator]) => ({
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

const allWorkspaceReducers = {
  assessment: assessmentReducer,
  githubAssessment: githubAssessmentReducer,
  grading: gradingReducer,
  playground: playgroundReducer,
  sicp: sicpReducer,
  sourcecast: sourcecastReducer,
  sourcereel: sourcereelReducer,
  stories: storiesReducer,
}

export const getWorkspace = <
  T extends Record<NonStoryWorkspaceLocation, any> & { stories: { envs: Record<string, any> }},
  TLoc extends SideContentLocation
>(
  source: T, location: TLoc
): TLoc extends NonStoryWorkspaceLocation ? T[TLoc] : T['stories']['envs'][TLoc] => {
  if (isNonStoryWorkspaceLocation(location)) {
    const result = source[location]
    return result
  }

  const [, storyEnv] = location.split('.')
  return source.stories.envs[storyEnv]
}

const workspaceManagerReducer = combineReducers<WorkspaceManagerState>(allWorkspaceReducers)

export const defaultWorkspaceManager: WorkspaceManagerState = {
  assessment: defaultAssessment,
  githubAssessment: defaultGithubAssessment,
  grading: defaultGradingState,
  playground: defaultPlayground,
  sicp: defaultSicp,
  sourcecast: defaultSourcecast,
  sourcereel: defaultSourcereel,
  stories: defaultStories,
}

export function getWorkspaceReducer<T extends NonStoryWorkspaceLocation>(location: T): (typeof allWorkspaceReducers)[T] {
  return allWorkspaceReducers[location]
}

const commonWorkspaceActionTypes = Object.keys(allWorkspaceActions)
const isCommonWorkspaceAction = (action: Action): action is CommonWorkspaceAction<any> => commonWorkspaceActionTypes.includes[action.type]

export const allWorkspacesReducer = createReducer(defaultWorkspaceManager, builder => {
  builder.addCase(LOG_OUT, (state) => {
    // Preserve the playground workspace even after log out
    const playground = state.playground
    return ({
      ...defaultWorkspaceManager,
      playground,
    });
  })

  builder.addMatcher(isCommonWorkspaceAction, (state, { payload: { payload, location }, ...action }) => {
    const newAction = {
      ...action,
      payload,
    }

    if (!isNonStoryWorkspaceLocation(location)) {
      const [, storyEnv] = location.split('.')
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
    } else {
      const workspace = getWorkspace(state, location)
      const reducer = getWorkspaceReducer(location)

      return {
        ...state,
        [location]: reducer(workspace as any, newAction)
      }
      // state[location] = allWorkspaceReducers[location](workspace, newAction)
    }
  })

  builder.addDefaultCase((state, action) => workspaceManagerReducer(state as WorkspaceManagerState, action))
})
