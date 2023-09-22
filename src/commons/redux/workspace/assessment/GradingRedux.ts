import { PayloadAction } from '@reduxjs/toolkit'
import { SubmissionsTableFilters } from "src/commons/workspace/WorkspaceTypes";

import { AssessmentState, createAssessmentSlice, getDefaultAssessmentState } from './AssessmentBase';

export type GradingWorkspaceState = AssessmentState & {
  readonly currentSubmission?: number;
  readonly currentQuestion?: number;
  readonly hasUnsavedChanges: boolean;
  readonly submissionsTableFilters: SubmissionsTableFilters;
}

export const defaultGradingState: GradingWorkspaceState = ({
  ...getDefaultAssessmentState(),
  autogradingResults: [],
  submissionsTableFilters: {
    columnFilters: [],
    globalFilter: null
  },
  currentSubmission: undefined,
  currentQuestion: undefined,
  editorTestcases: [],
  hasUnsavedChanges: false
})

export const { actions: gradingActions, reducer: gradingReducer } = createAssessmentSlice('grading', defaultGradingState, {
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
