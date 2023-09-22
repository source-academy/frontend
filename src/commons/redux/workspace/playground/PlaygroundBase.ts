import { ActionReducerMapBuilder, createReducer, SliceCaseReducers, ValidateSliceCaseReducers  } from "@reduxjs/toolkit"
import { EditorTabState } from "src/commons/workspace/WorkspaceTypes"

import { createActions } from "../../utils"
import { createWorkspaceSlice, getDefaultWorkspaceState, WorkspaceState } from "../WorkspaceRedux"

type PlaygroundAttr = {
  readonly breakpointSteps: number[]
  readonly envSteps: number
  readonly envStepsTotal: number
  readonly stepLimit: number
  readonly updateEnv: boolean
  readonly usingEnv: boolean

  readonly usingSubst: boolean
  readonly sharedbConnected: boolean
}

export type PlaygroundWorkspaceState = PlaygroundAttr & WorkspaceState

export const getDefaultPlaygroundState = (initialTabs: EditorTabState[] = []): PlaygroundWorkspaceState => ({
  ...getDefaultWorkspaceState(initialTabs),
  breakpointSteps: [],
  envSteps: -1,
  envStepsTotal: 0,
  stepLimit: 1000,
  updateEnv: true,
  usingEnv: false,
  usingSubst: false,
  sharedbConnected: false
})

export type PlaygroundWorkspaces = 'playground' | 'sicp' | `stories.${string}`

export const playgroundBaseActions = createActions('playgroundBase', {
  changeStepLimit: (stepLimit: number) => stepLimit,
  toggleUpdateEnv: (toggleUpdateEnv: boolean) =>  toggleUpdateEnv,
  toggleUsingEnv: (toggleUsingEnv: boolean) =>  toggleUsingEnv,
  toggleUsingSubst: (toggleUsingSubst: boolean) =>  toggleUsingSubst,
  updateBreakpointSteps: (breakpointSteps: number[]) => breakpointSteps,
  updateEnvSteps: (envSteps: number) => envSteps,
  updateEnvStepsTotal: (envStepsTotal: number) =>  envStepsTotal,
  updateSharedbConnected: (newValue: boolean) => newValue,
})

const reducerBuilder = (builder: ActionReducerMapBuilder<PlaygroundWorkspaceState>) => {
  builder.addCase(playgroundBaseActions.changeStepLimit, (state, { payload }) => {
    state.stepLimit = payload
  })

  builder.addCase(playgroundBaseActions.toggleUpdateEnv, (state, { payload }) => {
    state.updateEnv = payload
  })
  
  builder.addCase(playgroundBaseActions.toggleUsingEnv, (state, { payload }) => {
    state.usingEnv = payload
  })
  
  builder.addCase(playgroundBaseActions.toggleUsingSubst, (state, { payload }) => {
    state.usingSubst = payload
  })
  
  builder.addCase(playgroundBaseActions.updateBreakpointSteps, (state, { payload }) => {
    state.breakpointSteps = payload
  })
  
  builder.addCase(playgroundBaseActions.updateEnvSteps, (state, { payload }) => {
    state.envSteps = payload
  })
  builder.addCase(playgroundBaseActions.updateEnvStepsTotal, (state, { payload }) => {
    state.envStepsTotal = payload
  })

  builder.addCase(playgroundBaseActions.updateSharedbConnected, (state, { payload }) => {
    state.sharedbConnected = payload
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
