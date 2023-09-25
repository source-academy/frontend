import {
  Action,
  combineReducers,
  createReducer,
  PayloadAction,
} from '@reduxjs/toolkit';
import { LOG_OUT } from 'src/commons/application/types/CommonsTypes';

import { storiesReducer } from '../stories/StoriesRedux';
import { addLocation } from '../utils';
import { assessmentActions } from './assessment/AssessmentBase';
import { assessmentReducer } from './assessment/AssessmentRedux';
import { githubAssessmentReducer } from './assessment/GithubAssesmentRedux';
import { gradingReducer } from './assessment/GradingRedux';
import { basePlaygroundReducer, playgroundBaseActions } from './playground/PlaygroundBase';
import { playgroundReducer } from './playground/PlaygroundRedux';
import { sicpReducer } from './SicpRedux';
import { sourcecastReducer } from './sourceRecorder/SourcecastRedux';
import { sourcereelReducer } from './sourceRecorder/SourcereelRedux';
import { editorActions } from './subReducers/EditorRedux';
import { replActions } from './subReducers/ReplRedux';
import { sideContentActions } from './subReducers/SideContentRedux';
import { workspaceActions } from './WorkspaceRedux';
import {
  defaultWorkspaceManager,
  getDefaultStoriesEnv,
  isNonStoryWorkspaceLocation,
  NonStoryWorkspaceLocation,
  SideContentLocation,
  StoriesEnvState,
  StoryWorkspaceLocation,
  WorkspaceManagerState,
} from './WorkspaceReduxTypes';
import { WorkspaceState } from './WorkspaceStateTypes';

const commonWorkspaceActionsInternal = {
  ...editorActions,
  ...replActions,
  ...sideContentActions,
  ...workspaceActions
};

type CommonWorkspaceAction<T> = PayloadAction<{ payload: T; location: SideContentLocation }>;

export function getWorkspaceSelector(
  location: StoryWorkspaceLocation
): (state: WorkspaceManagerState) => StoriesEnvState;
export function getWorkspaceSelector<T extends NonStoryWorkspaceLocation>(
  location: T
): (state: WorkspaceManagerState) => WorkspaceManagerState[T];
export function getWorkspaceSelector(
  location: SideContentLocation
): (state: WorkspaceManagerState) => WorkspaceState;
export function getWorkspaceSelector<T extends SideContentLocation>(location: T) {
  if (isNonStoryWorkspaceLocation(location)) {
    return (state: WorkspaceManagerState) => state[location];
  } else {
    const [, storyEnv] = location.split('.');
    return (state: WorkspaceManagerState) => state.stories.envs[storyEnv];
  }
}

export const allWorkspaceActions = {
  ...addLocation<typeof commonWorkspaceActionsInternal, SideContentLocation>(commonWorkspaceActionsInternal),
  ...playgroundBaseActions,
  ...assessmentActions
}

const allWorkspaceReducers = {
  assessment: assessmentReducer,
  githubAssessment: githubAssessmentReducer,
  grading: gradingReducer,
  playground: playgroundReducer,
  sicp: sicpReducer,
  sourcecast: sourcecastReducer,
  sourcereel: sourcereelReducer,
  stories: storiesReducer
};

const workspaceManagerReducer = combineReducers<WorkspaceManagerState>(allWorkspaceReducers);

export const getWorkspace = <
  T extends Record<NonStoryWorkspaceLocation, any> & { stories: { envs: Record<string, any> } },
  TLoc extends SideContentLocation
>(
  source: T,
  location: TLoc
): TLoc extends NonStoryWorkspaceLocation ? T[TLoc] : T['stories']['envs'][TLoc] => {
  if (isNonStoryWorkspaceLocation(location)) {
    const result = source[location];
    return result;
  }

  const [, storyEnv] = location.split('.');
  return source.stories.envs[storyEnv];
};

export function getWorkspaceReducer<T extends NonStoryWorkspaceLocation>(
  location: T
): (typeof allWorkspaceReducers)[T] {
  return allWorkspaceReducers[location];
}

const commonWorkspaceActionTypes = Object.values(allWorkspaceActions).map(creator => creator.type);

const isCommonWorkspaceAction = (action: Action): action is CommonWorkspaceAction<any> =>
  commonWorkspaceActionTypes.includes(action.type);

export const allWorkspacesReducer = createReducer(defaultWorkspaceManager, builder => {
  builder.addCase(LOG_OUT, state => {
    // Preserve the playground workspace even after log out
    const playground = state.playground;
    return {
      ...defaultWorkspaceManager,
      playground
    };
  });

  builder.addMatcher(
    isCommonWorkspaceAction,
    (state, { payload: { payload, location }, ...action }) => {
      const newAction = {
        ...action,
        payload
      };

      if (!isNonStoryWorkspaceLocation(location)) {
        const [, storyEnv] = location.split('.');
        const storyReducer = basePlaygroundReducer(getDefaultStoriesEnv(storyEnv));
        storyReducer(state.stories[storyEnv], action)
      } else {
        const workspace = getWorkspace(state, location);
        const reducer = getWorkspaceReducer(location);
        reducer(workspace as any, newAction)
      }
    }
  );

  builder.addDefaultCase((state, action) => workspaceManagerReducer(state as WorkspaceManagerState, action));
});
