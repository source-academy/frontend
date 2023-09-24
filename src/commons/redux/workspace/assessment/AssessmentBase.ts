import { type SliceCaseReducers, type ValidateSliceCaseReducers } from "@reduxjs/toolkit";
import type { Value } from "js-slang/dist/types";

import { addLocation, createActions } from "../../utils";
import { createWorkspaceSlice } from "../WorkspaceRedux";
import type { AssessmentLocations, AssessmentState } from "../WorkspaceReduxTypes";

const assessmentActionsInternal = createActions('assessmentBase', {
  evalEditorAndTestcases: 0,
  evalTestCase: (index: number) => index,
  evalTestCaseFailure: (value: Value, index: number) => ({ value, index }),
  evalTestCaseSuccess: (value: Value, index: number) => ({ value, index }),
  resetTestcase: (index: number) => index,
  updateCurrentAssessmentId: (assessmentId: number, questionId: number) => ({ assessmentId, questionId })
})

export const assessmentActions = addLocation<typeof assessmentActionsInternal, AssessmentLocations>(assessmentActionsInternal)

export const createAssessmentSlice = <
  TState extends AssessmentState,
  TReducers extends SliceCaseReducers<TState>,
  TName extends string = string
>(
  name: TName,
  initialState: TState,
  reducers: ValidateSliceCaseReducers<TState, TReducers>
) => createWorkspaceSlice<TState, TReducers, TName>(
  name, initialState, reducers, builder => {
    builder.addCase(assessmentActionsInternal.evalTestCaseFailure, (state, { payload }) => {
      state.editorTestcases[payload.index].errors = payload.value
      state.editorTestcases[payload.index].result = undefined
    })

    builder.addCase(assessmentActionsInternal.evalTestCaseSuccess, (state, { payload }) => {
      state.editorTestcases[payload.index].result = payload.value
      state.editorTestcases[payload.index].errors = undefined
    })

    builder.addCase(assessmentActionsInternal.resetTestcase, (state, { payload }) => {
      state.editorTestcases[payload].result = undefined
      state.editorTestcases[payload].errors = undefined
    })

    builder.addCase(assessmentActionsInternal.updateCurrentAssessmentId, (state, { payload }) => {
      state.currentAssessment = payload.assessmentId
      state.currentQuestion = payload.questionId
    })
  }
)
