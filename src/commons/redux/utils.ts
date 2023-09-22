import { ActionCreatorWithOptionalPayload, ActionCreatorWithoutPayload, ActionCreatorWithPreparedPayload, createAction } from "@reduxjs/toolkit";
import * as Sentry from '@sentry/browser';
import { SagaIterator } from "redux-saga";
import { StrictEffect, takeEvery } from "redux-saga/effects";

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

export function combineSagaHandlers<
  TActions extends Record<string, ActionCreatorWithPreparedPayload<any, any> | ActionCreatorWithoutPayload<any>>
>(actions: TActions, handlers: {
  [K in keyof TActions]: (action: ReturnType<TActions[K]>) => SagaIterator
}, others?: (takeEvery: typeof saferTakeEvery) => SagaIterator): () => SagaIterator {
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
  fn: (action: ReturnType<Action>) => Generator<StrictEffect<any>>
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
