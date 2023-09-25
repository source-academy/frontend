import { ActionCreatorWithPreparedPayload, DeepPartial } from '@reduxjs/toolkit';
import _ from 'lodash';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { SideContentType } from 'src/commons/sideContent/SideContentTypes';
import { useTypedSelector } from 'src/commons/utils/Hooks';

import { allWorkspaceActions } from './AllWorkspacesRedux';
import { editorActionNames } from './subReducers/EditorRedux';
import { replActionNames } from './subReducers/ReplRedux';
import { sideContentActions } from './subReducers/SideContentRedux';
import { workspaceActions } from './WorkspaceRedux';
import {
  NonStoryWorkspaceLocation,
  SideContentLocation,
  StoriesEnvState,
  StoryWorkspaceLocation,
  WorkspaceManagerState,
} from './WorkspaceReduxTypes';
import { WorkspaceState } from './WorkspaceStateTypes';

const getLocation = (location: SideContentLocation) => {
  if (location.startsWith('stories')) {
    return location.split('.');
  }
  return [location];
};

type UseWorkspaceReturn<State> = State & {
  [K in Exclude<
    keyof typeof workspaceActions,
    'resetWorkspace' | 'updateWorkspace'
  >]: (typeof workspaceActions)[K] extends ActionCreatorWithPreparedPayload<infer Args, any>
    ? (...args: Args) => void
    : () => void;
} & {
  updateWorkspace: (options: DeepPartial<State>) => void;
  resetWorkspace: (options?: DeepPartial<State>) => void;
};

export function useWorkspace<T extends NonStoryWorkspaceLocation>(
  location: T
): UseWorkspaceReturn<WorkspaceManagerState[T]>;
export function useWorkspace<T extends NonStoryWorkspaceLocation>(
  location: T,
  selector: (workspace: WorkspaceManagerState[T]) => any
): ReturnType<typeof selector>
export function useWorkspace(location: StoryWorkspaceLocation): UseWorkspaceReturn<StoriesEnvState>;
// export function useWorkspace(location: StoryWorkspaceLocation, selector: (state: StoriesEnvState) => any): ReturnType<typeof selector>
export function useWorkspace(location: SideContentLocation): UseWorkspaceReturn<WorkspaceState>;
export function useWorkspace(location: SideContentLocation, selector: (state: WorkspaceState) => any): ReturnType<typeof selector>
export function useWorkspace(location: SideContentLocation, selector?: (state: WorkspaceState) => any) {
  const workspace = useTypedSelector(state => {
    const [workspaceLocation, storyEnv] = getLocation(location);
    const workspace = workspaceLocation === 'stories' ? state.workspaces.stories.envs[storyEnv] : state.workspaces[workspaceLocation]
    return selector ? selector(workspace) : workspace
  });

  const dispatch = useDispatch();
  const { updateWorkspace, resetWorkspace, ...acts } = bindActionCreatorsToLocation(
    location,
    _.pick(
      allWorkspaceActions,
      Object.keys(workspaceActions) as Array<keyof typeof workspaceActions>
    ),
    dispatch
  );

  // useEffect(() => {
  //   console.log(acts)
  // }, [acts])

  return {
    ...workspace,
    ...acts,
    updateWorkspace: (options: Partial<WorkspaceState>) => updateWorkspace(options),
    resetWorkspace: (options: Partial<WorkspaceState> = {}) => resetWorkspace(options)
  };
}

const bindActionCreatorsToLocation = <
  TActions extends Record<
    string,
    ActionCreatorWithPreparedPayload<[SideContentLocation, ...any], any>
  >
>(
  location: SideContentLocation,
  actions: TActions,
  dispatch: ReturnType<typeof useDispatch>
) => {
  return Object.entries(actions).reduce(
    (res, [name, actionCreator]) => ({
      ...res,
      [name]: (...args: any) => {
        try {
          dispatch(actionCreator(location, ...args));
        } catch (error) {
          // console.log(`actionCreator for ${name} in ${location}:`, actionCreator)
          throw error
        }
      }
    }),
    {} as {
      [K in keyof TActions]: K extends string
        ? TActions[K] extends ActionCreatorWithPreparedPayload<
            [SideContentLocation, ...infer Args],
            any
          >
          ? (...args: Args) => void
          : never
        : never;
    }
  );
};

export function useEditorState(location: SideContentLocation) {
  const { editorState } = useWorkspace(location);
  const dispatch = useDispatch();
  const editorActions = bindActionCreatorsToLocation(
    location,
    _.pick(allWorkspaceActions, editorActionNames),
    dispatch
  );

  return {
    ...editorState,
    ...editorActions
  };
}
export const useRepl = (location: SideContentLocation) => {
  const { repl } = useWorkspace(location);
  const dispatch = useDispatch();

  const replActions = bindActionCreatorsToLocation(
    location,
    _.pick(allWorkspaceActions, replActionNames),
    dispatch
  );

  return {
    replValue: repl.replValue,
    ...replActions
  };
};

export const useSideContent = (location: SideContentLocation, defaultTab: SideContentType) => {
  const dispatch = useDispatch();
  const { sideContent } = useWorkspace(location);
  const currentTab = sideContent.selectedTabId;

  const setSelectedTab = useCallback(
    (newId: SideContentType) => {
      dispatch(sideContentActions.visitSideContent(newId));
    },
    [dispatch]
  );

  return {
    ...sideContent,
    selectedTab: currentTab ?? defaultTab,
    setSelectedTab
  };
};
