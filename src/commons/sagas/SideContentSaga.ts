import type { Action, AnyAction } from '@reduxjs/toolkit';
import { put, race, select, take } from 'redux-saga/effects';
import StoriesActions from 'src/features/stories/StoriesActions';

import { combineSagaHandlers } from '../redux/utils';
import SideContentActions from '../sideContent/SideContentActions';
import { getLocation } from '../sideContent/SideContentHelper';
import {
  type SideContentLocation,
  type SideContentManagerState,
  SideContentType
} from '../sideContent/SideContentTypes';
import WorkspaceActions from '../workspace/WorkspaceActions';

const isSpawnSideContent = (
  action: Action
): action is ReturnType<typeof SideContentActions.spawnSideContent> =>
  action.type === SideContentActions.spawnSideContent.type;
// hotfix check here to allow for blinking during session update

const isVisitSideContent = (
  action: AnyAction
): action is ReturnType<typeof SideContentActions.visitSideContent> =>
  action.type === SideContentActions.visitSideContent.type;

const selectSelectedTab = (
  state: any,
  workspaceLocation: SideContentLocation
): SideContentType | undefined => {
  const sideContentState = (state.sideContent ?? state) as SideContentManagerState;
  const [location, storyEnv] = getLocation(workspaceLocation);

  return location === 'stories'
    ? sideContentState.stories[storyEnv]?.selectedTab
    : sideContentState[location]?.selectedTab;
};

const SideContentSaga = combineSagaHandlers({
  [SideContentActions.beginAlertSideContent.type]: function* ({
    payload: { id, workspaceLocation }
  }) {
    // When a program finishes evaluation, we clear all alerts,
    // So we must wait until after and all module tabs have been spawned
    // to process any kind of alerts that were raised by non-module side content
    const selectedTab: SideContentType | undefined = yield select((state: any) =>
      selectSelectedTab(state, workspaceLocation)
    );

    // no alert if the tab is already open
    if (selectedTab === id) {
      return;
    }

    if (
      id === SideContentType.sessionManagement ||
      id === SideContentType.substVisualizer ||
      id === SideContentType.cseMachine
    ) {
      yield put(SideContentActions.endAlertSideContent(id, workspaceLocation));
      return;
    }
    const { spawned } = yield race({
      spawned: take(
        (action: AnyAction) =>
          isSpawnSideContent(action) && action.payload.workspaceLocation === workspaceLocation
      ),
      visited: take(
        (action: AnyAction) =>
          isVisitSideContent(action) &&
          action.payload.workspaceLocation === workspaceLocation &&
          action.payload.newId === id
      )
    });

    if (!spawned) {
      return;
    }

    const selectedTabAfterWait: SideContentType | undefined = yield select((state: any) =>
      selectSelectedTab(state, workspaceLocation)
    );

    if (selectedTabAfterWait === id) {
      return;
    }

    yield put(SideContentActions.endAlertSideContent(id, workspaceLocation));
  },
  [WorkspaceActions.notifyProgramEvaluated.type]: function* (action) {
    if (!action.payload.workspaceLocation || action.payload.workspaceLocation === 'stories') return;

    const debuggerContext = {
      result: action.payload.result,
      lastDebuggerResult: action.payload.lastDebuggerResult,
      code: action.payload.code,
      context: action.payload.context,
      workspaceLocation: action.payload.workspaceLocation
    };
    yield put(
      SideContentActions.spawnSideContent(action.payload.workspaceLocation, debuggerContext)
    );
  },
  [StoriesActions.notifyStoriesEvaluated.type]: function* (action) {
    yield put(SideContentActions.spawnSideContent(`stories.${action.payload.env}`, action.payload));
  }
});

export default SideContentSaga;
