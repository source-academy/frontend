import { createReducer } from '@reduxjs/toolkit';
import type { Context } from 'js-slang';

import { getDynamicTabs, getTabId } from '../../../sideContent/SideContentHelper';
import { DebuggerContext, SideContentType } from '../../../sideContent/SideContentTypes';
import { createActions } from '../../utils';
import { defaultSideContent } from '../WorkspaceStateTypes';

export const sideContentActions = createActions('sideContent', {
  beginAlertSideContent: (newId: SideContentType) => newId,
  changeSideContentHeight: (height: number) => height,
  endAlertSideContent: (newId: SideContentType) => newId,
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

export const sideContentReducer = createReducer(defaultSideContent, builder => {
  builder.addCase(sideContentActions.changeSideContentHeight, (state, { payload }) => {
    state.height = payload;
  });

  builder.addCase(sideContentActions.endAlertSideContent, (state, { payload: newId }) => {
    if (newId === state.selectedTabId) return;

    state.alerts.push(newId);
  });

  builder.addCase(sideContentActions.notifyProgramEvaluated, (state, { payload }) => {
    const dynamicTabs = getDynamicTabs(payload);
    state.alerts = dynamicTabs.map(getTabId).filter(id => id !== state.selectedTabId);
    state.dynamicTabs = dynamicTabs;
  });

  builder.addCase(sideContentActions.visitSideContent, (state, { payload: newId }) => {
    if (newId === state.selectedTabId) return;

    state.alerts = state.alerts.filter(id => id !== newId);
    state.selectedTabId = newId;
  });
});
