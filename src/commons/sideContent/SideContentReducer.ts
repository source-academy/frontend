import { defaultSideContent, defaultSideContentManager } from '../application/ApplicationTypes';
import { SourceActionType } from '../utils/ActionsHelper';
import { getDynamicTabs, getTabId } from './SideContentHelper';
import {
  END_ALERT_SIDE_CONTENT,
  getLocation,
  RESET_SIDE_CONTENT,
  SideContentManagerState,
  SPAWN_SIDE_CONTENT,
  VISIT_SIDE_CONTENT
} from './SideContentTypes';

export function SideContentReducer(
  state: SideContentManagerState = defaultSideContentManager,
  action: SourceActionType
): SideContentManagerState {
  if (!(action as any).payload?.workspaceLocation) {
    return state;
  }
  const [workspaceLocation, storyEnv] = getLocation((action as any).payload.workspaceLocation);

  const sideContentState =
    workspaceLocation === 'stories' ? state.stories[storyEnv] : state[workspaceLocation];

  switch (action.type) {
    case END_ALERT_SIDE_CONTENT: {
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
                selectedTab: action.payload.newId,
              }
            }
          }
        : {
            ...state,
            [workspaceLocation]: {
              ...state[workspaceLocation],
              alerts: state[workspaceLocation].alerts.filter(id => id !== action.payload.newId),
              selectedTab: action.payload.newId,
            }
          };
    default:
      return state;
  }
}
