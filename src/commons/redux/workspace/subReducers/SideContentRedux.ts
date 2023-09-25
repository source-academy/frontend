import { Action, createReducer } from '@reduxjs/toolkit';
import type { Context } from 'js-slang';

import { getTabId } from '../../../sideContent/SideContentHelper';
import { DebuggerContext, SideContentTab, SideContentType } from '../../../sideContent/SideContentTypes';
import { createActions } from '../../utils';
import { defaultSideContent } from '../WorkspaceStateTypes';

export const sideContentActions = createActions('sideContent', {
  beginAlertSideContent: (newId: SideContentType) => newId,
  beginSpawnSideContent: 0,
  changeSideContentHeight: (height: number) => height,
  endAlertSideContent: (newId: SideContentType) => newId,
  endSpawnSideContent: (dynamicTabs: SideContentTab[]) => dynamicTabs,
  notifyProgramEvaluated: (
    result: any,
    lastDebuggerResult: any,
    code: string,
    context: Context
  ): DebuggerContext => ({
    result,
    lastDebuggerResult,
    code,
    context
  }),
  visitSideContent: (id: SideContentType) => id
});

export const isSideContentAction = (action: Action): action is ReturnType<(typeof sideContentActions)[keyof typeof sideContentActions]> => action.type.startsWith('sideContent')

export const sideContentReducer = createReducer(defaultSideContent, builder => {
  builder.addCase(sideContentActions.changeSideContentHeight, (state, { payload }) => {
    state.height = payload;
  });

  builder.addCase(sideContentActions.endAlertSideContent, (state, { payload: newId }) => {
    if (newId === state.selectedTabId) return;

    state.alerts.push(newId);
  });

  builder.addCase(sideContentActions.endSpawnSideContent, (state, { payload: dynamicTabs }) => {
    state.alerts = dynamicTabs.map(getTabId).filter(id => id !== state.selectedTabId);
    state.dynamicTabs = dynamicTabs;
  });

  builder.addCase(sideContentActions.visitSideContent, (state, { payload: newId }) => {
    if (newId === state.selectedTabId) return;

    state.alerts = state.alerts.filter(id => id !== newId);
    state.selectedTabId = newId;
  });
});
