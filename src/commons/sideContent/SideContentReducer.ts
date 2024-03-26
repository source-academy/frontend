import { createReducer } from '@reduxjs/toolkit';
import { Reducer } from 'redux';

import { defaultSideContent, defaultSideContentManager } from '../application/ApplicationTypes';
import { SourceActionType } from '../utils/ActionsHelper';
import { changeSideContentHeight, endAlertSideContent } from './SideContentActions';
import { getDynamicTabs, getLocation, getTabId } from './SideContentHelper';
import {
  REMOVE_SIDE_CONTENT_ALERT,
  RESET_SIDE_CONTENT,
  SPAWN_SIDE_CONTENT,
  SideContentManagerState,
  VISIT_SIDE_CONTENT
} from './SideContentTypes';

export const SideContentReducer: Reducer<SideContentManagerState> = (
  state = defaultSideContentManager,
  action: SourceActionType
) => {
  if (!(action as any).payload?.workspaceLocation) {
    return state;
  }
  state = storySideContentReducer(state, action);
  state = nonStorySideContentReducer(state, action);
  state = oldSideContentReducer(state, action);
  return state;
};

const storySideContentReducer: Reducer<SideContentManagerState> = (
  state = defaultSideContentManager,
  action
) => {
  const [workspaceLocation, storyEnv] = getLocation((action as any).payload.workspaceLocation);
  if (workspaceLocation !== 'stories') {
    return state;
  }

  const sideContentState = state.stories[storyEnv];
  return createReducer(defaultSideContentManager, builder => {
    builder
      .addCase(changeSideContentHeight, (state, action) => {
        state.stories[storyEnv].height = action.payload.height;
      })
      .addCase(endAlertSideContent, (state, action) => {
        if (action.payload.id !== sideContentState.selectedTab) {
          state.stories[storyEnv].alerts.push(action.payload.id);
        }
      });
  })(state, action);
};

const nonStorySideContentReducer: Reducer<SideContentManagerState> = (
  state = defaultSideContentManager,
  action
) => {
  const [workspaceLocation] = getLocation((action as any).payload.workspaceLocation);
  if (workspaceLocation === 'stories') {
    return state;
  }

  const sideContentState = state[workspaceLocation];
  return createReducer(defaultSideContentManager, builder => {
    builder
      .addCase(changeSideContentHeight, (state, action) => {
        state[workspaceLocation].height = action.payload.height;
      })
      .addCase(endAlertSideContent, (state, action) => {
        if (action.payload.id !== sideContentState.selectedTab) {
          state[workspaceLocation].alerts.push(action.payload.id);
        }
      });
  })(state, action);
};

function oldSideContentReducer(
  state: SideContentManagerState = defaultSideContentManager,
  action: SourceActionType
): SideContentManagerState {
  const [workspaceLocation, storyEnv] = getLocation((action as any).payload.workspaceLocation);

  const sideContentState =
    workspaceLocation === 'stories' ? state.stories[storyEnv] : state[workspaceLocation];

  switch (action.type) {
    case REMOVE_SIDE_CONTENT_ALERT:
      return workspaceLocation === 'stories'
        ? {
            ...state,
            stories: {
              ...state.stories,
              [storyEnv]: {
                ...state.stories[storyEnv],
                alerts: state.stories[storyEnv].alerts.filter(id => id !== action.payload.id)
              }
            }
          }
        : {
            ...state,
            [workspaceLocation]: {
              ...state[workspaceLocation],
              alerts: state[workspaceLocation].alerts.filter(id => id !== action.payload.id)
            }
          };
    case RESET_SIDE_CONTENT:
      return workspaceLocation === 'stories'
        ? {
            ...state,
            stories: {
              ...state.stories,
              [storyEnv]: defaultSideContent
            }
          }
        : {
            ...state,
            [workspaceLocation]: defaultSideContent
          };
    case SPAWN_SIDE_CONTENT: {
      const dynamicTabs = getDynamicTabs(action.payload.debuggerContext);
      const alerts = dynamicTabs.map(getTabId).filter(id => id !== sideContentState.selectedTab);
      return workspaceLocation === 'stories'
        ? {
            ...state,
            stories: {
              ...state.stories,
              [storyEnv]: {
                ...state.stories[storyEnv],
                alerts,
                dynamicTabs
              }
            }
          }
        : {
            ...state,
            [workspaceLocation]: {
              ...state[workspaceLocation],
              alerts,
              dynamicTabs
            }
          };
    }
    case VISIT_SIDE_CONTENT:
      return workspaceLocation === 'stories'
        ? {
            ...state,
            stories: {
              ...state.stories,
              [storyEnv]: {
                ...state.stories[storyEnv],
                alerts: state.stories[storyEnv].alerts.filter(id => id !== action.payload.newId),
                selectedTab: action.payload.newId
              }
            }
          }
        : {
            ...state,
            [workspaceLocation]: {
              ...state[workspaceLocation],
              alerts: state[workspaceLocation].alerts.filter(id => id !== action.payload.newId),
              selectedTab: action.payload.newId
            }
          };
    default:
      return state;
  }
}
