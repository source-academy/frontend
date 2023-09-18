import { createAction, createReducer } from '@reduxjs/toolkit'

import { getDynamicTabs, getTabId } from '../sideContent/SideContentHelper'
import { SideContentTab, SideContentType } from '../sideContent/SideContentTypes'
import { DebuggerContext, WorkspaceLocation } from '../workspace/WorkspaceTypes'

export type SideContentLocation = Exclude<WorkspaceLocation, 'stories'> | `stories.${string}`

export type SideContentState = {
  dynamicTabs: SideContentTab[]
  alerts: string[]
  selectedTabId?: SideContentType
  height?: number
}

export const defaultSideContent: SideContentState = {
  dynamicTabs: [],
  alerts: []
}

export const sideContentActions = {
  beginAlertSideContent: createAction('sideContent/beginAlertSideContent', (newId: SideContentType) => ({ payload: newId })),
  changeSideContentHeight: createAction('sideContent/changeSideContentHeight', (payload: number) => ({ payload })),
  endAlertSideContentHeight: createAction('sideContent/endAlertSideContentHeight', (payload: SideContentType) => ({ payload })),
  notifyProgramEvaluated: createAction('sideContent/notifyProgramEvaluated', (payload: DebuggerContext) => ({ payload })),
  visitSideContent: createAction('sideContent/visitSideContent', (payload: SideContentType) => ({ payload })),
}

export const sideContentReducer = createReducer(defaultSideContent, builder => {
  builder.addCase(sideContentActions.changeSideContentHeight, (state, { payload }) => {
    state.height = payload
  })

  builder.addCase(sideContentActions.endAlertSideContentHeight, (state, { payload: newId }) => {
    if (newId === state.selectedTabId) return

    state.alerts.push(newId)
  })

  builder.addCase(sideContentActions.notifyProgramEvaluated, (state, { payload }) => {
    const dynamicTabs = getDynamicTabs(payload)
    state.alerts = dynamicTabs.map(getTabId).filter(id => id !== state.selectedTabId)
    state.dynamicTabs = dynamicTabs
  })

  builder.addCase(sideContentActions.visitSideContent ,(state, { payload: newId }) => {
    if (newId === state.selectedTabId) return

    state.alerts = state.alerts.filter(id => id !== newId)
    state.selectedTabId = newId
  })
})
