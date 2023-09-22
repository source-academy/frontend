import { PayloadAction } from "@reduxjs/toolkit";

import { AssessmentState, createAssessmentSlice, getDefaultAssessmentState } from "./AssessmentBase";

export type AssessmentWorkspaceState = AssessmentState & {
  readonly currentAssessment?: number;
  readonly currentQuestion?: number;
}

export const defaultAssessment: AssessmentWorkspaceState = {
  // TODO add default tab
  ...getDefaultAssessmentState(),
  currentAssessment: undefined,
  currentQuestion: undefined,
}

export const { actions: assessmentActions, reducer: assessmentReducer } = createAssessmentSlice('assessment', defaultAssessment, {
  updateCurrentAssessmentId: {
    prepare: (assessmentId: number, questionId: number) => ({ payload: { assessmentId, questionId }}),
    reducer(state, { payload }: PayloadAction<Record<'assessmentId' | 'questionId', number>>) {
      state.currentAssessment = payload.assessmentId
      state.currentQuestion = payload.questionId
    }
  }
})
