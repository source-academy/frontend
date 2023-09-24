import { select,SelectEffect } from "redux-saga/effects";

import { OverallState } from "../AllTypes";
import { getWorkspace } from "../workspace/AllWorkspacesRedux";
import { NonStoryWorkspaceLocation, SideContentLocation, StoriesEnvState, StoryWorkspaceLocation, WorkspaceManagerState, WorkspaceState } from "../workspace/WorkspaceReduxTypes";
import { SessionState } from "../session/SessionsReducer";

export function selectWorkspace<T extends NonStoryWorkspaceLocation>(location: T, selector?: (workspace: WorkspaceManagerState[T]) => any): SelectEffect
export function selectWorkspace(location: StoryWorkspaceLocation, selector?: (workspace: StoriesEnvState) => any): SelectEffect
export function selectWorkspace(location: SideContentLocation, selector?: (workspace: WorkspaceState) => any): SelectEffect
export function selectWorkspace(location: SideContentLocation, selector?: (workspace: WorkspaceState) => any) {
  return select((state: OverallState) => {
    const workspace = getWorkspace(state.workspaces, location);
    if (selector) return selector(workspace)
    return workspace
  });
}

export function selectTokens() {
  return select((state: OverallState) => ({
    accessToken: state.session.accessToken,
    refreshToken: state.session.refreshToken
  }));
}

export const selectFileSystem = () => select((state: OverallState) => state.fileSystem.inBrowserFileSystem)
export const selectSession = (selector?: (state: SessionState) => any) => select((state: OverallState) => selector ? selector(state.session) : state.session)
