import { createAction,SliceCaseReducers, ValidateSliceCaseReducers } from "@reduxjs/toolkit";
import { Value } from "js-slang/dist/types";
import { AutogradingResult, Testcase } from "src/commons/assessment/AssessmentTypes";
import { EditorTabState } from "src/commons/workspace/WorkspaceTypes";

import { createWorkspaceSlice, getDefaultWorkspaceState,WorkspaceState } from "../WorkspaceRedux";

export type AssessmentState = WorkspaceState & {
  readonly autogradingResults: AutogradingResult[]
  readonly editorTestcases: Testcase[]
}

export const assessmentActions = {
  evalTestCaseFailure: createAction('testcases/evalTestCaseFailure', (value: Value, index: number) => ({ payload: { value, index } })),
  evalTestCaseSuccess: createAction('testcases/evalTestCaseSuccess', (value: Value, index: number) => ({ payload: { value, index } })),
  resetTestcase: createAction('testcases/resetTestcase', (index: number) => ({ payload: index }))
} as const

export const getDefaultAssessmentState = (initialTabs: EditorTabState[] = []): AssessmentState => ({
  ...getDefaultWorkspaceState(initialTabs),
  autogradingResults: [],
  editorTestcases: []
})

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
    builder.addCase(assessmentActions.evalTestCaseFailure, (state, { payload }) => {
      state.editorTestcases[payload.index].errors = payload.value
      state.editorTestcases[payload.index].result = undefined
    })

    builder.addCase(assessmentActions.evalTestCaseSuccess, (state, { payload }) => {
      state.editorTestcases[payload.index].result = payload.value
      state.editorTestcases[payload.index].errors = undefined
    })

    builder.addCase(assessmentActions.resetTestcase, (state, { payload }) => {
      state.editorTestcases[payload].result = undefined
      state.editorTestcases[payload].errors = undefined
    })
  }
)
