import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { SideContentType } from "src/commons/sideContent/SideContentTypes";
import { useTypedSelector } from "src/commons/utils/Hooks";

import { WorkspaceManagerState } from "./AllWorkspacesRedux";
import { StoriesEnvState } from "./StoriesRedux";
import { EditorState } from "./subReducers/EditorRedux";
import { NonStoryWorkspaceLocation, sideContentActions,SideContentLocation, SideContentState, StoryWorkspaceLocation } from "./subReducers/SideContentRedux";

const getLocation = (location: SideContentLocation) => {
  if (location.startsWith('stories')) {
    return location.split('.')
  }
  return [location]
}

export function useWorkspace<T extends NonStoryWorkspaceLocation>(location: T): WorkspaceManagerState[T]
export function useWorkspace(location: StoryWorkspaceLocation): StoriesEnvState
export function useWorkspace(location: SideContentLocation) { 
  return useTypedSelector(state => {
    const [workspaceLocation, storyEnv] = getLocation(location)
    if (workspaceLocation === 'stories') {
      return state.workspaces.stories.envs[storyEnv]
    }
    
    return state.workspaces[workspaceLocation]
  })
}

export function useEditorState<T extends NonStoryWorkspaceLocation>(location: T): EditorState
export function useEditorState(location: StoryWorkspaceLocation): EditorState
export function useEditorState(location: SideContentLocation) {
  return useWorkspace(location as any).editorState;
}
export const useRepl = (location: SideContentLocation) => useWorkspace(location as any).repl

export const useSideContent = (location: SideContentLocation, defaultTab: SideContentType) => {
  const dispatch = useDispatch()
  const sideContent: SideContentState = useWorkspace(location as any).sideContent
  const currentTab = sideContent.selectedTabId
  
  const setSelectedTab = useCallback((newId: SideContentType) => {
    dispatch(sideContentActions.visitSideContent(newId))
  }, [dispatch])

  return {
    ...sideContent,
    selectedTab: currentTab ?? defaultTab,
    setSelectedTab,
  }
}
