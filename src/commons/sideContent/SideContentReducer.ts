import { defaultSideContent, defaultSideContentManager } from '../application/ApplicationTypes';
import { SourceActionType } from '../utils/ActionsHelper';
import { CHANGE_SIDE_CONTENT_HEIGHT } from '../workspace/WorkspaceTypes';
import { getDynamicTabs, getTabId } from './SideContentHelper';
import { getLocation } from './SideContentHelper';
import {
  END_ALERT_SIDE_CONTENT,
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
    case CHANGE_SIDE_CONTENT_HEIGHT:
      return workspaceLocation === 'stories' ? {
        ...state,
        stories: {
          ...state.stories,
          [storyEnv]: {
            ...state.stories[storyEnv],
            height: action.payload.height
          }
        }
      } : {
        ...state,
        [workspaceLocation]: {
          ...state[workspaceLocation],
          height: action.payload.height
        }
      }
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
