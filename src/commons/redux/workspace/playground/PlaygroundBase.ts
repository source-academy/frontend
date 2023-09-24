import { type ActionReducerMapBuilder, type SliceCaseReducers, type ValidateSliceCaseReducers,createReducer  } from "@reduxjs/toolkit"

import { addLocation, createActions } from "../../utils"
import { createWorkspaceSlice } from "../WorkspaceRedux"
import { PlaygroundWorkspaces,PlaygroundWorkspaceState } from "../WorkspaceReduxTypes"

const playgroundBaseActionsInternal = createActions('playgroundBase', {
  changeStepLimit: (stepLimit: number) => stepLimit,
  toggleUpdateEnv: (toggleUpdateEnv: boolean) =>  toggleUpdateEnv,
  toggleUsingEnv: (toggleUsingEnv: boolean) =>  toggleUsingEnv,
  toggleUsingSubst: (toggleUsingSubst: boolean) =>  toggleUsingSubst,
  updateBreakpointSteps: (breakpointSteps: number[]) => breakpointSteps,
  updateEnvSteps: (envSteps: number) => envSteps,
  updateEnvStepsTotal: (envStepsTotal: number) =>  envStepsTotal,
})

export const playgroundBaseActions = addLocation<typeof playgroundBaseActionsInternal, PlaygroundWorkspaces>(playgroundBaseActionsInternal)

const reducerBuilder = (builder: ActionReducerMapBuilder<PlaygroundWorkspaceState>) => {
  builder.addCase(playgroundBaseActionsInternal.changeStepLimit, (state, { payload }) => {
    state.stepLimit = payload
  })

  builder.addCase(playgroundBaseActionsInternal.toggleUpdateEnv, (state, { payload }) => {
    state.updateEnv = payload
  })
  
  builder.addCase(playgroundBaseActionsInternal.toggleUsingEnv, (state, { payload }) => {
    state.usingEnv = payload
  })
  
  builder.addCase(playgroundBaseActionsInternal.toggleUsingSubst, (state, { payload }) => {
    state.usingSubst = payload
  })
  
  builder.addCase(playgroundBaseActionsInternal.updateBreakpointSteps, (state, { payload }) => {
    state.breakpointSteps = payload
  })
  
  builder.addCase(playgroundBaseActionsInternal.updateEnvSteps, (state, { payload }) => {
    state.envSteps = payload
  })
  builder.addCase(playgroundBaseActionsInternal.updateEnvStepsTotal, (state, { payload }) => {
    state.envStepsTotal = payload
  })
}

export const basePlaygroundReducer = <T extends PlaygroundWorkspaceState>(
  initialState: T,
  extraReducers?: (builder: ActionReducerMapBuilder<T>) => void,
) => createReducer(initialState, builder => {
  reducerBuilder(builder)
  if (extraReducers) extraReducers(builder)
})

export const createPlaygroundSlice = <
  TState extends PlaygroundWorkspaceState,
  TReducers extends SliceCaseReducers<TState>,
  TName extends string = string
>(
  name: TName,
  initialState: TState,
  reducers: ValidateSliceCaseReducers<TState, TReducers>,
  extraReducers?: (builder: ActionReducerMapBuilder<TState>) => void
) => createWorkspaceSlice(
  name,
  initialState,
  reducers,
  builder => {
    reducerBuilder(builder)
    if (extraReducers) extraReducers(builder)
  }
)
