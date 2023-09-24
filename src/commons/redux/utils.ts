import { Action, ActionCreator, ActionCreatorWithOptionalPayload, ActionCreatorWithoutPayload, ActionCreatorWithPreparedPayload, CaseReducer, createAction, createReducer, PayloadAction } from "@reduxjs/toolkit";
import { TypedActionCreator } from "@reduxjs/toolkit/dist/mapBuilders";
import * as Sentry from '@sentry/browser';
import { SagaIterator } from "redux-saga";
import { ForkEffect, StrictEffect, takeEvery } from "redux-saga/effects";

import { SideContentLocation } from "./workspace/WorkspaceReduxTypes";

export function createActions<
  BaseName extends string,
  BaseActions extends Record<string, any>
>(baseName: BaseName, baseActions: BaseActions) {
  return Object.entries(baseActions).reduce((res, [name, func]) => ({
    ...res,
    [name]: func 
      ? createAction(`${baseName}/${name}`, (...args: any) => ({ payload: func(...args) })) 
      : createAction(`${baseName}/${name}`)
  }), {} as {
    [K in keyof BaseActions]: K extends string
      ? (BaseActions[K] extends (...args: any) => any
        ? ActionCreatorWithPreparedPayload<
          Parameters<BaseActions[K]>,
          ReturnType<BaseActions[K]>,
          K
        >
        : ActionCreatorWithoutPayload<`${BaseName}/${K}`>)
      : never
  })
}

type SagaHandler<T extends Action> = (action: T) => Generator<StrictEffect<any>>
type SagaHandlerWithPrepare<T extends PayloadAction<any>> = {
  saga: (action: T) => Generator<StrictEffect<any>>
  prepare: (...args: any) => T['payload']
}

export function createSaga<
  TName extends string,
  TActions extends Record<string, SagaHandler<any> | SagaHandlerWithPrepare<any>>
>(baseName: TName, actions: TActions) {
  const [allActions, allSagas] = Object.entries(actions).reduce(([actions, sagas], [actionName, saga]) => {
    if (typeof saga === 'function') {
      const action = createAction(`${baseName}/${actionName}`)
      return [{
        ...actions,
        [actionName]: action,
      }, [
        ...sagas,
        saferTakeEvery(action, saga)
      ]]
    } else {
      const action = createAction(`${baseName}/${actionName}`, saga.prepare)
      return [{
        ...actions,
        [actionName]: action,
      }, [
        ...sagas,
        saferTakeEvery(action, saga.saga)
      ]]
    }
  }, [{} as any, []] as [
    {
      [K in keyof TActions]: K extends string ? (TActions[K] extends SagaHandlerWithPrepare<any>
        ? ActionCreatorWithPreparedPayload<
          Parameters<TActions[K]['prepare']>,
          ReturnType<TActions[K]['prepare']>,
          `${TName}/${K}`
        >
        : ActionCreatorWithoutPayload<`${TName}/${K}`>)
        : never
    },
    ForkEffect<any>[]
  ])

  return {
    actions: allActions,
    saga: function* (): SagaIterator {
      yield* allSagas
    }
  }
}

export function combineSagaHandlers<
  TActions extends Record<string, ActionCreatorWithPreparedPayload<any, any> | ActionCreatorWithoutPayload<any>>
>(actions: TActions, handlers: Partial<{
  [K in keyof TActions]: (action: ReturnType<TActions[K]>) => Generator<StrictEffect<any, any> | Promise<any>, any, any>
}>, others?: (takeEvery: typeof saferTakeEvery) => SagaIterator): () => SagaIterator {
  const sagaHandlers = Object.values(handlers).map(([actionName, saga]) => saferTakeEvery(actions[actionName].type, saga))
  return function*(): SagaIterator {
    yield* sagaHandlers
    if (others) {
      const obj = others(saferTakeEvery)
      while (true) {
        const { done, value } = obj.next()
        if (done) break
        yield value
      }
    }
  }
}

function handleUncaughtError(error: any) {
  if (process.env.NODE_ENV === 'development') {
    // react-error-overlay is a "special" package that's automatically included
    // in development mode by CRA

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    import('react-error-overlay').then(reo => reo.reportRuntimeError(error));
  }
  Sentry.captureException(error);
  console.error(error);
}

export function saferTakeEvery<
  Action extends ActionCreatorWithOptionalPayload<any> | ActionCreatorWithPreparedPayload<any[], any>,
>(
  actionPattern: Action,
  fn: (action: ReturnType<Action>) => Generator<StrictEffect<any> | Promise<any>, any, any>
) {
  function* wrapper(action: ReturnType<Action>) {
    try {
      yield* fn(action)
    } catch (error) {
      handleUncaughtError(error);
    }
  }

  return takeEvery(actionPattern.type, wrapper)
}

// export function buildReducer2<
//   TState extends (...args: any) => any,
//   TReducers extends SliceCaseReducers<ReturnType<TState>>,
//   TName extends string
// >(
//   baseName: TName,
//   initialState: TState,
//   reducers: ValidateSliceCaseReducers<ReturnType<TState>, TReducers>
// ) {
//   const actions = Object.entries(reducers).reduce((res, [name, actionCreator]) => ({
//     ...res,
//     [name]: typeof actionCreator === 'function' ? createAction(`${baseName}/${name}`) : createAction(`${baseName}/${name}`, actionCreator.prepare)
//   }), {} as {
//     [K in keyof TReducers]: K extends string ? (TReducers[K] extends CaseReducerWithPrepare<ReturnType<TState>, any> ?
//       ActionCreatorWithPreparedPayload<
//         Parameters<TReducers[K]['prepare']>,
//         ReturnType<TReducers[K]['prepare']>,
//         `${TName}/${K}`
//       >
//     : ActionCreatorWithoutPayload<`${TName}/${K}`>) : never
//   })

//   return {
//     actions,
//     getReducer: (...args: Parameters<TState>[]) => createReducer(
//       initialState(...args),
//       builder => Object.values(actions).forEach(actionCreator => {
//         const reducer = reducers[actionCreator.type] as TReducers[string]
//         return builder.addCase(actionCreator, typeof reducer === 'function' ? reducer : reducer.reducer);
//       })
//     )
//   }
// }

export function buildReducer<
  TState,
  TActions extends Record<string, TypedActionCreator<any>>
>(
  initialState: TState,
  actions: TActions,
  reducers: {
    [K in keyof TActions]: CaseReducer<TState, ReturnType<TActions[K]>>
  }
) {
  return createReducer(
    initialState,
    builder => {
      Object.entries(reducers).forEach(([name, reducer]) => builder.addCase(actions[name], reducer))
    }
  )
}

export function addLocation<
  TActions extends Record<string, ActionCreator<Action>>,
  TLoc extends SideContentLocation
>(
  actions: TActions
) {
  return Object.entries(actions).reduce((res, [name, creator]) => ({
    ...res,
    [name]: (location: TLoc, ...args: any) => {
      const action = creator(...args)
      return {
        ...action,
        payload: {
          payload: (action as PayloadAction<any>).payload,
          location
        }
      }
    }
  }), {} as {
    [K in keyof TActions]: TActions[K] extends ActionCreatorWithPreparedPayload<infer Args, infer Payload>
      ? ActionCreatorWithPreparedPayload<[TLoc, ...Args], { payload: Payload, location: TLoc }>
      : ActionCreatorWithPreparedPayload<[TLoc], { location: TLoc }>
  })
}
