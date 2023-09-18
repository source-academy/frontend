import { PayloadAction } from '@reduxjs/toolkit'
import { SubmissionsTableFilters } from "src/commons/workspace/WorkspaceTypes";

import { createWorkspaceSlice, getDefaultWorkspaceState,WorkspaceState } from "./WorkspaceRedux";

export type GradingWorkspaceState = WorkspaceState & {
  readonly submissionsTableFilters: SubmissionsTableFilters;
  readonly currentSubmission?: number;
  readonly currentQuestion?: number;
  readonly hasUnsavedChanges: boolean;
}

export const defaultGradingState: GradingWorkspaceState = ({
  ...getDefaultWorkspaceState(),
  submissionsTableFilters: {
    columnFilters: [],
    globalFilter: null
  },
  currentSubmission: undefined,
  currentQuestion: undefined,
  hasUnsavedChanges: false
})

export const { actions: gradingActions, reducer: gradingReducer } = createWorkspaceSlice('grading', defaultGradingState, {
  updateCurrentSubmissionId: {
    prepare: (currentSubmission: number, currentQuestion: number) => ({ payload: { currentQuestion, currentSubmission }}),
    reducer(state, { payload }: PayloadAction<{ currentSubmission: number, currentQuestion: number }>) {
      state.currentQuestion = payload.currentQuestion
      state.currentSubmission = payload.currentSubmission
    }
  },
  updateSubmissionsTableFilters(state, { payload }: PayloadAction<SubmissionsTableFilters>) {
    state.submissionsTableFilters = payload
  }
})
