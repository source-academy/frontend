import { Reducer } from '@reduxjs/toolkit';

import { defaultSideContent, defaultSideContentManager } from '../application/ApplicationTypes';
import { SourceActionType } from '../utils/ActionsHelper';
import {
  changeSideContentHeight,
  endAlertSideContent,
  removeSideContentAlert,
  resetSideContent,
  spawnSideContent,
  visitSideContent
} from './SideContentActions';
import { getDynamicTabs, getLocation, getTabId } from './SideContentHelper';
import { SideContentManagerState } from './SideContentTypes';

export const SideContentReducer: Reducer<SideContentManagerState, SourceActionType> = (
  state: SideContentManagerState = defaultSideContentManager,
  action: SourceActionType
): SideContentManagerState => {
  if (!(action as any).payload?.workspaceLocation) {
    return state;
  }
  const [workspaceLocation, storyEnv] = getLocation((action as any).payload.workspaceLocation);

  const sideContentState =
    workspaceLocation === 'stories' ? state.stories[storyEnv] : state[workspaceLocation];

  switch (action.type) {
    case changeSideContentHeight.type:
      return workspaceLocation === 'stories'
        ? {
            ...state,
            stories: {
              ...state.stories,
              [storyEnv]: {
                ...state.stories[storyEnv],
                height: action.payload.height
              }
            }
          }
        : {
            ...state,
            [workspaceLocation]: {
              ...state[workspaceLocation],
              height: action.payload.height
            }
          };
    case endAlertSideContent.type: {
      if (action.payload.id !== sideContentState.selectedTab) {
        return workspaceLocation === 'stories'
          ? {
              ...state,
              stories: {
                ...state.stories,
                [storyEnv]: {
                  ...state.stories[storyEnv],
                  alerts: [...state.stories[storyEnv].alerts, action.payload.id]
                }
              }
            }
          : {
              ...state,
              [workspaceLocation]: {
                ...state[workspaceLocation],
                alerts: [...state[workspaceLocation].alerts, action.payload.id]
              }
            };
      }
      return state;
    }
    case removeSideContentAlert.type:
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
    case resetSideContent.type:
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
    case spawnSideContent.type: {
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
    case visitSideContent.type:
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
};
