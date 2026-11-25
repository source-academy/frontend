import type { Reducer } from '@reduxjs/toolkit';

import { defaultSideContent, defaultSideContentManager } from '../application/ApplicationTypes';
import type { SourceActionType } from '../utils/ActionsHelper';
import {
  alertSideContent,
  changeSideContentHeight,
  removeSideContentAlert,
  resetSideContent,
  visitSideContent,
} from './SideContentActions';
import { getLocation } from './SideContentHelper';
import type { SideContentManagerState, SideContentState } from './SideContentTypes';

export const SideContentReducer: Reducer<SideContentManagerState, SourceActionType> = (
  state: SideContentManagerState = defaultSideContentManager,
  action: SourceActionType,
): SideContentManagerState => {
  if (!(action as any).payload?.workspaceLocation) {
    return state;
  }
  const [workspaceLocation] = getLocation((action as any).payload.workspaceLocation);

  const key = workspaceLocation as keyof SideContentManagerState;
  const sideContentState: SideContentState = state[key];

  switch (action.type) {
    case changeSideContentHeight.type:
      return {
        ...state,
        [key]: {
          ...sideContentState,
          height: action.payload.height,
        },
      };
    case alertSideContent.type: {
      if (
        action.payload.id !== sideContentState.selectedTab &&
        !sideContentState.alerts.includes(action.payload.id)
      ) {
        return {
          ...state,
          [key]: {
            ...sideContentState,
            alerts: [...sideContentState.alerts, action.payload.id],
          },
        };
      }
      return state;
    }
    case removeSideContentAlert.type:
      return {
        ...state,
        [key]: {
          ...sideContentState,
          alerts: sideContentState.alerts.filter((id: string) => id !== action.payload.id),
        },
      };
    case resetSideContent.type:
      return {
        ...state,
        [key]: defaultSideContent,
      };
    case visitSideContent.type:
      return {
        ...state,
        [key]: {
          ...sideContentState,
          alerts: sideContentState.alerts.filter((id: string) => id !== action.payload.newId),
          selectedTab: action.payload.newId,
        },
      };
    default:
      return state;
  }
};
