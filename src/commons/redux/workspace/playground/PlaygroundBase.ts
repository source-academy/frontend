import { ActionReducerMapBuilder, createAction, createReducer, SliceCaseReducers, ValidateSliceCaseReducers  } from "@reduxjs/toolkit"
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

const playgroundBaseActions = {
  changeStepLimit: createAction('playgroundBase/changeStepLimit', (payload: number) => ({ payload })),
  toggleUpdateEnv: createAction('playgroundBase/toggleUpdateEnv', (payload: boolean) => ({ payload })),
  toggleUsingEnv: createAction('playgroundBase/toggleUsingEnv', (payload: boolean) => ({ payload })),
  toggleUsingSubst: createAction('playgroundBase/toggleUsingSubst', (payload: boolean) => ({ payload })),
  updateBreakpointSteps: createAction('playgroundBase/updateBreakpointSteps', (payload: number[]) => ({ payload })),
  updateEnvSteps: createAction('playgroundBase/updateEnvSteps', (payload: number) => ({ payload })),
  updateEnvStepsTotal: createAction('playgroundBase/updateEnvStepsTotal', (payload: number) => ({ payload }))
} as const

// const basePlaygroundReducers = {
//   changeStepLimit(state: Draft<PlaygroundWorkspaceState>, { payload }: PayloadAction<number>) {
//     state.stepLimit = payload
//   },
//   toggleUpdateEnv(state: Draft<PlaygroundWorkspaceState>, { payload }: PayloadAction<boolean>) {
//     state.updateEnv = payload
//   },
//   toggleUsingEnv(state: Draft<PlaygroundWorkspaceState>, { payload }: PayloadAction<boolean>) {
//     state.usingEnv = payload
//   },
//   toggleUsingSubst(state: Draft<PlaygroundWorkspaceState>, { payload }: PayloadAction<boolean>) {
//     state.usingSubst = payload
//   },
//   updateBreakpointSteps(state: Draft<PlaygroundWorkspaceState>, { payload }: PayloadAction<number[]>) {
//     state.breakpointSteps = payload
//   },
//   updateEnvSteps(state: Draft<PlaygroundWorkspaceState>, { payload }: PayloadAction<number>) {
//     state.envSteps = payload
//   },
//   updateEnvStepsTotal(state: Draft<PlaygroundWorkspaceState>, { payload }: PayloadAction<number>) {
//     state.envStepsTotal = payload
//   }
// } as const

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

// export const createPlaygroundSlice = <
//   TState extends PlaygroundWorkspaceState,
//   TReducers extends SliceCaseReducers<TState>,
//   TName extends string = string
// >(
//   name: TName,
//   initialState: TState,
//   reducers: ValidateSliceCaseReducers<TState, TReducers>,  
//   extraReducers?: (builder: ActionReducerMapBuilder<TState>) => void,
// ) => createWorkspaceSlice<TState, TReducers, TName>(
//   name,
//   initialState,
//   reducers,
//   builder => {


//     if (extraReducers) extraReducers(builder)
//   }
// )
