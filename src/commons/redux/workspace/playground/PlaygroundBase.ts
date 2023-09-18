import { createReducer, Draft, PayloadAction, SliceCaseReducers } from "@reduxjs/toolkit"
import { EditorTabState } from "src/commons/workspace/WorkspaceTypes"

import { createWorkspaceSlice, getDefaultWorkspaceState,WorkspaceState } from "../WorkspaceRedux"

type PlaygroundAttr = {
  readonly breakpointSteps: number[]
  readonly envSteps: number
  readonly envStepsTotal: number
  readonly stepLimit: number
  readonly updateEnv: boolean
  readonly usingEnv: boolean

  readonly usingSubst: boolean
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
})

const basePlaygroundReducers = {
  changeStepLimit(state: Draft<PlaygroundWorkspaceState>, { payload }: PayloadAction<number>) {
    state.stepLimit = payload
  },
  toggleUpdateEnv(state: Draft<PlaygroundWorkspaceState>, { payload }: PayloadAction<boolean>) {
    state.updateEnv = payload
  },
  toggleUsingEnv(state: Draft<PlaygroundWorkspaceState>, { payload }: PayloadAction<boolean>) {
    state.usingEnv = payload
  },
  toggleUsingSubst(state: Draft<PlaygroundWorkspaceState>, { payload }: PayloadAction<boolean>) {
    state.usingSubst = payload
  },
  updateBreakpointSteps(state: Draft<PlaygroundWorkspaceState>, { payload }: PayloadAction<number[]>) {
    state.breakpointSteps = payload
  },
  updateEnvSteps(state: Draft<PlaygroundWorkspaceState>, { payload }: PayloadAction<number>) {
    state.envSteps = payload
  },
  updateEnvStepsTotal(state: Draft<PlaygroundWorkspaceState>, { payload }: PayloadAction<number>) {
    state.envStepsTotal = payload
  }
} as const

export const basePlaygroundReducer = <T extends PlaygroundWorkspaceState>(initialState: T) => createReducer(initialState, basePlaygroundReducers)

type PlaygroundBaseReducers = typeof basePlaygroundReducers

export const createPlaygroundSlice = <
  TState extends PlaygroundWorkspaceState,
  TReducers extends SliceCaseReducers<TState>,
  TName extends string = string
>(
  name: TName,
  initialState: TState,
  reducers: TReducers,  
) => createWorkspaceSlice<TState, TReducers & PlaygroundBaseReducers, TName>(
  name,
  initialState,
  {
    ...basePlaygroundReducers,
    ...reducers,
  }
)
