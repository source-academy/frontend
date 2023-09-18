import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit'

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

const { actions, reducer } = createSlice({
  name: 'sideContent',
  initialState: defaultSideContent,
  reducers: {
    changeSideContentHeight(state, { payload }: PayloadAction<number>) {
      state.height = payload
    },
    endAlertSideContentHeight(state, { payload: newId }: PayloadAction<SideContentType>) {
      if (newId === state.selectedTabId) return

      state.alerts.push(newId)
    },
    notifyProgramEvaluated(state, { payload }: PayloadAction<DebuggerContext>) {
      const dynamicTabs = getDynamicTabs(payload)
      state.alerts = dynamicTabs.map(getTabId).filter(id => id !== state.selectedTabId)
      state.dynamicTabs = dynamicTabs
    },
    visitSideContent(state, { payload: newId }: PayloadAction<SideContentType>) {
      if (newId === state.selectedTabId) return

      state.alerts = state.alerts.filter(id => id !== newId)
      state.selectedTabId = newId
    }
  }
})

export const sideContentActions = {
  ...actions,
  beginAlertSideContent: createAction('sideContent/beginAlertSideContent', (newId: SideContentType) => ({ payload: newId }))
}

export { reducer as sideContentReducer }
